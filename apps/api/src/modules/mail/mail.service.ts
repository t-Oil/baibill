import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
const Mailjet = require('node-mailjet');
import { EmailTemplateRepository } from '@repositories/email-template.repository';
import { EmailTemplateType } from '@entities/email-template.entity';

/**
 * Email recipient interface.
 */
interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email options interface.
 */
interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: number;
  variables?: Record<string, any>;
}

/**
 * Service for sending emails via Mailjet.
 */
@Injectable()
export class MailService {
  private mailjet: any;
  private fromEmail: string;
  private fromName: string;
  private isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(EmailTemplateRepository)
    private readonly templateRepository: EmailTemplateRepository,
  ) {
    const apiKey = this.configService.get<string>('mail.apiKey');
    const apiSecret = this.configService.get<string>('mail.apiSecret');

    this.isEnabled = !!(apiKey && apiSecret);

    if (this.isEnabled) {
      this.mailjet = Mailjet.apiConnect(apiKey, apiSecret);
    }

    this.fromEmail = this.configService.get<string>('mail.fromEmail');
    this.fromName = this.configService.get<string>('mail.fromName');
  }

  /**
   * Checks if mail service is enabled.
   * @returns True if Mailjet credentials are configured
   */
  isMailEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Sends an email via Mailjet.
   * @param options Email options
   * @returns Send result or null if disabled
   */
  async send(options: SendEmailOptions): Promise<any> {
    if (!this.isEnabled) {
      return null;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const message: any = {
      From: {
        Email: this.fromEmail,
        Name: this.fromName,
      },
      To: recipients.map((r) => ({
        Email: r.email,
        Name: r.name || r.email,
      })),
      Subject: options.subject,
    };

    if (options.templateId) {
      message.TemplateID = options.templateId;
      message.TemplateLanguage = true;
      if (options.variables) {
        message.Variables = options.variables;
      }
    } else {
      if (options.html) {
        message.HTMLPart = options.html;
      }
      if (options.text) {
        message.TextPart = options.text;
      }
    }

    try {
      const result = await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [message],
      });

      return result.body;
    } catch (error) {
      console.error('[MailService] Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Replaces template variables with values.
   * @param template Template string
   * @param variables Variable values
   * @returns Processed template
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  /**
   * Sends an email using a database template.
   * @param type Template type
   * @param to Recipient(s)
   * @param variables Template variables
   * @returns Send result
   */
  async sendWithTemplate(
    type: EmailTemplateType,
    to: EmailRecipient | EmailRecipient[],
    variables: Record<string, any>,
  ): Promise<any> {
    const template = await this.templateRepository.findByType(type);

    if (!template) {
      throw new Error(`[MailService] Template not found for type: ${type}`);
    }

    const subject = this.replaceVariables(template.subject, variables);
    const html = this.replaceVariables(template.htmlContent, variables);
    const text = template.textContent
      ? this.replaceVariables(template.textContent, variables)
      : undefined;

    return this.send({ to, subject, html, text });
  }
}
