import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create user_roles pivot table
 * This table manages many-to-many relationship between users and roles
 */
export class CreateUserRolesTable1729160000007 implements MigrationInterface {
  name = 'CreateUserRolesTable1729160000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'user_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'role_id',
            type: 'int',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to roles table
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_user_id" ON "user_roles" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_role_id" ON "user_roles" ("role_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_user_roles_role_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_user_id"`);

    const table = await queryRunner.getTable('user_roles');

    // Drop foreign keys
    const userForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (userForeignKey) {
      await queryRunner.dropForeignKey('user_roles', userForeignKey);
    }

    const roleForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('role_id') !== -1,
    );
    if (roleForeignKey) {
      await queryRunner.dropForeignKey('user_roles', roleForeignKey);
    }

    await queryRunner.dropTable('user_roles');
  }
}
