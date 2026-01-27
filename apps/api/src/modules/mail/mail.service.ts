import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    private frontendUrl: string;
    private apiUrl: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(EmailTemplateRepository)
        private readonly templateRepository: EmailTemplateRepository,
    ) {
        const apiKey = this.configService.get<string>('MAILJET_API_KEY');
        const apiSecret = this.configService.get<string>('MAILJET_API_SECRET');

        this.isEnabled = !!(apiKey && apiSecret);

        if (this.isEnabled) {
            this.mailjet = Mailjet.apiConnect(apiKey, apiSecret);
        }

        this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'noreply@example.com';
        this.fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Receipt OCR';
        this.frontendUrl = this.configService.get<string>('FRONTEND_APP_URL') || 'http://localhost:3000';
        this.apiUrl = this.configService.get<string>('APP_URL') || 'http://localhost:4000';
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
            const result = await this.mailjet
                .post('send', { version: 'v3.1' })
                .request({
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
            console.warn(`[MailService] Template not found for type: ${type}, using fallback`);
            return this.sendWithFallback(type, to, variables);
        }

        const subject = this.replaceVariables(template.subject, variables);
        const html = this.replaceVariables(template.htmlContent, variables);
        const text = template.textContent
            ? this.replaceVariables(template.textContent, variables)
            : undefined;

        return this.send({ to, subject, html, text });
    }

    /**
     * Sends email with fallback template when DB template not found.
     * @param type Template type
     * @param to Recipient(s)
     * @param variables Template variables
     * @returns Send result
     */
    private async sendWithFallback(
        type: EmailTemplateType,
        to: EmailRecipient | EmailRecipient[],
        variables: Record<string, any>,
    ): Promise<any> {
        switch (type) {
            case EmailTemplateType.INVITATION:
                return this.sendInvitationEmail(
                    Array.isArray(to) ? to[0].email : to.email,
                    variables.organizationName,
                    variables.inviterName,
                    variables.roleName,
                    variables.inviteLink,
                );
            case EmailTemplateType.WELCOME:
                return this.sendWelcomeEmail(
                    Array.isArray(to) ? to[0].email : to.email,
                    variables.firstName,
                );
            case EmailTemplateType.EMAIL_CONFIRMATION:
                return this.sendConfirmationEmail(
                    Array.isArray(to) ? to[0].email : to.email,
                    variables.name || '',
                    variables.link,
                );
            default:
                console.warn(`[MailService] No fallback template for type: ${type}`);
                return null;
        }
    }

    /**
     * Sends an organization invitation email.
     * @param email Recipient email
     * @param organizationName Organization name
     * @param inviterName Inviter's name
     * @param roleName Role being assigned
     * @param inviteLink Accept invitation link
     */
    async sendInvitationEmail(
        email: string,
        organizationName: string,
        inviterName: string,
        roleName: string,
        inviteLink: string,
    ): Promise<any> {
        const subject = `You've been invited to join ${organizationName}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #1a1a2e; margin: 0 0 24px; font-size: 24px; font-weight: 600;">
                    You're invited to join ${organizationName}
                </h1>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                    Hi there,
                </p>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${roleName}</strong>.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 24px 0;">
                            <a href="${inviteLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                Accept Invitation
                            </a>
                        </td>
                    </tr>
                </table>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                    If you can't click the button above, copy and paste this link into your browser:
                </p>
                <p style="color: #6366f1; font-size: 14px; word-break: break-all; margin: 8px 0 0;">
                    ${inviteLink}
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const text = `
You've been invited to join ${organizationName}

Hi there,

${inviterName} has invited you to join ${organizationName} as a ${roleName}.

Click the link below to accept the invitation:
${inviteLink}

If you didn't expect this invitation, you can safely ignore this email.
        `;

        return this.send({
            to: { email },
            subject,
            html,
            text,
        });
    }

    /**
     * Sends a welcome email to new users.
     * @param email User's email
     * @param firstName User's first name
     */
    async sendWelcomeEmail(email: string, firstName: string): Promise<any> {
        const subject = `Welcome to Receipt OCR!`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #1a1a2e; margin: 0 0 24px; font-size: 24px; font-weight: 600;">
                    Welcome to Receipt OCR, ${firstName}! 🎉
                </h1>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Your account has been created successfully. You can now start uploading and processing receipt images.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 24px 0;">
                            <a href="${this.frontendUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                Get Started
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to: { email, name: firstName },
            subject,
            html,
        });
    }

    /**
     * Sends a confirmation email to new users.
     * @param email User's email
     * @param name User's name
     * @param link Verification link
     */
    async sendConfirmationEmail(email: string, name: string, link: string): Promise<any> {
        const subject = `Verify your email address`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #1a1a2e; margin: 0 0 24px; font-size: 24px; font-weight: 600;">
                    Verify your email address
                </h1>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Hi ${name},<br><br>
                    Please verify your email address to complete your registration and start using Receipt OCR.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 24px 0;">
                            <a href="${link}" 
                               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                Verify Email
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #6366f1; font-size: 14px; word-break: break-all; margin: 8px 0 0;">
                    ${link}
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to: { email, name },
            subject,
            html,
        });
    }
}

