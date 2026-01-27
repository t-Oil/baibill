import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Create organizations and organization_roles tables
 * Organizations are the multi-tenant containers for receipts
 * Organization roles define permission levels within an organization
 */
export class CreateOrganizationsTables1737700000000 implements MigrationInterface {
    name = 'CreateOrganizationsTables1737700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'organization_roles',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
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

        await queryRunner.query(`
      INSERT INTO organization_roles (name, description) VALUES
      ('admin', 'Full access to organization settings, members, and receipts'),
      ('member', 'Can view and upload receipts'),
      ('viewer', 'Can only view receipts')
    `);

        await queryRunner.createTable(
            new Table({
                name: 'organizations',
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
                        length: '255',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'int',
                        isNullable: true,
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

        await queryRunner.createIndex(
            'organizations',
            new TableIndex({
                name: 'IDX_organizations_uid',
                columnNames: ['uid'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'organizations',
            new TableIndex({
                name: 'IDX_organizations_created_by',
                columnNames: ['created_by'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('organizations', 'IDX_organizations_created_by');
        await queryRunner.dropIndex('organizations', 'IDX_organizations_uid');
        await queryRunner.dropTable('organizations');
        await queryRunner.dropTable('organization_roles');
    }
}
