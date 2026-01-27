import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Create user_organizations junction table
 * Links users to organizations with specific roles
 */
export class CreateUserOrganizationsTable1737700000001 implements MigrationInterface {
    name = 'CreateUserOrganizationsTable1737700000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_organizations',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                    },
                    {
                        name: 'organization_id',
                        type: 'int',
                    },
                    {
                        name: 'role_id',
                        type: 'int',
                    },
                    {
                        name: 'invited_by',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'joined_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
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

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedTableName: 'organization_roles',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );

        await queryRunner.createForeignKey(
            'user_organizations',
            new TableForeignKey({
                columnNames: ['invited_by'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createIndex(
            'user_organizations',
            new TableIndex({
                name: 'IDX_user_organizations_user_org',
                columnNames: ['user_id', 'organization_id'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('user_organizations');

        for (const foreignKey of table.foreignKeys) {
            await queryRunner.dropForeignKey('user_organizations', foreignKey);
        }

        await queryRunner.dropIndex('user_organizations', 'IDX_user_organizations_user_org');
        await queryRunner.dropTable('user_organizations');
    }
}
