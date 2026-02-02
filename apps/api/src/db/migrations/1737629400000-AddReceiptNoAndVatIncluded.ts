import { QueryRunner, TableColumn } from 'typeorm';

export class AddReceiptNoAndVatIncluded1737629400000 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'receipts',
      new TableColumn({
        name: 'receipt_no',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'receipts',
      new TableColumn({
        name: 'vat_included',
        type: 'boolean',
        default: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('receipts', 'vat_included');
    await queryRunner.dropColumn('receipts', 'receipt_no');
  }
}
