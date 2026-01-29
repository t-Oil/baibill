import { Controller, Post, Body, Req } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { ApiResource } from '@commons/responses/api-resource';
import { Public } from '@commons/decorators/public.decorator';

/**
 * Request DTO for accepting an invitation.
 */
class AcceptInvitationRequest {
  token: string;
}

/**
 * Controller for handling invitation acceptance.
 */
@Controller('invitations')
export class InvitationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Accepts an invitation using token.
   * @param body Request body with token
   * @param req Request object for user info
   * @returns Created membership
   */
  @Post('accept')
  async acceptInvitation(
    @Body() body: AcceptInvitationRequest,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const response = await this.organizationService.acceptInvitation(body.token, userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
