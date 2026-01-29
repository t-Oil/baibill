import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { OrganizationRoleEntity } from '@entities/organization-role.entity';

export default class OrganizationRoleSeeder implements Seeder {
  public async run(dataSource: DataSource, createdById?: number): Promise<void> {
    const repository = dataSource.getRepository(OrganizationRoleEntity);

    const roles = [
      { name: 'owner', description: 'Organization Owner' },
      { name: 'admin', description: 'Organization Administrator' },
      { name: 'member', description: 'Organization Member' },
      { name: 'viewer', description: 'Read-only Access' },
    ];

    for (const role of roles) {
      const exists = await repository.findOne({ where: { name: role.name } });
      if (!exists) {
        await repository.save(role);
      }
    }
  }
}
