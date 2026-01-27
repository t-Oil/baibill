import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { EmailTemplateEntity } from '@entities/email-template.entity';
import { EmailTemplateRepository } from '@repositories/email-template.repository';

/**
 * Global module for email functionality.
 * Makes MailService available throughout the application.
 */
@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([EmailTemplateEntity]),
    ],
    providers: [MailService, EmailTemplateRepository],
    exports: [MailService],
})
export class MailModule { }

