import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '@entities/user.entity';
import { OrganizationEntity } from '@entities/organization.entity';
import { UserOrganizationEntity } from '@entities/user-organization.entity';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';

export default class BackfillOrganizationsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(UserEntity);
    const orgRepository = dataSource.getRepository(OrganizationEntity);
    const userOrgRepository = dataSource.getRepository(UserOrganizationEntity);
    const orgRoleRepository = dataSource.getRepository(OrganizationRoleEntity);

    const orgAdminRole = await orgRoleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!orgAdminRole) {
      console.error('Organization Admin role not found. Run organization role seeder first.');
      return;
    }

    const users = await userRepository.find({
      relations: ['organizations'],
    });

    for (const user of users) {
      if (!user.organizations || user.organizations.length === 0) {
        const defaultOrg = orgRepository.create({
          uid: uuidv4(),
          name: `${user.firstName}'s Organization`,
          description: 'Personal Workspace',
          createdBy: user.id,
        });

        const savedOrg = await orgRepository.save(defaultOrg);

        const userOrg = userOrgRepository.create({
          userId: user.id,
          organizationId: savedOrg.id,
          roleId: orgAdminRole.id,
          invitedBy: user.id,
        });

        await userOrgRepository.save(userOrg);
      } else {
      }
    }
  }
}
