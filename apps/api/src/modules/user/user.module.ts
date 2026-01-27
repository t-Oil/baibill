import { Module } from '@nestjs/common';
import { UserService } from '@modules/user/services/user.service';
import { UserRepository } from '@repositories/user.repository';
import { UserController } from '@modules/user/controllers/user.controller';
import { IsDuplicateFieldConstraint } from '@commons/validators/is-duplicate-field.validator';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';
import { OrganizationRoleRepository } from '@repositories/organization-role.repository';
import { OrganizationInvitationRepository } from '@repositories/organization-invitation.repository';

/**
 * Module for user management.
 */
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    IsDuplicateFieldConstraint,
    OrganizationRepository,
    UserOrganizationRepository,
    OrganizationRoleRepository,
    OrganizationInvitationRepository,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule { }

