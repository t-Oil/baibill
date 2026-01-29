import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { ReceiptLineItemEntity } from './receipt-line-item.entity';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from './user.entity';

@Entity('receipts')
export class ReceiptEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ name: 'merchant_name', type: 'varchar', length: 255 })
  merchantName: string;

  @Column({ name: 'company_tax_id', type: 'varchar', length: 100, nullable: true })
  companyTaxId?: string;

  @Column({ name: 'company_address', type: 'text', nullable: true })
  companyAddress?: string;

  @Column({ name: 'receipt_no', type: 'varchar', length: 100, nullable: true })
  receiptNo?: string;

  @Column({ name: 'vat_included', type: 'boolean', default: true })
  vatIncluded: boolean;

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'THB' })
  currency: string;

  @Column({ name: 'receipt_date', type: 'date' })
  date: string;

  @Column({ name: 'raw_ocr_text', type: 'text', nullable: true })
  rawOcrText?: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.ACTIVE,
  })
  isActive!: ActiveStatusEnum;

  @OneToMany(() => ReceiptLineItemEntity, (lineItem) => lineItem.receipt, {
    cascade: true,
    eager: true,
  })
  lineItems?: ReceiptLineItemEntity[];

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: number;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedById?: number;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy?: UserEntity;

  @BeforeInsert()
  insertCreated() {
    this.uid = uuidv4();
  }
}
