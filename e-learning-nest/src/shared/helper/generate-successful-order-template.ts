export interface InvoiceCourseItem {
  title: string;
  price: number;
  instructorName?: string;
}

export const generateSuccessfulOrderTemplate = (
  customerName: string,
  orderId: string,
  orderDate: string,
  paymentMethod: string,
  courses: InvoiceCourseItem[],
  totalAmount: number,
  myCoursesUrl: string,
  companyName: string = "U Đê Mê",
  companyAddress: string = "123 Nguyen Van Linh, Q9, TP.HCM"
) => {
  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const courseRowsHtml = courses
    .map(
      (course) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #1e293b; text-align: left;">
          <div style="font-weight: 600;">${course.title}</div>
          ${course.instructorName ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Giảng viên: ${course.instructorName}</div>` : ''}
        </td>
        <td style="padding: 12px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #1e293b; text-align: right;">
          ${formatVND(course.price)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận thanh toán thành công - Hóa đơn đơn hàng</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    </style>
</head>
<body style="background-color: #f4f5f7; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#f4f5f7" align="center" style="padding: 24px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#4f46e5" align="center" style="padding: 32px 20px; color: #ffffff;">
                            <h1 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 1px;">U Đê Mê</h1>
                            <p style="margin: 8px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; color: #e0e7ff;">Xác Nhận Thanh Toán & Kích Hoạt Khóa Học</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td bgcolor="#ffffff" style="padding: 32px 24px;">
                            <p style="margin: 0 0 16px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #334155;">
                                Chào <strong>${customerName}</strong>,
                            </p>
                            <p style="margin: 0 0 24px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color: #475569;">
                                Chúc mừng bạn đã thanh toán thành công! Giao dịch của bạn đã được đối soát tự động. Các khóa học bạn đăng ký hiện đã được kích hoạt hoàn toàn trong tài khoản của bạn.
                            </p>
                            
                            <!-- Bảng thông tin đơn hàng -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b;"><strong>Mã đơn hàng:</strong></td>
                                        <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: bold;">${orderId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b;"><strong>Ngày thanh toán:</strong></td>
                                        <td style="padding: 4px 0; text-align: right; color: #0f172a;">${orderDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b;"><strong>Phương thức:</strong></td>
                                        <td style="padding: 4px 0; text-align: right; color: #0f172a;">${paymentMethod}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #64748b;"><strong>Trạng thái:</strong></td>
                                        <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold;">ĐÃ THANH TOÁN</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Bảng khóa học -->
                            <h3 style="margin: 0 0 12px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Chi tiết học liệu đăng ký</h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                ${courseRowsHtml}
                            </table>
                            
                            <!-- Tổng tiền -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;">
                                <tr>
                                    <td style="padding: 4px 0; color: #64748b; text-align: right;">Tạm tính:</td>
                                    <td style="padding: 4px 0; width: 120px; text-align: right; color: #334155; font-weight: bold;">${formatVND(totalAmount)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #10b981; text-align: right;">Giảm giá:</td>
                                    <td style="padding: 4px 0; width: 120px; text-align: right; color: #10b981; font-weight: bold;">-0 đ</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 4px 0; font-size: 16px; color: #0f172a; font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">Tổng thanh toán:</td>
                                    <td style="padding: 12px 0 4px 0; font-size: 18px; color: #4f46e5; font-weight: bold; text-align: right; border-top: 1px solid #e2e8f0;">${formatVND(totalAmount)}</td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center">
                                        <a href="${myCoursesUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">VÀO HỌC NGAY</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color: #64748b; text-align: center;">
                                Bạn đã sẵn sàng nâng cấp bản thân chưa? Bấm nút ở trên để truy cập và bắt đầu bài học đầu tiên ngay nhé!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#f8fafc" align="center" style="padding: 24px 20px; border-top: 1px solid #e2e8f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; text-align: center; line-height: 18px;">
                            <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">© ${new Date().getFullYear()} ${companyName}. Đã đăng ký bản quyền.</p>
                            <p style="margin: 0 0 8px 0;">${companyAddress}</p>
                            <p style="margin: 0;">Mọi thắc mắc xin vui lòng gửi email về <a href="mailto:support@learnhub.com" style="color: #4f46e5; text-decoration: none;">support@learnhub.com</a> hoặc liên hệ hotline chăm sóc khách hàng.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
