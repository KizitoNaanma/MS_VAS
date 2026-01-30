import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IEmailService,
  SMTP_FROM_NAME,
  SMTP_NO_REPLY_USER_EMAIL,
  env,
  ReligionEnum,
  CHRISTIAN_PORTAL_URL,
  ISLAMIC_PORTAL_URL,
  ICELL_SERVICE_CODE,
} from 'src/common';
import { OutgoingSmsPayloadDto } from 'src/common/dto/icell';
import { IcellProductType } from 'src/common/types/product';
import { mailGenerator } from 'src/modules/utils';
import { IcellClient } from 'src/shared/icell-core/services/icell.client';

interface INotificationContent {
  name?: string;
  intro: string[];
  outro?: string;
}

interface ISendNotificationPayload {
  email?: string;
  phone?: string;
  subject: string;
  content: INotificationContent;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('Mailer') private readonly mailerService: IEmailService,
    private readonly icellClient: IcellClient,
  ) {}

  async sendNotification(payload: ISendNotificationPayload): Promise<void> {
    const { email, phone, subject, content } = payload;

    const promises: Promise<void>[] = [];

    if (email) {
      promises.push(this.sendEmail(email, subject, content));
    }

    if (phone) {
      promises.push(this.sendSms(phone, content));
    }

    await Promise.all(promises);
  }

  private async sendEmail(
    email: string,
    subject: string,
    content: INotificationContent,
  ): Promise<void> {
    try {
      const emailContent = {
        body: content,
      };

      const html = mailGenerator.generate(emailContent);

      await this.mailerService.send({
        to: email,
        subject,
        html,
        fromEmail: SMTP_NO_REPLY_USER_EMAIL,
        fromName: SMTP_FROM_NAME,
      });

      this.logger.log(`Email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw error;
    }
  }

  private async sendSms(
    phone: string,
    content: INotificationContent,
  ): Promise<void> {
    try {
      // Convert content intro array to plain text message
      const message = content.intro.join(' ').replace(/<[^>]*>/g, ''); // Remove HTML tags

      const smsPayload = new OutgoingSmsPayloadDto(message, [phone]);

      // ALWAYS log the message to the console for testing/debugging
      this.logger.log(`[SMS ${env.env.toUpperCase()}] To: ${phone} | Message: ${message}`);

      if (env.isProd) {
        await this.icellClient.sendSmsHttpRequest(smsPayload);
        this.logger.log(`SMS sent successfully to ${phone}`);
      } else {
        this.logger.log(
          '👉🏼 NotificationService ~ SMS ~ payload:',
          JSON.stringify(smsPayload),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}:`, error);
      throw error;
    }
  }

  async sendVerificationCode(
    email: string | undefined,
    phone: string | undefined,
    fullName: string,
    code: string,
  ): Promise<void> {
    await this.sendNotification({
      email,
      phone,
      subject: 'Verify your account',
      content: {
        name: fullName,
        intro: [
          'Please use this OTP to verify and login to your account:',
          `<b>${code}</b>`,
          'It is valid for 10 minutes.',
        ],
        outro: 'If you did not request this, please ignore this message.',
      },
    });
  }

  async sendPasswordResetOtp(
    email: string | undefined,
    phone: string | undefined,
    fullName: string,
    code: string,
  ): Promise<void> {
    await this.sendNotification({
      email,
      phone,
      subject: 'Password Reset OTP',
      content: {
        name: fullName,
        intro: [
          'Please use this OTP to reset your password:',
          `<b>${code}</b>`,
        ],
        outro: 'If you did not request this, please ignore this message.',
      },
    });
  }

  /**
   * Send magic link via SMS for authentication
   * Portal URL is determined based on user's religion
   */
  async sendMagicLink(
    product: IcellProductType,
    msisdn: string,
    token: string,
    religion: ReligionEnum,
    config: { type: 'subscription' | 'renewal' },
  ): Promise<void> {
    try {
      // Determine portal URL based on religion
      let portalUrl: string;
      if (religion === ReligionEnum.CHRISTIANITY) {
        portalUrl = CHRISTIAN_PORTAL_URL;
      } else if (religion === ReligionEnum.ISLAM) {
        portalUrl = ISLAMIC_PORTAL_URL;
      } else {
        throw new Error(`Invalid religion: ${religion}`);
      }

      // Construct magic link URL
      const magicLinkUrl = `${portalUrl}/auth/verify-magic-link?token=${token}`;

      // Compose SMS message
      let message = '';
      if (config.type === 'subscription') {
        message = `Dear customer, you have successfully subscribed to ${product.name}. Click this link to login to your account: ${magicLinkUrl}. This link expires in 20 minutes. To cancel dial *305#.`;
      } else if (config.type === 'renewal') {
        message = `Dear customer, click this link to login to your account: ${magicLinkUrl}. This link expires in 20 minutes. To cancel dial *305#.`;
      }

      const smsPayload = new OutgoingSmsPayloadDto(message, [msisdn]);

      // ALWAYS log the message to the console for testing/debugging
      this.logger.log(`[MAGIC LINK ${env.env.toUpperCase()}] To: ${msisdn} | Message: ${message}`);

      if (env.isProd) {
        await this.icellClient.sendSmsHttpRequest(smsPayload);
        this.logger.log(`Magic link SMS sent successfully to ${msisdn}`);
      } else {
        this.logger.log(
          '👉🏼 NotificationService ~ Magic Link SMS ~ payload:',
          JSON.stringify(smsPayload),
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send magic link SMS to ${msisdn}:`, error);
      throw error;
    }
  }

  /**
   * Send unsubscription success message via SMS to user
   */
  async sendUnsubscriptionSms(
    product: IcellProductType,
    msisdn: string,
  ): Promise<void> {
    try {
      const message = `Dear Customer, you have successfully unsubscribe from ${product.name}. You can resubscribe anytime by sending ${product.optInKeywords[0]} to ${ICELL_SERVICE_CODE}. Thank you for being a valued subscriber! To cancel dial *305#.`;
      const smsPayload = new OutgoingSmsPayloadDto(message, [msisdn]);

      if (env.isProd) {
        await this.icellClient.sendSmsHttpRequest(smsPayload);
        this.logger.log(`Unsubscription SMS sent successfully to ${msisdn}`);
      } else {
        this.logger.log(
          '👉🏼 NotificationService ~ Unsubscription SMS ~ payload:',
          JSON.stringify(smsPayload),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send unsubscription SMS to ${msisdn}:`,
        error,
      );
      throw error;
    }
  }
}
