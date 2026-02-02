import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserSubscriptionsTable20260202160001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_subscriptions',
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
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'plan_id',
            type: 'int',
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_trial',
            type: 'boolean',
            default: false,
          },
          {
            name: 'payment_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'payment_provider',
            type: 'varchar',
            length: '50',
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

    await queryRunner.createIndex(
      'user_subscriptions',
      new TableIndex({
        name: 'IDX_user_subscriptions_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_subscriptions',
      new TableIndex({
        name: 'IDX_user_subscriptions_plan_id',
        columnNames: ['plan_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_subscriptions',
      new TableIndex({
        name: 'IDX_user_subscriptions_active',
        columnNames: ['user_id', 'is_active'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_subscriptions',
      new TableForeignKey({
        name: 'FK_user_subscriptions_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_subscriptions',
      new TableForeignKey({
        name: 'FK_user_subscriptions_plan',
        columnNames: ['plan_id'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_subscriptions', 'FK_user_subscriptions_plan');
    await queryRunner.dropForeignKey('user_subscriptions', 'FK_user_subscriptions_user');
    await queryRunner.dropIndex('user_subscriptions', 'IDX_user_subscriptions_active');
    await queryRunner.dropIndex('user_subscriptions', 'IDX_user_subscriptions_plan_id');
    await queryRunner.dropIndex('user_subscriptions', 'IDX_user_subscriptions_user_id');
    await queryRunner.dropTable('user_subscriptions');
  }
}
