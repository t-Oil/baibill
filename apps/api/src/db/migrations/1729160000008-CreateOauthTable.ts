import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: Create oauth table
 * This table stores OAuth tokens for user authentication (JWT access and refresh tokens)
 */
export class CreateOauthTable1729160000008 implements MigrationInterface {
  name = 'CreateOauthTable1729160000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'oauth',
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
            name: 'token',
            type: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'refresh_token',
            type: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'oauth',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_oauth_user_id" ON "oauth" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_oauth_token" ON "oauth" ("token")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_oauth_refresh_token" ON "oauth" ("refresh_token")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_oauth_refresh_token"`);
    await queryRunner.query(`DROP INDEX "IDX_oauth_token"`);
    await queryRunner.query(`DROP INDEX "IDX_oauth_user_id"`);

    const table = await queryRunner.getTable('oauth');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('oauth', foreignKey);
    }

    await queryRunner.dropTable('oauth');
  }
}
