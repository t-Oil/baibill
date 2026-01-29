import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserConfirmation1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'confirmation_token',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'confirmation_token_expires',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'confirmation_token_expires');
    await queryRunner.dropColumn('users', 'confirmation_token');
  }
}
