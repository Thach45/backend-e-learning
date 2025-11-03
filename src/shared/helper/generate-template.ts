

export const generateTemplate = (otp: string, companyName: string, companyAddress: string) => {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã Xác Thực Của Bạn</title>
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
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; line-height: 48px; text-align: center;">
                            Mã Xác Thực Của Bạn
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">Chào bạn,</p>
                            <p style="margin: 20px 0;">Bạn vừa yêu cầu một mã xác thực cho tài khoản tại <strong>${companyName}</strong>. Vui lòng sử dụng mã dưới đây để hoàn tất quá trình.</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; margin-bottom: 20px;">
                                <tr>
                                    <td align="center" style="border-radius: 5px; background-color: #f0f8ff; padding: 20px 0;">
                                        <p style="font-size: 48px; font-weight: bold; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; margin: 0; color: #00466a;">${otp}</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0;">Mã xác thực này sẽ hết hạn trong vòng <strong>5 phút</strong>.</p>
                            <p style="margin-top: 20px;">Nếu bạn không yêu cầu mã này, có thể ai đó đã nhập nhầm email. Bạn có thể bỏ qua email này một cách an toàn.</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; border-radius: 0px 0px 4px 4px; color: #888888; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 22px;">
                            <p style="margin: 0; border-top: 1px solid #eeeeee; padding-top: 20px;"><strong>Lưu ý bảo mật:</strong> Không bao giờ chia sẻ mã này với bất kỳ ai. Đội ngũ ${companyName} sẽ không bao giờ yêu cầu bạn cung cấp mã này.</p>
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
}