import { HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReceiptRepository } from '@repositories/receipt.repository';
import { ReceiptEntity } from '@entities/receipt.entity';
import { ReceiptLineItemEntity } from '@entities/receipt-line-item.entity';
import { GcpVisionService } from '@modules/ocr/gcp-vision.service';
import { ReceiptParser } from '../../ocr-core';
import { ReceiptException } from '@exceptions/app/receipt.exception';
import { ApiException } from '@exceptions/app/api.exception';
import { AiService } from '@modules/ai/ai.service';
import { Logger } from '@modules/logger/services/logger.service';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

interface ParsedReceiptData {
  merchantName: string;
  companyTaxId: string | null;
  companyAddress: string | null;
  receiptNo: string | null;
  vatIncluded: boolean;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  date: string;
  lineItems: any[];
}

interface ProcessResult {
  parsed: ParsedReceiptData;
  parsingMethod: 'ai' | 'regex';
}

@Injectable()
export class ReceiptService {
  private parser: ReceiptParser;

  constructor(
    @InjectRepository(ReceiptRepository)
    private readonly receiptRepository: ReceiptRepository,
    private readonly gcpVisionService: GcpVisionService,
    private readonly aiService: AiService,
    private readonly logger: Logger,
    @InjectRepository(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @InjectRepository(UserOrganizationRepository)
    private readonly userOrganizationRepository: UserOrganizationRepository,
  ) {
    this.parser = new ReceiptParser();
  }

  /**
   * Check if user has access to the organization by UID
   */
  private async checkAccessByUid(userId: number, orgUid?: string) {
    if (!orgUid) return;

    const org = await this.organizationRepository.findOne({
      where: { uid: orgUid, isActive: ActiveStatusEnum.ACTIVE },
    });

    if (!org) return;

    const membership = await this.userOrganizationRepository.findOne({
      where: {
        userId,
        organizationId: org.id,
        isActive: ActiveStatusEnum.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this organization');
    }
  }

  /**
   * Resolve organization UID to numeric ID
   */
  private async resolveOrgId(orgUid?: string): Promise<number | undefined> {
    if (!orgUid) return undefined;

    const org = await this.organizationRepository.findOne({
      where: { uid: orgUid, isActive: ActiveStatusEnum.ACTIVE },
    });

    return org?.id ?? undefined;
  }

  /**
   * Main entry point for processing a receipt image
   * @param file Uploaded file
   * @param orgUid Optional organization UID for multi-tenant filtering
   * @param uploadedById Optional user ID who uploaded the receipt
   */
  async processReceipt(
    file: Express.Multer.File,
    orgUid?: string,
    uploadedById?: number,
  ): Promise<ReceiptEntity> {
    try {
      // Resolve org UID to numeric ID
      const organizationId = await this.resolveOrgId(orgUid);

      // 1. Extract text from image
      const ocrText = await this.extractText(file.buffer);

      // 2. Parse receipt data (AI or regex)
      const { parsed, parsingMethod } = await this.parseReceiptData(ocrText);

      // 3. Check for duplicate receipt within the same organization
      await this.checkDuplicate(parsed.receiptNo, organizationId);

      // 4. Create and save receipt entity
      const saved = await this.createAndSaveReceipt(
        parsed,
        ocrText,
        file.filename,
        organizationId,
        uploadedById,
      );

      this.logger.log(
        `Receipt processed successfully (id: ${saved.uid}, method: ${parsingMethod}, merchant: ${saved.merchantName}, total: ${saved.totalAmount}, org: ${orgUid || 'none'})`,
      );

      return saved;
    } catch (error) {
      this.handleProcessError(error);
    }
  }

  /**
   * Extract text from image using OCR
   */
  private async extractText(buffer: Buffer): Promise<string> {
    return this.gcpVisionService.detectText(buffer);
  }

  /**
   * Parse receipt data - tries AI first, falls back to regex
   */
  private async parseReceiptData(ocrText: string): Promise<ProcessResult> {
    if (this.aiService.isEnabled()) {
      return this.parseWithAI(ocrText);
    }

    this.logger.log('Using regex parser (AI disabled)');
    return {
      parsed: this.parseWithRegex(ocrText),
      parsingMethod: 'regex',
    };
  }

  /**
   * Parse receipt using AI with regex fallback
   */
  private async parseWithAI(ocrText: string): Promise<ProcessResult> {
    this.logger.log(`Attempting AI-enhanced parsing (OCR length: ${ocrText.length})`);

    const { result: aiResult, metadata } = await this.aiService.parseReceiptWithAI(ocrText);

    if (aiResult && this.isAiResultValid(aiResult)) {
      this.logger.log(
        `AI parsing successful (confidence: ${aiResult.confidence}, model: ${metadata.model}, version: ${metadata.promptVersion})`,
      );

      return {
        parsed: this.mapAiResult(aiResult),
        parsingMethod: 'ai',
      };
    }

    // Fallback to regex if AI fails
    this.logger.log('AI parsing returned null or invalid, falling back to regex parser');
    return {
      parsed: this.parseWithRegex(ocrText),
      parsingMethod: 'regex',
    };
  }

  /**
   * Map AI result to ParsedReceiptData
   */
  private mapAiResult(aiResult: any): ParsedReceiptData {
    return {
      merchantName: aiResult.merchantName || 'Unknown Merchant',
      companyTaxId: aiResult.companyTaxId || null,
      companyAddress: aiResult.companyAddress || null,
      receiptNo: aiResult.receiptNo || null,
      vatIncluded: aiResult.vatIncluded !== undefined ? aiResult.vatIncluded : true,
      subtotal: aiResult.subtotal || 0,
      vatAmount: aiResult.vatAmount || 0,
      totalAmount: aiResult.totalAmount || 0,
      currency: aiResult.currency || 'THB',
      date: aiResult.date || new Date().toISOString().split('T')[0],
      lineItems: aiResult.lineItems || [],
    };
  }

  /**
   * Parse receipt using regex parser
   */
  private parseWithRegex(ocrText: string): ParsedReceiptData {
    const regexParsed = this.parser.parse(ocrText);

    return {
      merchantName: regexParsed.merchantName,
      companyTaxId: null,
      companyAddress: null,
      receiptNo: null,
      vatIncluded: true,
      subtotal: 0,
      vatAmount: 0,
      totalAmount: regexParsed.totalAmount,
      currency: 'THB',
      date: regexParsed.date,
      lineItems: regexParsed.lineItems || [],
    };
  }

  /**
   * Validate AI result has at least one required field
   */
  private isAiResultValid(result: any): boolean {
    return !!(result.merchantName || result.totalAmount || result.date);
  }

  /**
   * Check for duplicate receipt number within organization
   * @param receiptNo Receipt number to check
   * @param organizationId Optional organization scope
   */
  private async checkDuplicate(receiptNo: string | null, organizationId?: number): Promise<void> {
    if (!receiptNo) return;

    const whereCondition: any = { receiptNo };
    if (organizationId) {
      whereCondition.organizationId = organizationId;
    }

    const existingReceipt = await this.receiptRepository.findOne({
      where: whereCondition,
    });

    if (existingReceipt) {
      this.logger.log(
        `Duplicate receipt number detected: ${receiptNo} (existing: ${existingReceipt.uid})`,
      );
      ReceiptException.duplicateError([`Duplicate receipt number: ${receiptNo} already exists`]);
    }
  }

  /**
   * Create receipt entity with line items and save to database
   * @param parsed Parsed receipt data
   * @param ocrText Raw OCR text
   * @param filename Original filename
   * @param organizationId Optional organization ID
   * @param uploadedById Optional uploader user ID
   */
  private async createAndSaveReceipt(
    parsed: ParsedReceiptData,
    ocrText: string,
    filename: string,
    organizationId?: number,
    uploadedById?: number,
  ): Promise<ReceiptEntity> {
    const receipt = this.receiptRepository.create({
      merchantName: parsed.merchantName,
      companyTaxId: parsed.companyTaxId,
      companyAddress: parsed.companyAddress,
      receiptNo: parsed.receiptNo,
      vatIncluded: parsed.vatIncluded,
      subtotal: parsed.subtotal,
      vatAmount: parsed.vatAmount,
      totalAmount: parsed.totalAmount,
      currency: parsed.currency,
      date: parsed.date,
      rawOcrText: ocrText,
      imageUrl: filename,
      organizationId,
      uploadedById,
    });

    // Add line items if available
    if (parsed.lineItems?.length > 0) {
      receipt.lineItems = this.createLineItems(parsed.lineItems);
    }

    return this.receiptRepository.save(receipt);
  }

  /**
   * Create line item entities from parsed data
   */
  private createLineItems(items: any[]): ReceiptLineItemEntity[] {
    return items.map((item) => {
      const lineItem = new ReceiptLineItemEntity();
      lineItem.description = item.description;
      lineItem.quantity = item.quantity || 1;
      lineItem.unitPrice = item.unitPrice || item.amount;
      lineItem.amount = item.amount;
      lineItem.productCode = item.productCode || null;
      return lineItem;
    });
  }

  /**
   * Handle errors during processing
   */
  private handleProcessError(error: any): never {
    // Rethrow ApiException as-is (includes ReceiptException errors like duplicate)
    if (
      error.name === 'ApiException' ||
      error.constructor?.name === 'ApiException' ||
      error.name === 'ReceiptException' ||
      error.constructor?.name === 'ReceiptException'
    ) {
      throw error;
    }

    // Wrap other errors with generic message using ApiException
    throw new ApiException(
      200002,
      [`Failed to process receipt: ${error.message}`],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async getById(uid: string): Promise<ReceiptEntity> {
    try {
      return await this.receiptRepository.findOneOrFail({
        where: { uid },
      });
    } catch (error) {
      throw ReceiptException.notFound();
    }
  }

  /**
   * Gets all receipts with pagination and filtering
   * @param page Page number
   * @param limit Items per page
   * @param search Optional search query
   * @param orgUid Optional organization UID filter
   * @param userId Optional user ID for access check
   */
  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    orgUid?: string,
    userId?: number,
  ): Promise<any> {
    try {
      if (userId && orgUid) {
        await this.checkAccessByUid(userId, orgUid);
      }

      const organizationId = await this.resolveOrgId(orgUid);

      const skip = (page - 1) * limit;
      const queryBuilder = this.receiptRepository
        .createQueryBuilder('receipt')
        .leftJoinAndSelect('receipt.lineItems', 'lineItems')
        .orderBy('receipt.date', 'ASC')
        .skip(skip)
        .take(limit);

      if (organizationId) {
        queryBuilder.andWhere('receipt.organization_id = :organizationId', { organizationId });
      }

      if (search) {
        queryBuilder.andWhere(
          '(receipt.merchantName ILIKE :search OR receipt.receiptNo ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [receipts, total] = await queryBuilder.getManyAndCount();

      return {
        data: receipts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw ReceiptException.createError([`Failed to fetch receipts: ${error.message}`]);
    }
  }

  /**
   * Export receipts to CSV or Excel
   * @param format Export format ('csv' or 'excel')
   * @param search Search query
   * @param orgUid Organization UID filter
   * @param userId User ID for access check
   * @returns Object containing file buffer and filename
   */
  async exportReceipts(
    format: 'csv' | 'excel',
    search?: string,
    orgUid?: string,
    userId?: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      if (userId && orgUid) {
        await this.checkAccessByUid(userId, orgUid);
      }

      const organizationId = await this.resolveOrgId(orgUid);

      const queryBuilder = this.receiptRepository
        .createQueryBuilder('receipt')
        .leftJoinAndSelect('receipt.lineItems', 'lineItems')
        .orderBy('receipt.date', 'ASC');

      if (organizationId) {
        queryBuilder.andWhere('receipt.organization_id = :organizationId', { organizationId });
      }

      if (search) {
        queryBuilder.andWhere(
          '(receipt.merchantName ILIKE :search OR receipt.receiptNo ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const receipts = await queryBuilder.getMany();

      // Create workbook
      const Workbook = require('exceljs').Workbook;
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Receipts');

      // Define columns
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Merchant', key: 'merchantName', width: 25 },
        { header: 'Receipt No', key: 'receiptNo', width: 20 },
        { header: 'Total Amount', key: 'totalAmount', width: 15 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'VAT Included', key: 'vatIncluded', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 15 },
        { header: 'VAT Amount', key: 'vatAmount', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ];

      // Add rows
      receipts.forEach((receipt) => {
        worksheet.addRow({
          date: receipt.date,
          merchantName: receipt.merchantName,
          receiptNo: receipt.receiptNo || '-',
          totalAmount: Number(receipt.totalAmount),
          currency: receipt.currency,
          vatIncluded: receipt.vatIncluded ? 'Yes' : 'No',
          subtotal: Number(receipt.subtotal),
          vatAmount: Number(receipt.vatAmount),
          createdAt: receipt.createdAt.toISOString().split('T')[0],
        });
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      let buffer: Buffer;
      let filename: string;

      if (format === 'csv') {
        buffer = (await workbook.csv.writeBuffer()) as Buffer;
        filename = `receipts-${timestamp}.csv`;
      } else {
        buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
        filename = `receipts-${timestamp}.xlsx`;
      }

      return { buffer, filename };
    } catch (error) {
      throw ReceiptException.createError([`Failed to export receipts: ${error.message}`]);
    }
  }

  /**
   * Gets receipt statistics summary
   * @param orgUid Optional organization UID filter
   * @param userId Optional user ID for access check
   */
  async getStats(orgUid?: string, userId?: number): Promise<any> {
    try {
      if (userId && orgUid) {
        await this.checkAccessByUid(userId, orgUid);
      }

      const organizationId = await this.resolveOrgId(orgUid);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Helper to apply organization filter
      const applyFilter = (qb: any) => {
        if (organizationId) {
          qb.andWhere('receipt.organization_id = :organizationId', { organizationId });
        }
        return qb;
      };

      // Get total count and sum
      const totalQuery = this.receiptRepository
        .createQueryBuilder('receipt')
        .select('COUNT(*)', 'total')
        .addSelect('COALESCE(SUM(receipt.totalAmount), 0)', 'totalAmount');

      applyFilter(totalQuery);
      const totalResult = await totalQuery.getRawOne();

      // Get today's count
      const todayQuery = this.receiptRepository
        .createQueryBuilder('receipt')
        .where('receipt.date >= :todayStart', { todayStart });

      applyFilter(todayQuery);
      const todayCount = await todayQuery.getCount();

      // Get this week's count
      const weekQuery = this.receiptRepository
        .createQueryBuilder('receipt')
        .where('receipt.date >= :weekStart', { weekStart });

      applyFilter(weekQuery);
      const weekCount = await weekQuery.getCount();

      // Get this month's count
      const monthQuery = this.receiptRepository
        .createQueryBuilder('receipt')
        .where('receipt.date >= :monthStart', { monthStart });

      applyFilter(monthQuery);
      const monthCount = await monthQuery.getCount();

      const total = parseInt(totalResult.total, 10);
      const totalAmount = parseFloat(totalResult.totalAmount);
      const averageAmount = total > 0 ? totalAmount / total : 0;

      return {
        total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        totalAmount,
        averageAmount,
      };
    } catch (error) {
      throw ReceiptException.createError([`Failed to fetch stats: ${error.message}`]);
    }
  }
}
