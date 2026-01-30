import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, ISendEmail } from 'src/common';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from 'src/common';
import nodemailer, { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService implements IEmailService {
  private smtpTransporter: Transporter;
  private readonly logger = new Logger(MailerService.name);
  constructor() {
    this.smtpTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Test the connection
    // this.testConnection();
  }

  // private async testConnection() {
  //   try {
  //     await this.smtpTransporter.verify();
  //     this.logger.log('SMTP connection successful');
  //   } catch (error) {
  //     this.logger.error('SMTP connection failed:', error);
  //     throw error; // This will help identify issues during service initialization
  //   }
  // }
  async send(payload: ISendEmail): Promise<void> {
    const { fromName, fromEmail, to, subject, text, html, attachments } =
      payload;
    try {
      const mailOptions: Mail.Options = {
        from: {
          name: fromName,
          address: fromEmail,
        },
        to: to,
        subject: subject,
        ...(text ? { text } : {}),
        ...(html ? { html } : {}),
        attachments,
      };

      this.smtpTransporter.sendMail(mailOptions, () => {
        this.smtpTransporter.close();
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
