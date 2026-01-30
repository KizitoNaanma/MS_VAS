import { Attachment } from 'nodemailer/lib/mailer';

export type ISendEmail = {
  fromEmail: string;
  fromName?: string;
  to: string;
  replyTo?: string;
  templateId?: string;
  subject: string;
  variables?: Record<string, any>;
  text?: string;
  html?: string;
  attachments?: Attachment[];
};
