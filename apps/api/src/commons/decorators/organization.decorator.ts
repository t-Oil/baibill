import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Header name for organization context.
 */
export const ORGANIZATION_HEADER = 'x-organization-id';

/**
 * Decorator to extract organization UID from request header.
 * Usage: @OrganizationUid() orgUid: string | undefined
 */
export const OrganizationUid = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[ORGANIZATION_HEADER];
  },
);
