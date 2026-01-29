import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create permissions table
 * This table stores permission values associated with menus
 */
export class CreatePermissionsTable1729160000003 implements MigrationInterface {
  name = 'CreatePermissionsTable1729160000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'uid',
            type: 'uuid',
            isUnique: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'value',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'menu_id',
            type: 'int',
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'enum',
            enum: ['0', '1'],
            default: "'1'",
          },
        ],
      }),
      true,
    );

    // Create foreign key to menus table
    await queryRunner.createForeignKey(
      'permissions',
      new TableForeignKey({
        columnNames: ['menu_id'],
        referencedTableName: 'menus',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_uid" ON "permissions" ("uid")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_menu_id" ON "permissions" ("menu_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_permissions_menu_id"`);
    await queryRunner.query(`DROP INDEX "IDX_permissions_uid"`);

    const table = await queryRunner.getTable('permissions');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('menu_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('permissions', foreignKey);
    }

    await queryRunner.dropTable('permissions');
  }
}
