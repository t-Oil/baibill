import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';

export default class OrganizationRoleSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        createdById?: number,
    ): Promise<void> {
        const repository = dataSource.getRepository(OrganizationRoleEntity);

        const count = await repository.count();
        if (count > 0) {
            return;
        }

        const roles = [
            { name: 'admin', description: 'Organization Administrator' },
            { name: 'member', description: 'Organization Member' },
            { name: 'viewer', description: 'Read-only Access' },
        ];

        await repository.insert(roles);

    }
}
