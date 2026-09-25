import { apiClient } from './axios';

// Types
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED';

export type OrderItem = {
  id: string;
  orderId: string;
  courseId: string;
  price: number;
  course?: {
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    salePrice?: number | null;
    instructor?: { id: string; name: string };
  };
};

export type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  couponCode?: string | null;
  discountAmount?: number;
  expiresAt?: string | null;
  status: OrderStatus;
  createdAt: string;
  orderItems: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  userId?: string;
};

export type GetOrdersResponse = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateOrderBody = {
  couponCode?: string;
};

export type UpdateOrderStatusBody = {
  status: OrderStatus;
};

// Orders API functions
export const ordersApi = {
  // Create order from cart
  createOrder: async (body: CreateOrderBody): Promise<Order> => {
    const response = await apiClient.post('/orders', body);
    return response.data.data;
  },

  // Get my orders
  getMyOrders: async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
    const response = await apiClient.get('/my-orders', { params });
    return response.data.data;
  },

  // Get order by ID
  getMyOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/my-orders/${orderId}`);
    return response.data.data;
  },

  // Pay order
  payOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.put(`/orders/${orderId}/pay`, {});
    return response.data.data;
  },

  // Admin: Get all orders
  getOrders: async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data.data;
  },

  // Admin: Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response.data.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (orderId: string, body: UpdateOrderStatusBody): Promise<Order> => {
    const response = await apiClient.put(`/admin/orders/${orderId}/status`, body);
    return response.data.data;
  },

  // Get QR code for payment
  getQrCode: async (orderId: string): Promise<{
    qrCodeUrl: string;
    accountNumber: string;
    bankName: string;
    amount: number;
    description: string;
    orderId: string;
  }> => {
    const response = await apiClient.get(`/orders/${orderId}/qr-code`);
    return response.data.data.data;
  },

  // Check payment status
  checkPayment: async (orderId: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/check-payment`, {});
    return response.data.data;
  },
};
