import { Injectable } from '@nestjs/common';
import { generateTemplate } from '../helper/generate-template';
import { generateSuccessfulOrderTemplate, InvoiceCourseItem } from '../helper/generate-successful-order-template';
import { generateOrderCreatedTemplate, OrderCourseItem } from '../helper/generate-order-created-template';


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
    const content = generateTemplate(otp, "U Đê Mi", "123 Nguyen Van Linh, Q9, TP.HCM");
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


  async sendSuccessfulOrder({
    recipientEmail,
    customerName,
    orderId,
    orderDate,
    courses,
    totalAmount,
    myCoursesUrl,
  }: {
    recipientEmail: string;
    customerName: string;
    orderId: string;
    orderDate: string;
    courses: OrderCourseItem[];
    totalAmount: number;
    myCoursesUrl: string;
  }) {
    const url = `${process.env.URL_EMAIL}/api/email/send`;
    const content = generateOrderCreatedTemplate(
      customerName,
      orderId,
      orderDate,
      courses,
      totalAmount,
      myCoursesUrl,
      "U Đê Mê",
      "123 Nguyen Van Linh, Q9, TP.HCM"
    );
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

  async sendSuccessfulPayment({
    recipientEmail,
    customerName,
    orderId,
    orderDate,
    paymentMethod,
    courses,
    totalAmount,
    myCoursesUrl,
  }: {
    recipientEmail: string;
    customerName: string;
    orderId: string;
    orderDate: string;
    paymentMethod: string;
    courses: InvoiceCourseItem[];
    totalAmount: number;
    myCoursesUrl: string;
  }) {
    const url = `${process.env.URL_EMAIL}/api/email/send`;
    const content = generateSuccessfulOrderTemplate(
      customerName,
      orderId,
      orderDate,
      paymentMethod,
      courses,
      totalAmount,
      myCoursesUrl,
      "U Đê Mê",
      "123 Nguyen Van Linh, Q9, TP.HCM"
    );

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