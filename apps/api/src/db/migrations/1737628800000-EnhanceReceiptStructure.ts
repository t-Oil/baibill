import { QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class EnhanceReceiptStructure1737628800000 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to receipts table
    await queryRunner.addColumns('receipts', [
      new TableColumn({
        name: 'company_tax_id',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'company_address',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'subtotal',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
      new TableColumn({
        name: 'vat_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
      new TableColumn({
        name: 'currency',
        type: 'varchar',
        length: '10',
        default: "'THB'",
      }),
    ]);

    // Create receipt_line_items table
    await queryRunner.createTable(
      new Table({
        name: 'receipt_line_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'receipt_id',
            type: 'int',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 3,
            default: 1,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '100',
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

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'receipt_line_items',
      new TableForeignKey({
        name: 'FK_receipt_line_items_receipt_id',
        columnNames: ['receipt_id'],
        referencedTableName: 'receipts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add index for receipt_id
    await queryRunner.query(
      `CREATE INDEX "IDX_receipt_line_items_receipt_id" ON "receipt_line_items" ("receipt_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey(
      'receipt_line_items',
      'FK_receipt_line_items_receipt_id',
    );

    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_receipt_line_items_receipt_id"`);

    // Drop table
    await queryRunner.dropTable('receipt_line_items');

    // Remove columns from receipts table
    await queryRunner.dropColumns('receipts', [
      'company_tax_id',
      'company_address',
      'subtotal',
      'vat_amount',
      'currency',
    ]);
  }
}
