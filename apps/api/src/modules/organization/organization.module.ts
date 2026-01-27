import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './controllers/organization.controller';
import { InvitationController } from './controllers/invitation.controller';
import { OrganizationService } from './services/organization.service';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';
import { OrganizationRoleRepository } from '@repositories/organization-role.repository';
import { OrganizationInvitationRepository } from '@repositories/organization-invitation.repository';
import { OrganizationEntity } from '@entities/organization.entity';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';
import { UserOrganizationEntity } from '@entities/user-organization.entity';
import { OrganizationInvitationEntity } from '@entities/organization-invitation.entity';
import { UserRepository } from '@repositories/user.repository';

/**
 * Module for organization management.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrganizationEntity,
            OrganizationRoleEntity,
            UserOrganizationEntity,
            OrganizationInvitationEntity,
        ]),
    ],
    controllers: [OrganizationController, InvitationController],
    providers: [
        OrganizationService,
        OrganizationRepository,
        UserOrganizationRepository,
        OrganizationRoleRepository,
        OrganizationInvitationRepository,
        UserRepository,
    ],
})
export class OrganizationModule { }
