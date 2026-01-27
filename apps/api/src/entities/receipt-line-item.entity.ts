import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ReceiptEntity } from './receipt.entity';

@Entity('receipt_line_items')
export class ReceiptLineItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'receipt_id', type: 'int' })
  receiptId!: number;

  @Column({ name: 'description', type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 3, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'product_code', type: 'varchar', length: 100, nullable: true })
  productCode?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => ReceiptEntity, (receipt) => receipt.lineItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receipt_id' })
  receipt!: ReceiptEntity;
}
