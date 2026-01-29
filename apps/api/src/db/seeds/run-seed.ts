import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '@modules/app/app.module';
import SystemAdminSeeder from './seeders/system-admin.seeder';
import MasterDepartmentSeeder from './seeders/ms-department.seeder';
import { UserEntity } from '@entities/user.entity';
import { MenuEntity } from '@entities/menu.entity';
import MenuSeeder from './seeders/menu.seeder';
import PermissionSeeder from './seeders/permission.seeder';
import RoleSeeder from './seeders/role.seeder';
import OrganizationRoleSeeder from './seeders/organization-role.seeder';
import AdminOrganizationSeeder from './seeders/admin-organization.seeder';
import BackfillOrganizationsSeeder from './seeders/backfill-organizations.seeder';
import EmailTemplateSeeder from './seeders/email-template.seeder';

/**
 * Bootstraps the seeder execution.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    const userSeeder = new SystemAdminSeeder();
    const users: UserEntity[] = await userSeeder.run(dataSource);

    const adminUser = users.find((user) => user.email === 'system@brandi.com') || users[0];
    const createdById = adminUser?.id;

    const msDepartment = new MasterDepartmentSeeder();
    await msDepartment.run(dataSource, createdById);

    const menu = new MenuSeeder();
    const menuData: MenuEntity[] = await menu.run(dataSource, createdById);

    const role = new RoleSeeder();
    await role.run(dataSource, createdById);

    const permission = new PermissionSeeder();
    await permission.run(dataSource, menuData, createdById);

    const orgRole = new OrganizationRoleSeeder();
    await orgRole.run(dataSource, createdById);

    const adminOrg = new AdminOrganizationSeeder();
    await adminOrg.run(dataSource);

    const backfill = new BackfillOrganizationsSeeder();
    await backfill.run(dataSource);

    const emailTemplates = new EmailTemplateSeeder();
    // Use factory manager as null/any since we're running manually and not using factories
    await emailTemplates.run(dataSource, null as any);
  } catch (error) {
    console.error('Error during seed execution:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
