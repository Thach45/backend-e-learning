import { Injectable } from '@nestjs/common';
import { generateTemplate } from '../helper/generate-template';


@Injectable()
export class SendEmailService {

  async sendOtpEmail({
    recipientEmail,
    otp
  }: {
    recipientEmail: string,
    otp : string,
  }) {
    const url = `${process.env.URL_EMAIL}/api/email/send`;
    const content = generateTemplate(otp, "Rock Shop", "123 Nguyen Van Linh, Q9, TP.HCM");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientEmail,
        content
      }),
    });
    const data = await response.json();
    return data;
  }
}