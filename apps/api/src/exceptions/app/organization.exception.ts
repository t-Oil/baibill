import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

/**
 * Exception class for organization-related errors.
 */
export class OrganizationException extends ApiException {
    static notFound(error?: string[]): ApiException {
        throw new ApiException(300001, error, HttpStatus.NOT_FOUND);
    }

    static createError(error?: string[]): ApiException {
        throw new ApiException(300002, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    static adminRoleNotFound(error?: string[]): ApiException {
        throw new ApiException(300003, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    static invitationExists(error?: string[]): ApiException {
        throw new ApiException(300004, error, HttpStatus.BAD_REQUEST);
    }

    static invitationNotFound(error?: string[]): ApiException {
        throw new ApiException(300005, error, HttpStatus.NOT_FOUND);
    }

    static invitationExpired(error?: string[]): ApiException {
        throw new ApiException(300006, error, HttpStatus.BAD_REQUEST);
    }

    static alreadyMember(error?: string[]): ApiException {
        throw new ApiException(300007, error, HttpStatus.BAD_REQUEST);
    }

    static memberNotFound(error?: string[]): ApiException {
        throw new ApiException(300008, error, HttpStatus.NOT_FOUND);
    }

    static unauthorized(error?: string[]): ApiException {
        throw new ApiException(300009, error, HttpStatus.FORBIDDEN);
    }
}
