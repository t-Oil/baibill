import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Create ms_departments table
 * This table stores department master data
 */
export class CreateMsDepartmentsTable1729160000001 implements MigrationInterface {
  name = 'CreateMsDepartmentsTable1729160000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "active_status_enum" AS ENUM ('0', '1')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'ms_departments',
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
            length: '50',
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
      CREATE INDEX "IDX_ms_departments_uid" ON "ms_departments" ("uid")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ms_departments_uid"`);
    await queryRunner.dropTable('ms_departments');
    await queryRunner.query(`DROP TYPE "active_status_enum"`);
  }
}
