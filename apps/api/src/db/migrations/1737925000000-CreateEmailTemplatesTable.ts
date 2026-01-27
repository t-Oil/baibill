import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration to create email_templates table.
 */
export class CreateEmailTemplatesTable1737925000000 implements MigrationInterface {
    name = 'CreateEmailTemplatesTable1737925000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type
        await queryRunner.query(`
            CREATE TYPE "email_templates_type_enum" AS ENUM (
                'invitation',
                'welcome',
                'password_reset',
                'receipt_processed',
                'notification'
            )
        `);

        // Create table
        await queryRunner.createTable(
            new Table({
                name: 'email_templates',
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
                    },
                    {
                        name: 'type',
                        type: 'email_templates_type_enum',
                        isUnique: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'subject',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'html_content',
                        type: 'text',
                    },
                    {
                        name: 'text_content',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'variables',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('email_templates');
        await queryRunner.query(`DROP TYPE "email_templates_type_enum"`);
    }
}
