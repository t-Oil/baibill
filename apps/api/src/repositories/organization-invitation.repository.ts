import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import {
  OrganizationInvitationEntity,
  InvitationStatus,
} from '@entities/organization-invitation.entity';

/**
 * Repository for organization invitation operations.
 */
@Injectable()
export class OrganizationInvitationRepository extends BaseRepository<OrganizationInvitationEntity> {
  constructor(private dataSource: DataSource) {
    super(OrganizationInvitationEntity, dataSource.createEntityManager());
  }

  /**
   * Finds pending invitation by email (case-insensitive).
   * @param email Email address
   * @param organizationId Organization ID
   * @returns Invitation entity or null
   */
  async findPendingByEmail(
    email: string,
    organizationId: number,
  ): Promise<OrganizationInvitationEntity | null> {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
        organizationId,
        status: InvitationStatus.PENDING,
      },
    });
  }

  /**
   * Finds all pending invitations for an email address.
   * @param email Email address
   * @returns Array of pending invitations
   */
  async findAllPendingByEmail(email: string): Promise<OrganizationInvitationEntity[]> {
    return this.find({
      where: {
        email: email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
      relations: ['organization', 'role', 'inviter'],
    });
  }
}
