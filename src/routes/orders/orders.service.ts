import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepo } from './orders.repo';
import { CreateOrderBody, GetOrdersQuery, UpdateOrderStatusBody } from './orders.model';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private readonly repo: OrdersRepo) {}

    async createOrder(body: CreateOrderBody, userId: string) {
        return this.repo.createOrder(userId, body);
    }
    async getQrCode(orderId: string, userId: string) {
        const order = await this.repo.getOrderById(orderId, userId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        const acc = process.env.SO_TAI_KHOAN;
        const bank = process.env.NGAN_HANG;
        const amount = order.totalAmount;
        const des = `OrderID ${order.id}`;
        const qrCodeUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
        console.log(qrCodeUrl);
        return {
            qrCodeUrl,
            accountNumber: acc,
            bankName: bank,
            amount: order.totalAmount,
            description: des,
            orderId: order.id,
        };
    }

    async getOrders(query: GetOrdersQuery, userId?: string) {

        return this.repo.getOrders(query, userId);
    }

    async getOrderById(orderId: string, userId?: string) {
        return this.repo.getOrderById(orderId, userId);
    }

    async payOrder(orderId: string, userId: string) {
        const order = await this.repo.getOrderById(orderId, userId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not pending');
        }

        try {
            const expectedOrderNumber = `OrderID ${order.id}`;
            const expectedAmount = order.totalAmount;
            const sepayAccountNumber = process.env.SO_TAI_KHOAN;
            const sepayApiToken = process.env.SEPAY_API_KEY;

            console.log('=== PAYMENT CHECK DEBUG START ===');
            console.log('Order ID:', order.id);
            console.log('Expected Order Number:', expectedOrderNumber);
            console.log('Expected Amount:', expectedAmount);
            console.log('Order Status:', order.status);

            if (!sepayAccountNumber || !sepayApiToken) {
                throw new BadRequestException('SePay configuration is missing');
            }

            // Gọi SePay API để lấy danh sách giao dịch
            const url = `https://my.sepay.vn/userapi/transactions/list?account_number=${sepayAccountNumber}&limit=20`;
            
            console.log('Calling SePay API:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sepayApiToken}`,
                },
            });
          
            if (!response.ok) {
                console.error('SePay API error:', response.status, response.statusText);
                throw new BadRequestException(`SePay API error: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('SePay API Response Status:', responseData);
            
            
            // Parse JSON response để tìm transaction
            if (responseData && responseData.transactions) {
                const transactions = responseData.transactions;
                console.log(`Processing ${transactions.length} transactions...`);
                
                for (let i = 0; i < transactions.length; i++) {
                    const transaction = transactions[i];
                    const transactionContent = transaction.transaction_content;
                    const amountInStr = transaction.amount_in;

                    console.log(`\n--- Transaction ${i + 1} ---`);
                    console.log('Transaction Content:', transactionContent);
                    console.log('Amount In:', amountInStr);
                    console.log('Transaction Date:', transaction.transaction_date);

                    // Kiểm tra transaction_content có chứa OrderID
                    if (transactionContent) {
                        // Tìm pattern "OrderID " + UUID bằng regex (case insensitive)
                        // UUID có thể là format chuẩn hoặc 32 ký tự liền nhau
                        const pattern = /orderid\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{32})/i;
                        const matcher = transactionContent.match(pattern);
                        
                        console.log('Regex Match Result:', matcher ? 'MATCHED' : 'NO MATCH');
                        
                        if (matcher) {
                            let extractedUuid = matcher[1].toLowerCase(); // Normalize to lowercase
                            console.log('Extracted UUID (raw):', extractedUuid);
                            console.log('Extracted UUID length:', extractedUuid.length);
                            
                            // Chuyển extracted UUID về format chuẩn để so sánh
                            let normalizedExtractedUuid: string;
                            if (extractedUuid.length === 32) {
                                // Chuyển từ 32 ký tự thành format chuẩn: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                                normalizedExtractedUuid = 
                                    extractedUuid.substring(0, 8) + '-' +
                                    extractedUuid.substring(8, 12) + '-' +
                                    extractedUuid.substring(12, 16) + '-' +
                                    extractedUuid.substring(16, 20) + '-' +
                                    extractedUuid.substring(20, 32);
                                console.log('Normalized UUID (from 32 chars):', normalizedExtractedUuid);
                            } else {
                                normalizedExtractedUuid = extractedUuid.toLowerCase();
                                console.log('Normalized UUID (already formatted):', normalizedExtractedUuid);
                            }
                            
                            // Normalize order.id to lowercase for comparison
                            const normalizedOrderId = order.id.toLowerCase();
                            
                            console.log('--- UUID Comparison ---');
                            console.log('Normalized Extracted UUID:', normalizedExtractedUuid);
                            console.log('Normalized Order ID:', normalizedOrderId);
                            console.log('UUID Match:', normalizedExtractedUuid === normalizedOrderId);
                            
                            // So khớp UUID với order ID (case insensitive)
                            if (normalizedExtractedUuid === normalizedOrderId) {
                                console.log('✅ UUID MATCHES! Checking amount...');
                                
                                // Kiểm tra số tiền
                                if (amountInStr) {
                                    try {
                                        const amountIn = parseFloat(amountInStr);
                                        const expectedAmountInVND = expectedAmount;
                                        
                                        console.log('--- Amount Comparison ---');
                                        console.log('Amount In (from transaction):', amountIn);
                                        console.log('Expected Amount:', expectedAmountInVND);
                                        console.log('Amount Difference:', Math.abs(amountIn - expectedAmountInVND));
                                        console.log('Amount Match (< 1 VND difference):', Math.abs(amountIn - expectedAmountInVND) < 1);
                                        
                                        // So sánh số tiền (cho phép sai số nhỏ do làm tròn)
                                        if (Math.abs(amountIn - expectedAmountInVND) < 1) {
                                            console.log('✅✅✅ FOUND MATCHING PAYMENT! ✅✅✅');
                                            console.log(`Order: ${orderId}, Amount: ${amountIn}`);
                                            
                                            // Update order status và tạo enrollments
                                            return await this.repo.payOrder(orderId, userId);
                                        } else {
                                            console.log('❌ Order ID matches but amount does NOT match');
                                            console.log(`Expected: ${expectedAmountInVND}, Got: ${amountIn}, Difference: ${Math.abs(amountIn - expectedAmountInVND)}`);
                                        }
                                    } catch (e) {
                                        console.error('❌ Error parsing amount:', e);
                                    }
                                } else {
                                    console.log('❌ No amount_in in transaction');
                                }
                            } else {
                                console.log('❌ UUID does NOT match');
                            }
                        } else {
                            console.log('❌ No OrderID pattern found in transaction content');
                        }
                    } else {
                        console.log('❌ No transaction_content');
                    }
                }
            } else {
                console.log('❌ No transactions in response data');
                console.log('Response structure:', JSON.stringify(responseData, null, 2));
            }
            
            console.log('\n=== PAYMENT CHECK DEBUG END ===');
            
            // Không tìm thấy transaction matching
            throw new BadRequestException('Payment not found. Please check your transaction or try again later.');
            
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error calling SePay API:', error);
            throw new BadRequestException('Error checking payment status. Please try again later.');
        }
    }

    async updateOrderStatus(orderId: string, body: UpdateOrderStatusBody, userId?: string) {
        return this.repo.updateOrderStatus(orderId, body.status as OrderStatus, userId);
    }
}
