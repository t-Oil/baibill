import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { UserOrganizationEntity } from '@entities/user-organization.entity';

/**
 * Repository for user-organization membership operations.
 */
@Injectable()
export class UserOrganizationRepository extends BaseRepository<UserOrganizationEntity> {
  constructor(private dataSource: DataSource) {
    super(UserOrganizationEntity, dataSource.createEntityManager());
  }
}
