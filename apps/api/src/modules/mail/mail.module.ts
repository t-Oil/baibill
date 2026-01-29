import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailListener } from './listeners/mail.listener';
import { EmailTemplateEntity } from '@entities/email-template.entity';
import { EmailTemplateRepository } from '@repositories/email-template.repository';

/**
 * Global module for email functionality.
 * Makes MailService available throughout the application.
 */
@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EmailTemplateEntity])],
  providers: [MailService, EmailTemplateRepository, MailListener],
})
export class MailModule {}
