import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { ApiResource } from '@commons/responses/api-resource';
import { CreateOrganizationRequest } from '../requests/create-organization.request';
import { InviteUserRequest } from '../requests/invite-user.request';
import { UpdateMemberRoleRequest } from '../requests/update-member-role.request';

/**
 * Controller for organization management endpoints.
 */
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Creates a new organization.
   * @param body Request body with name and description
   * @param req Request object for user info
   * @returns Created organization
   */
  @Post()
  async create(@Body() body: CreateOrganizationRequest, @Req() req: any): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const response = await this.organizationService.create(body.name, userId, body.description);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets all organizations for the current user.
   * @param req Request object for user info
   * @returns Array of user's organizations
   */
  @Get()
  async getMyOrganizations(@Req() req: any): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const response = await this.organizationService.getUserOrganizations(userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets available organization roles.
   * @returns Array of roles
   */
  @Get('roles')
  async getRoles(): Promise<ApiResource> {
    try {
      const response = await this.organizationService.getRoles();
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets organization details by UID.
   * @param uid Organization UID
   * @returns Organization details
   */
  @Get(':uid')
  async getByUid(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.organizationService.getByUid(uid);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Updates an organization.
   * @param uid Organization UID
   * @param body Request body with updates
   * @returns Updated organization
   */
  @Patch(':uid')
  async update(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() body: CreateOrganizationRequest,
  ): Promise<ApiResource> {
    try {
      const response = await this.organizationService.update(uid, body.name, body.description);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets organization members.
   * @param uid Organization UID
   * @returns Array of members
   */
  @Get(':uid/members')
  async getMembers(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const org = await this.organizationService.getByUid(uid);
      const response = await this.organizationService.getMembers(org.id);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Invites a user to the organization.
   * @param uid Organization UID
   * @param body Request body with userId and role
   * @param req Request object for user info
   * @returns Created invitation
   */
  @Post(':uid/invite')
  async invite(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() body: InviteUserRequest,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const currentUserId = req.user?.id;
      const org = await this.organizationService.getByUid(uid);

      const isAdmin = await this.organizationService.isAdmin(currentUserId, org.id);
      if (!isAdmin) {
        throw new Error('Only admins can invite users');
      }

      const response = await this.organizationService.invite(
        org.id,
        body.userId,
        body.email,
        body.roleId,
        currentUserId,
      );
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets pending invitations for the current user.
   * @param req Request object for user info
   * @returns Array of pending invitations
   */
  @Get('invitations/pending')
  async getMyPendingInvitations(@Req() req: any): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const response = await this.organizationService.getPendingInvitationsForUser(userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Accepts an invitation.
   * @param invitationUid Invitation UID
   * @param req Request object for user info
   * @returns Created membership
   */
  @Post('invitations/:invitationUid/accept')
  async acceptInvitation(
    @Param('invitationUid', new ParseUUIDPipe({ version: '4' })) invitationUid: string,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const response = await this.organizationService.acceptInvitation(invitationUid, userId);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Declines an invitation.
   * @param invitationUid Invitation UID
   * @param req Request object for user info
   * @returns Success response
   */
  @Post('invitations/:invitationUid/decline')
  async declineInvitation(
    @Param('invitationUid', new ParseUUIDPipe({ version: '4' })) invitationUid: string,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      await this.organizationService.declineInvitation(invitationUid, userId);
      return ApiResource.successResponse({ message: 'Invitation declined' });
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Gets pending invitations for an organization.
   * @param uid Organization UID
   * @returns Array of pending invitations
   */
  @Get(':uid/invitations')
  async getInvitations(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const org = await this.organizationService.getByUid(uid);
      const response = await this.organizationService.getPendingInvitations(org.id);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Updates a member's role.
   * @param uid Organization UID
   * @param userId User ID to update
   * @param body Request body with new role
   * @param req Request object for user info
   * @returns Updated membership
   */
  /**
   * Updates a member's role.
   * @param uid Organization UID
   * @param memberUid Member User UID to update
   * @param body Request body with new role
   * @param req Request object for user info
   * @returns Updated membership
   */
  @Patch(':uid/members/:memberUid')
  async updateMemberRole(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Param('memberUid', new ParseUUIDPipe({ version: '4' })) memberUid: string,
    @Body() body: UpdateMemberRoleRequest,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const currentUserId = req.user?.id;
      const org = await this.organizationService.getByUid(uid);

      const isAdmin = await this.organizationService.isAdmin(currentUserId, org.id);
      if (!isAdmin) {
        throw new Error('Only admins can update member roles');
      }

      const response = await this.organizationService.updateMemberRole(
        org.id,
        memberUid,
        body.roleId,
        currentUserId, // requesterId
      );
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Removes a member from the organization.
   * @param uid Organization UID
   * @param memberUid Member User UID to remove
   * @param req Request object for user info
   * @returns Success response
   */
  @Delete(':uid/members/:memberUid')
  async removeMember(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Param('memberUid', new ParseUUIDPipe({ version: '4' })) memberUid: string,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const currentUserId = req.user?.id;
      const org = await this.organizationService.getByUid(uid);

      const isAdmin = await this.organizationService.isAdmin(currentUserId, org.id);
      if (!isAdmin) {
        throw new Error('Only admins can remove members');
      }

      await this.organizationService.removeMember(org.id, memberUid);
      return ApiResource.successResponse({ message: 'Member removed' });
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Revokes an invitation.
   * @param uid Organization UID
   * @param invitationUid Invitation UID
   * @param req Request object for user info
   * @returns Success response
   */
  @Delete(':uid/invitations/:invitationUid')
  async revokeInvitation(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Param('invitationUid', new ParseUUIDPipe({ version: '4' })) invitationUid: string,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const org = await this.organizationService.getByUid(uid);

      const isAdmin = await this.organizationService.isAdmin(userId, org.id);
      if (!isAdmin) {
        throw new Error('Only admins can revoke invitations');
      }

      await this.organizationService.revokeInvitation(invitationUid);
      return ApiResource.successResponse({ message: 'Invitation revoked' });
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  /**
   * Resends an invitation.
   * @param uid Organization UID
   * @param invitationUid Invitation UID
   * @param req Request object for user info
   * @returns Updated invitation
   */
  @Post(':uid/invitations/:invitationUid/resend')
  async resendInvitation(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Param('invitationUid', new ParseUUIDPipe({ version: '4' })) invitationUid: string,
    @Req() req: any,
  ): Promise<ApiResource> {
    try {
      const userId = req.user?.id;
      const org = await this.organizationService.getByUid(uid);

      const isAdmin = await this.organizationService.isAdmin(userId, org.id);
      if (!isAdmin) {
        throw new Error('Only admins can resend invitations');
      }

      const response = await this.organizationService.resendInvitation(invitationUid);
      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
