import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create menus table
 * This table stores menu items with hierarchical structure (parent-child relationship)
 */
export class CreateMenusTable1729160000002 implements MigrationInterface {
  name = 'CreateMenusTable1729160000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'menus',
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
            name: 'name',
            type: 'varchar',
            length: '250',
            isNullable: true,
          },
          {
            name: 'route_url',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ordinal_no',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_show',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
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

    // Create self-referencing foreign key for parent_id
    await queryRunner.createForeignKey(
      'menus',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'menus',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_menus_uid" ON "menus" ("uid")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_menus_parent_id" ON "menus" ("parent_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_menus_parent_id"`);
    await queryRunner.query(`DROP INDEX "IDX_menus_uid"`);

    const table = await queryRunner.getTable('menus');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('parent_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('menus', foreignKey);
    }

    await queryRunner.dropTable('menus');
  }
}
