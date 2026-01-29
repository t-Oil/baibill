import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Create organization_invitations table
 * Stores pending invitations for users to join organizations
 */
export class CreateOrganizationInvitationsTable1737700000002 implements MigrationInterface {
  name = 'CreateOrganizationInvitationsTable1737700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organization_invitations',
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
            name: 'organization_id',
            type: 'int',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role_id',
            type: 'int',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'invited_by',
            type: 'int',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'expired', 'revoked'],
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'organization_invitations',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'organization_invitations',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'organization_roles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'organization_invitations',
      new TableForeignKey({
        columnNames: ['invited_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'organization_invitations',
      new TableIndex({
        name: 'IDX_org_invitations_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'organization_invitations',
      new TableIndex({
        name: 'IDX_org_invitations_email_org',
        columnNames: ['email', 'organization_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('organization_invitations');

    for (const foreignKey of table.foreignKeys) {
      await queryRunner.dropForeignKey('organization_invitations', foreignKey);
    }

    await queryRunner.dropIndex('organization_invitations', 'IDX_org_invitations_email_org');
    await queryRunner.dropIndex('organization_invitations', 'IDX_org_invitations_token');
    await queryRunner.dropTable('organization_invitations');
  }
}
