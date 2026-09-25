export const generateNewLoginTemplate = (
  userName: string,
  loginTime: string,
  userAgent: string,
  ipAddress: string,
  companyName: string,
  companyAddress: string,
) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập mới vào tài khoản của bạn</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    </style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 20px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 800; line-height: 36px;">
                            Có đăng nhập mới vào tài khoản
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">Chào ${userName},</p>
                            <p style="margin: 20px 0;">Tài khoản của bạn tại <strong>${companyName}</strong> vừa được đăng nhập với thông tin sau:</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 10px; margin-bottom: 20px; border: 1px solid #eeeeee; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><strong>Thời gian:</strong> ${loginTime}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><strong>Địa chỉ IP:</strong> ${ipAddress}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 14px;"><strong>Thiết bị/Trình duyệt:</strong> ${userAgent}</td>
                                </tr>
                            </table>
                            <p style="margin: 0;">Nếu đây là bạn, không cần làm gì thêm.</p>
                            <p style="margin-top: 12px;">Nếu bạn <strong>không</strong> thực hiện đăng nhập này, hãy đổi mật khẩu ngay và kiểm tra lại danh sách thiết bị trong phần cài đặt tài khoản.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 20px 0px;">
                <p style="color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px;">
                    © 2025 ${companyName}. Đã đăng ký bản quyền.<br>
                    ${companyAddress}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};
