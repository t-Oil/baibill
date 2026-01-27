import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '@entities/user.entity';
import { OrganizationEntity } from '@entities/organization.entity';
import { UserOrganizationEntity } from '@entities/user-organization.entity';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';

export default class AdminOrganizationSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(UserEntity);
        const orgRepository = dataSource.getRepository(OrganizationEntity);
        const userOrgRepository = dataSource.getRepository(UserOrganizationEntity);
        const orgRoleRepository = dataSource.getRepository(OrganizationRoleEntity);

        // Find Admin User
        const adminUser = await userRepository.findOne({
            where: { email: 'admin@example.com' },
            relations: ['organizations'],
        });

        if (!adminUser) {
            return;
        }

        if (adminUser.organizations && adminUser.organizations.length > 0) {
            return;
        }

        // Get Admin Role
        const orgAdminRole = await orgRoleRepository.findOne({
            where: { name: 'admin' },
        });

        if (!orgAdminRole) {
            console.error('Organization Admin role not found');
            return;
        }

        // Create Default Organization
        const defaultOrg = orgRepository.create({
            uid: uuidv4(),
            name: 'Default Organization',
            description: 'Default organization for admin',
            createdBy: adminUser.id,
        });

        const savedOrg = await orgRepository.save(defaultOrg);

        // Assign User to Org
        const userOrg = userOrgRepository.create({
            userId: adminUser.id,
            organizationId: savedOrg.id,
            roleId: orgAdminRole.id, // Using roleId fk
            invitedBy: adminUser.id,
        });

        await userOrgRepository.save(userOrg);

    }
}
