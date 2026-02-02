import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create role_permissions pivot table
 * This table manages many-to-many relationship between roles and permissions
 */
export class CreateRolePermissionsTable1729160000005 implements MigrationInterface {
  name = 'CreateRolePermissionsTable1729160000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'role_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'permission_id',
            type: 'int',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_role_id" ON "role_permissions" ("role_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_permission_id"`);
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_role_id"`);

    const table = await queryRunner.getTable('role_permissions');

    const roleForeignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('role_id') !== -1);
    if (roleForeignKey) {
      await queryRunner.dropForeignKey('role_permissions', roleForeignKey);
    }

    const permissionForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('permission_id') !== -1,
    );
    if (permissionForeignKey) {
      await queryRunner.dropForeignKey('role_permissions', permissionForeignKey);
    }

    await queryRunner.dropTable('role_permissions');
  }
}
