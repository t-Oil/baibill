import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

export class ReceiptException extends ApiException {
  static notFound(error?: string[]): ApiException {
    throw new ApiException(200001, error, HttpStatus.NOT_FOUND);
  }

  static createError(error?: string[]): ApiException {
    throw new ApiException(200002, error, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static duplicateError(error?: string[]): ApiException {
    throw new ApiException(200008, error, HttpStatus.CONFLICT);
  }

  static updateError(error?: string[]): ApiException {
    throw new ApiException(200003, error, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static deleteError(error?: string[]): ApiException {
    throw new ApiException(200004, error, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static invalidImage(error?: string[]): ApiException {
    throw new ApiException(200005, error, HttpStatus.BAD_REQUEST);
  }

  static ocrServiceError(error?: string[]): ApiException {
    throw new ApiException(200006, error, HttpStatus.SERVICE_UNAVAILABLE);
  }

  static parseError(error?: string[]): ApiException {
    throw new ApiException(200007, error, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
