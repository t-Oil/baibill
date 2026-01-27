import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';
import { OrganizationRoleRepository } from '@repositories/organization-role.repository';
import { OrganizationInvitationRepository } from '@repositories/organization-invitation.repository';
import { UserRepository } from '@repositories/user.repository';
import { OrganizationEntity } from '@entities/organization.entity';
import { UserOrganizationEntity } from '@entities/user-organization.entity';
import { OrganizationInvitationEntity, InvitationStatus } from '@entities/organization-invitation.entity';
import { OrganizationException } from '@exceptions/app/organization.exception';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

/**
 * Service for organization management operations.
 * Handles CRUD, member management, and invitations.
 */
@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(OrganizationRepository)
        private readonly organizationRepository: OrganizationRepository,
        @InjectRepository(UserOrganizationRepository)
        private readonly userOrganizationRepository: UserOrganizationRepository,
        @InjectRepository(OrganizationRoleRepository)
        private readonly roleRepository: OrganizationRoleRepository,
        @InjectRepository(OrganizationInvitationRepository)
        private readonly invitationRepository: OrganizationInvitationRepository,
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    /**
     * Creates a new organization. Creator becomes admin.
     * @param name Organization name
     * @param userId Creator user ID
     * @param description Optional description
     * @returns Created organization
     */
    async create(
        name: string,
        userId: number,
        description?: string,
    ): Promise<OrganizationEntity> {
        const organization = this.organizationRepository.create({
            name,
            description,
            createdBy: userId,
        });

        const savedOrg = await this.organizationRepository.save(organization);

        const adminRole = await this.roleRepository.findOne({
            where: { name: 'admin' },
        });

        if (!adminRole) {
            OrganizationException.adminRoleNotFound(['Admin role not found in database']);
        }

        const membership = this.userOrganizationRepository.create({
            userId,
            organizationId: savedOrg.id,
            roleId: adminRole.id,
        });

        await this.userOrganizationRepository.save(membership);

        return savedOrg;
    }

    /**
     * Gets all organizations for a user.
     * @param userId User ID
     * @returns Array of user's organizations with their role
     */
    async getUserOrganizations(userId: number): Promise<UserOrganizationEntity[]> {
        return this.userOrganizationRepository.find({
            where: {
                userId,
                isActive: ActiveStatusEnum.ACTIVE,
            },
            relations: ['organization', 'role'],
        });
    }

    /**
     * Gets an organization by UID.
     * @param uid Organization UID
     * @returns Organization entity
     */
    async getByUid(uid: string): Promise<OrganizationEntity> {
        const org = await this.organizationRepository.findOne({
            where: { uid, isActive: ActiveStatusEnum.ACTIVE },
            relations: ['members', 'members.user', 'members.role'],
        });

        if (!org) {
            OrganizationException.notFound(['Organization not found']);
        }

        return org;
    }

    /**
     * Updates an organization.
     * @param uid Organization UID
     * @param name New name
     * @param description New description
     * @returns Updated organization
     */
    async update(
        uid: string,
        name?: string,
        description?: string,
    ): Promise<OrganizationEntity> {
        const org = await this.getByUid(uid);

        if (name) org.name = name;
        if (description !== undefined) org.description = description;

        return this.organizationRepository.save(org);
    }

    /**
     * Checks if a user has a specific role in an organization.
     * @param userId User ID
     * @param organizationId Organization ID
     * @param roleName Role name to check
     * @returns True if user has the role
     */
    async hasRole(
        userId: number,
        organizationId: number,
        roleName: string,
    ): Promise<boolean> {
        const membership = await this.userOrganizationRepository.findOne({
            where: {
                userId,
                organizationId,
                isActive: ActiveStatusEnum.ACTIVE,
            },
            relations: ['role'],
        });

        return membership?.role?.name === roleName;
    }

    /**
     * Checks if user is admin of organization.
     * @param userId User ID
     * @param organizationId Organization ID
     * @returns True if user is admin
     */
    async isAdmin(userId: number, organizationId: number): Promise<boolean> {
        return this.hasRole(userId, organizationId, 'admin');
    }

    /**
     * Invites a user to an organization by userId OR email.
     * @param organizationId Organization ID
     * @param userId User ID to invite (optional if email provided)
     * @param email Email address to invite (optional if userId provided)
     * @param roleId Role ID to assign
     * @param invitedById User ID of inviter
     * @returns Created invitation
     */
    async invite(
        organizationId: number,
        userId: number | undefined,
        email: string | undefined,
        roleId: number,
        invitedById: number,
    ): Promise<OrganizationInvitationEntity> {
        // Validate that at least one identifier is provided
        if (!userId && !email) {
            OrganizationException.createError(['Either userId or email must be provided']);
        }

        let targetUserId: number | undefined = userId;
        let targetEmail: string | undefined = email?.toLowerCase();

        // If email provided, check if user already exists
        if (email) {
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                targetUserId = existingUser.id;
                // Clear email if user exists (invitation will be userId-based)
                targetEmail = undefined;
            }
        }

        // Check if user is already a member (if we have userId)
        if (targetUserId) {
            const existingMember = await this.userOrganizationRepository.findOne({
                where: { userId: targetUserId, organizationId },
            });
            if (existingMember) {
                OrganizationException.alreadyMember(['User is already a member of this organization']);
            }

            // Check for pending invitation by userId
            const existingInvite = await this.invitationRepository.findOne({
                where: {
                    organizationId,
                    userId: targetUserId,
                    status: InvitationStatus.PENDING,
                },
            });
            if (existingInvite) {
                OrganizationException.invitationExists(['Invitation already sent to this user']);
            }
        } else if (targetEmail) {
            // Check for pending invitation by email
            const existingInvite = await this.invitationRepository.findPendingByEmail(
                targetEmail,
                organizationId,
            );
            if (existingInvite) {
                OrganizationException.invitationExists(['Invitation already sent to this email']);
            }
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        const invitation = this.invitationRepository.create({
            organizationId,
            userId: targetUserId,
            email: targetEmail,
            roleId,
            invitedById,
            expiresAt,
        });

        return this.invitationRepository.save(invitation);
    }

    /**
     * Gets pending invitations for a user.
     * @param userId User ID
     * @returns Array of pending invitations
     */
    async getPendingInvitationsForUser(userId: number): Promise<OrganizationInvitationEntity[]> {
        return this.invitationRepository.find({
            where: {
                userId,
                status: InvitationStatus.PENDING,
            },
            relations: ['organization', 'role', 'inviter'],
        });
    }

    /**
     * Accepts an invitation by invitation UID.
     * Handles both userId-based and email-based invitations.
     * @param invitationUid Invitation UID
     * @param userId User accepting the invitation
     * @returns Created membership
     */
    async acceptInvitation(
        invitationUid: string,
        userId: number,
    ): Promise<UserOrganizationEntity> {
        // Find invitation by UID and either userId or pending email-based
        const invitation = await this.invitationRepository.findOne({
            where: {
                uid: invitationUid,
                status: InvitationStatus.PENDING,
            },
        });

        if (!invitation) {
            OrganizationException.invitationNotFound(['Invitation not found']);
        }

        // Verify invitation belongs to this user
        if (invitation.userId && invitation.userId !== userId) {
            OrganizationException.invitationNotFound(['Invitation not found or not for this user']);
        }

        // If invitation is email-based, link userId
        if (!invitation.userId && invitation.email) {
            // Verify email matches the user's email
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
                OrganizationException.invitationNotFound(['Invitation not found or not for this user']);
            }

            // Link userId to invitation
            invitation.userId = userId;
            invitation.email = null;
            await this.invitationRepository.save(invitation);
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = InvitationStatus.EXPIRED;
            await this.invitationRepository.save(invitation);
            OrganizationException.invitationExpired(['Invitation has expired']);
        }

        const existingMembership = await this.userOrganizationRepository.findOne({
            where: {
                userId,
                organizationId: invitation.organizationId,
            },
        });

        if (existingMembership) {
            OrganizationException.alreadyMember(['User is already a member of this organization']);
        }

        const membership = this.userOrganizationRepository.create({
            userId,
            organizationId: invitation.organizationId,
            roleId: invitation.roleId,
            invitedBy: invitation.invitedById,
        });

        const savedMembership = await this.userOrganizationRepository.save(membership);

        invitation.status = InvitationStatus.ACCEPTED;
        invitation.acceptedAt = new Date();
        await this.invitationRepository.save(invitation);

        return savedMembership;
    }

    /**
     * Declines an invitation by invitation UID.
     * @param invitationUid Invitation UID
     * @param userId User declining the invitation
     */
    async declineInvitation(invitationUid: string, userId: number): Promise<void> {
        const invitation = await this.invitationRepository.findOne({
            where: {
                uid: invitationUid,
                status: InvitationStatus.PENDING,
            },
        });

        if (!invitation) {
            OrganizationException.invitationNotFound(['Invitation not found']);
        }

        // Verify invitation belongs to this user
        if (invitation.userId && invitation.userId !== userId) {
            OrganizationException.invitationNotFound(['Invitation not found or not for this user']);
        }

        // If email-based, verify email matches
        if (!invitation.userId && invitation.email) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
                OrganizationException.invitationNotFound(['Invitation not found or not for this user']);
            }
        }

        invitation.status = InvitationStatus.DECLINED;
        await this.invitationRepository.save(invitation);
    }

    /**
     * Gets organization members.
     * @param organizationId Organization ID
     * @returns Array of members with their roles
     */
    async getMembers(organizationId: number): Promise<UserOrganizationEntity[]> {
        return this.userOrganizationRepository.find({
            where: {
                organizationId,
                isActive: ActiveStatusEnum.ACTIVE,
            },
            relations: ['user', 'role'],
        });
    }

    /**
     * Updates a member's role.
     * @param organizationId Organization ID
     * @param userId User ID to update
     * @param roleId New role ID
     * @returns Updated membership
     */
    async updateMemberRole(
        organizationId: number,
        userId: number,
        roleId: number,
    ): Promise<UserOrganizationEntity> {
        const membership = await this.userOrganizationRepository.findOne({
            where: { organizationId, userId },
        });

        if (!membership) {
            OrganizationException.memberNotFound(['Member not found']);
        }

        membership.roleId = roleId;
        return this.userOrganizationRepository.save(membership);
    }

    /**
     * Removes a member from organization.
     * @param organizationId Organization ID
     * @param userId User ID to remove
     */
    async removeMember(organizationId: number, userId: number): Promise<void> {
        const membership = await this.userOrganizationRepository.findOne({
            where: { organizationId, userId },
        });

        if (!membership) {
            OrganizationException.memberNotFound(['Member not found']);
        }

        membership.isActive = ActiveStatusEnum.IN_ACTIVE;
        await this.userOrganizationRepository.save(membership);
    }

    /**
     * Gets pending invitations for an email address.
     * Used during registration to show user pending org invitations.
     * @param email Email address
     * @returns Array of pending invitations
     */
    async getPendingInvitationsByEmail(email: string): Promise<OrganizationInvitationEntity[]> {
        return this.invitationRepository.findAllPendingByEmail(email.toLowerCase());
    }

    /**
     * Links a userId to email-based invitations after user registration.
     * @param email User's email
     * @param userId User's ID
     * @returns Number of invitations updated
     */
    async linkUserToEmailInvitations(email: string, userId: number): Promise<number> {
        const pendingInvitations = await this.invitationRepository.findAllPendingByEmail(
            email.toLowerCase(),
        );

        for (const invitation of pendingInvitations) {
            invitation.userId = userId;
            invitation.email = null; // Clear email once userId is linked
            await this.invitationRepository.save(invitation);
        }

        return pendingInvitations.length;
    }

    /**
     * Gets pending invitations for an organization.
     * @param organizationId Organization ID
     * @returns Array of pending invitations
     */
    async getPendingInvitations(
        organizationId: number,
    ): Promise<OrganizationInvitationEntity[]> {
        return this.invitationRepository.find({
            where: {
                organizationId,
                status: InvitationStatus.PENDING,
            },
            relations: ['role', 'inviter', 'user'],
        });
    }

    /**
     * Revokes an invitation.
     * @param invitationUid Invitation UID
     */
    async revokeInvitation(invitationUid: string): Promise<void> {
        const invitation = await this.invitationRepository.findOne({
            where: { uid: invitationUid, status: InvitationStatus.PENDING },
        });

        if (!invitation) {
            OrganizationException.invitationNotFound(['Invitation not found']);
        }

        invitation.status = InvitationStatus.REVOKED;
        await this.invitationRepository.save(invitation);
    }

    /**
     * Checks if user is member of organization.
     * @param userId User ID
     * @param organizationId Organization ID
     * @returns True if user is a member
     */
    async isMember(userId: number, organizationId: number): Promise<boolean> {
        const membership = await this.userOrganizationRepository.findOne({
            where: {
                userId,
                organizationId,
                isActive: ActiveStatusEnum.ACTIVE,
            },
        });

        return !!membership;
    }

    /**
     * Checks if user is member of organization by UID.
     * @param userId User ID
     * @param organizationUid Organization UID
     * @returns True if user is a member
     */
    async isMemberByUid(userId: number, organizationUid: string): Promise<boolean> {
        const org = await this.organizationRepository.findOne({
            where: { uid: organizationUid, isActive: ActiveStatusEnum.ACTIVE },
        });

        if (!org) return false;

        return this.isMember(userId, org.id);
    }

    /**
     * Gets organization ID from UID.
     * @param uid Organization UID
     * @returns Organization ID or null if not found
     */
    async getIdByUid(uid: string): Promise<number | null> {
        const org = await this.organizationRepository.findOne({
            where: { uid, isActive: ActiveStatusEnum.ACTIVE },
        });

        return org?.id ?? null;
    }

    /**
     * Gets all available organization roles.
     * @returns Array of roles
     */
    async getRoles() {
        return this.roleRepository.find();
    }
}
