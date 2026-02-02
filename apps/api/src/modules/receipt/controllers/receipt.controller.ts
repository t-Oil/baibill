import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from '../services/receipt.service';
import { ApiResource } from '@commons/responses/api-resource';
import { OrganizationUid } from '@commons/decorators/organization.decorator';

/**
 * Controller for receipt management endpoints.
 */
@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /**
   * Uploads and processes a receipt image.
   * @param file Uploaded file
   * @param orgUid Organization UID from x-organization-id header
   * @param req Request object for user info
   * @returns Processed receipt data
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @OrganizationUid() orgUid?: string,
    @Req() req?: any,
  ): Promise<ApiResource> {
    try {
      const userId = req?.user?.id;
      const response = await this.receiptService.processReceipt(file, orgUid, userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Export receipts to CSV or Excel.
   * @param format Export format ('csv' or 'excel')
   * @param search Search query
   * @param orgUid Organization UID from x-organization-id header
   * @param req Request object for user info
   * @param res Response object
   */
  @Get('export')
  async export(
    @Query('format') format: 'csv' | 'excel' = 'csv',
    @Query('search') search: string,
    @OrganizationUid() orgUid: string,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const userId = req?.user?.id;
      const { buffer, filename } = await this.receiptService.exportReceipts(
        format,
        search,
        orgUid,
        userId,
      );

      res.set({
        'Content-Type':
          format === 'csv'
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      const apiError = ApiResource.errorResponse(error);
      res.status(400).json(apiError);
    }
  }

  /**
   * Gets receipt statistics summary.
   * @param orgUid Organization UID from x-organization-id header
   * @param req Request object for user info
   * @returns Statistics data
   */
  @Get('stats/summary')
  async getStats(@OrganizationUid() orgUid?: string, @Req() req?: any): Promise<ApiResource> {
    try {
      const userId = req?.user?.id;
      const response = await this.receiptService.getStats(orgUid, userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets all receipts with pagination and filtering.
   * @param page Page number
   * @param limit Items per page
   * @param search Search query
   * @param orgUid Organization UID from x-organization-id header
   * @param req Request object for user info
   * @returns Paginated receipts
   */
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @OrganizationUid() orgUid?: string,
    @Req() req?: any,
  ): Promise<ApiResource> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const userId = req?.user?.id;
      const response = await this.receiptService.getAll(pageNum, limitNum, search, orgUid, userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets upload count for the current user.
   * @param req Request object for user info
   * @returns Upload count
   */
  @Get('upload/count')
  async getUploadCount(@Req() req: any): Promise<ApiResource> {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        return ApiResource.errorResponse(new Error('User not authenticated'));
      }
      const count = await this.receiptService.getUserUploadCount(userId);
      return ApiResource.successResponse({ count });
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets a receipt by UID.
   * @param uid Receipt unique identifier
   * @returns Receipt details
   */
  @Get(':uid')
  async getById(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.receiptService.getById(uid);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
