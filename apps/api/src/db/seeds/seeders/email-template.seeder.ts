import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { EmailTemplateEntity, EmailTemplateType } from '@entities/email-template.entity';

/**
 * Seeder for initial email templates.
 */
export default class EmailTemplateSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const repository = dataSource.getRepository(EmailTemplateEntity);

    const templates = [
      {
        type: EmailTemplateType.INVITATION,
        name: 'Organization Invitation',
        subject: "You've been invited to join {{organizationName}}",
        htmlContent: `
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
                    You're invited to join {{organizationName}}
                </h1>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                    Hi there,
                </p>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    <strong>{{inviterName}}</strong> has invited you to join <strong>{{organizationName}}</strong> as a <strong>{{roleName}}</strong>.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 24px 0;">
                            <a href="{{inviteLink}}" 
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
                    {{inviteLink}}
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
                `,
        textContent: `
You've been invited to join {{organizationName}}

Hi there,

{{inviterName}} has invited you to join {{organizationName}} as a {{roleName}}.

Click the link below to accept the invitation:
{{inviteLink}}

If you didn't expect this invitation, you can safely ignore this email.
                `,
        variables: ['organizationName', 'inviterName', 'roleName', 'inviteLink'],
      },
      {
        type: EmailTemplateType.WELCOME,
        name: 'Welcome Email',
        subject: 'Welcome to Receipt OCR!',
        htmlContent: `
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
                    Welcome to Receipt OCR, {{firstName}}! 🎉
                </h1>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Your account has been created successfully. You can now start uploading and processing receipt images.
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 24px 0;">
                            <a href="http://localhost:3000" 
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
                `,
        textContent: `
Welcome to Receipt OCR, {{firstName}}! 🎉

Your account has been created successfully. You can now start uploading and processing receipt images.

Visit http://localhost:3000 to get started.
                `,
        variables: ['firstName'],
      },
    ];

    for (const templateData of templates) {
      const exists = await repository.findOne({
        where: { type: templateData.type },
      });

      if (!exists) {
        const template = repository.create(templateData);
        await repository.save(template);
      } else {
      }
    }
  }
}
