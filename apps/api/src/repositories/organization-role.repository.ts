import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';

/**
 * Repository for organization role operations.
 */
@Injectable()
export class OrganizationRoleRepository extends BaseRepository<OrganizationRoleEntity> {
    constructor(private dataSource: DataSource) {
        super(OrganizationRoleEntity, dataSource.createEntityManager());
    }
}
