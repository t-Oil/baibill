import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Create roles table
 * This table stores user roles for RBAC (Role-Based Access Control)
 */
export class CreateRolesTable1729160000004 implements MigrationInterface {
  name = 'CreateRolesTable1729160000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_can_delete',
            type: 'boolean',
            default: true,
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

    await queryRunner.query(`
      CREATE INDEX "IDX_roles_uid" ON "roles" ("uid")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_roles_name" ON "roles" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_roles_name"`);
    await queryRunner.query(`DROP INDEX "IDX_roles_uid"`);
    await queryRunner.dropTable('roles');
  }
}
