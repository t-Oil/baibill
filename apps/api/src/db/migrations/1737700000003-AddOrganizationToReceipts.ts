import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Add organization_id to receipts table
 * Links receipts to organizations for multi-tenant filtering
 */
export class AddOrganizationToReceipts1737700000003 implements MigrationInterface {
  name = 'AddOrganizationToReceipts1737700000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'receipts',
      new TableColumn({
        name: 'organization_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'receipts',
      new TableColumn({
        name: 'uploaded_by',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'receipts',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'receipts',
      new TableForeignKey({
        columnNames: ['uploaded_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'receipts',
      new TableIndex({
        name: 'IDX_receipts_organization_id',
        columnNames: ['organization_id'],
      }),
    );

    await queryRunner.createIndex(
      'receipts',
      new TableIndex({
        name: 'IDX_receipts_uploaded_by',
        columnNames: ['uploaded_by'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('receipts', 'IDX_receipts_uploaded_by');
    await queryRunner.dropIndex('receipts', 'IDX_receipts_organization_id');

    const table = await queryRunner.getTable('receipts');

    const orgForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('organization_id') !== -1,
    );
    if (orgForeignKey) {
      await queryRunner.dropForeignKey('receipts', orgForeignKey);
    }

    const userForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('uploaded_by') !== -1,
    );
    if (userForeignKey) {
      await queryRunner.dropForeignKey('receipts', userForeignKey);
    }

    await queryRunner.dropColumn('receipts', 'uploaded_by');
    await queryRunner.dropColumn('receipts', 'organization_id');
  }
}
