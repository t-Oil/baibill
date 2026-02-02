import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePlansTable20260202160000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plans',
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
            isUnique: true,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'upload_limit',
            type: 'int',
            default: 3,
          },
          {
            name: 'can_create_org',
            type: 'boolean',
            default: false,
          },
          {
            name: 'max_organizations',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_members_per_org',
            type: 'int',
            default: 0,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'THB'",
          },
          {
            name: 'billing_cycle',
            type: 'varchar',
            length: '20',
            default: "'monthly'",
          },
          {
            name: 'features',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'plans',
      new TableIndex({
        name: 'IDX_plans_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.query(`
      INSERT INTO plans (uid, name, display_name, description, upload_limit, can_create_org, max_organizations, max_members_per_org, price, is_default, sort_order, features)
      VALUES 
        (uuid_generate_v4(), 'free', 'Free', 'Basic plan with limited features', 3, false, 0, 0, 0, true, 1, '{"support": "community", "api_access": false}'),
        (uuid_generate_v4(), 'pro', 'Pro', 'Professional plan with unlimited uploads', -1, true, 5, 10, 299, false, 2, '{"support": "email", "api_access": true, "export_csv": true}'),
        (uuid_generate_v4(), 'business', 'Business', 'Business plan for teams', -1, true, 20, 50, 999, false, 3, '{"support": "priority", "api_access": true, "export_csv": true, "custom_branding": true}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('plans', 'IDX_plans_name');
    await queryRunner.dropTable('plans');
  }
}
