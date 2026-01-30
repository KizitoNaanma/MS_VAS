import { ISendEmail } from 'src/common/types';

export abstract class IEmailService {
  /**
   * Sends an email based on the provided payload.
   *
   * @param {Object} payload - An object containing the email sending parameters.
   * @param {string} [payload.fromEmail] - Optional. The email address from which the email will be sent.
   * @param {string} [payload.fromName] - Optional. The name associated with the sender's email address.
   * @param {string} payload.to - The recipient's email address.
   * @param {string} payload.replyTo - The reply-to email address.
   * @param {string} [payload.templateId] - Optional. The ID of the email template to use.
   * @param {string} payload.subject - The subject of the email.
   * @param {Record<string, any>} [payload.variables] - Optional. A record of key-value pairs to replace placeholders in the email template.
   * @param {string} [payload.text] - Optional. The text content of the email.
   * @param {string} [payload.html] - Optional. The HTML content of the email.
   * @param {Attachment[]} [payload.attachments] - Optional. A list of attachment URLs.
   * @returns {void}
   */
  abstract send(payload: ISendEmail): Promise<void>;
}
