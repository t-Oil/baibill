import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { hashSync } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ActiveStatusEnum } from "@commons/enums/active-status.enum";
import { UserEntity } from '@entities/user.entity';
import { RoleEntity } from '@entities/role.entity';

export default class SystemAdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<UserEntity[]> {
    const userRepository = dataSource.getRepository(UserEntity);
    const roleRepository = dataSource.getRepository(RoleEntity);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      return await userRepository.find();
    }

    // Get the admin role
    const adminRole = await roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.error('Admin role not found. Please run role seeder first.');
      return [];
    }

    // Check if system user already exists
    const existingSystem = await userRepository.findOne({
      where: { email: 'system@mock.com' },
    });

    const users = [];

    // Only create system user if it doesn't exist
    if (!existingSystem) {
      users.push({
        uid: uuidv4(),
        email: 'system@mock.com',
        password: hashSync('admin12345', 10),
        firstName: "System",
        lastName: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isActive: ActiveStatusEnum.IN_ACTIVE,
        roles: []
      });
    }

    // Always create the new admin user
    users.push({
      uid: uuidv4(),
      email: 'admin@example.com',
      password: hashSync('password123', 10),
      firstName: "Admin",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isActive: ActiveStatusEnum.ACTIVE,
      roles: [adminRole]
    });

    const savedUsers = await userRepository.save(users);
    return savedUsers;
  }
}
