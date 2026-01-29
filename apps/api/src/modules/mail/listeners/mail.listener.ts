import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail.service';
import {
  OrganizationInviteEvent,
  UserWelcomeEvent,
  EmailConfirmationEvent,
} from '../events/mail.events';
import { EmailTemplateType } from '@entities/email-template.entity';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent(OrganizationInviteEvent.NAME)
  async handleOrganizationInvite(event: OrganizationInviteEvent) {
    try {
      if (!this.mailService.isMailEnabled()) return;

      await this.mailService.sendWithTemplate(
        EmailTemplateType.INVITATION,
        { email: event.email },
        {
          organizationName: event.organizationName,
          inviterName: event.inviterName,
          roleName: event.roleName,
          inviteLink: event.inviteLink,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send organization invite email to ${event.email}`, error.stack);
    }
  }

  @OnEvent(UserWelcomeEvent.NAME)
  async handleUserWelcome(event: UserWelcomeEvent) {
    try {
      if (!this.mailService.isMailEnabled()) return;

      await this.mailService.sendWithTemplate(
        EmailTemplateType.WELCOME,
        { email: event.email, name: event.firstName },
        { firstName: event.firstName },
      );
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${event.email}`, error.stack);
    }
  }

  @OnEvent(EmailConfirmationEvent.NAME)
  async handleEmailConfirmation(event: EmailConfirmationEvent) {
    try {
      if (!this.mailService.isMailEnabled()) return;

      await this.mailService.sendWithTemplate(
        EmailTemplateType.EMAIL_CONFIRMATION,
        { email: event.email, name: event.name },
        {
          name: event.name,
          link: event.link,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${event.email}`, error.stack);
    }
  }
}
