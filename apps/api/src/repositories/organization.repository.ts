import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { OrganizationEntity } from '@entities/organization.entity';

/**
 * Repository for organization database operations.
 */
@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationEntity> {
  constructor(private dataSource: DataSource) {
    super(OrganizationEntity, dataSource.createEntityManager());
  }
}
