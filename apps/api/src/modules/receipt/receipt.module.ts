import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptController } from './controllers/receipt.controller';
import { ReceiptService } from './services/receipt.service';
import { ReceiptRepository } from '@repositories/receipt.repository';
import { ReceiptEntity } from '@entities/receipt.entity';
import { OcrModule } from '@modules/ocr/ocr.module';
import { AiModule } from '@modules/ai/ai.module';
import { LoggerModule } from '@modules/logger/logger.module';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';

/**
 * Module for receipt processing.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ReceiptEntity]), OcrModule, AiModule, LoggerModule],
  controllers: [ReceiptController],
  providers: [
    ReceiptService,
    ReceiptRepository,
    OrganizationRepository,
    UserOrganizationRepository,
  ],
  exports: [ReceiptService],
})
export class ReceiptModule {}
