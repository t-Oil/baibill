import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enum for email template types.
 */
export enum EmailTemplateType {
  INVITATION = 'invitation',
  WELCOME = 'welcome',
  EMAIL_CONFIRMATION = 'email_confirmation',

  PASSWORD_RESET = 'password_reset',
  RECEIPT_PROCESSED = 'receipt_processed',
  NOTIFICATION = 'notification',
}

/**
 * Entity for storing email templates.
 */
@Entity('email_templates')
export class EmailTemplateEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    unique: true,
  })
  type: EmailTemplateType;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', name: 'html_content' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true, name: 'text_content' })
  textContent?: string;

  @Column({ type: 'simple-json', nullable: true })
  variables?: string[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @BeforeInsert()
  generateUid() {
    this.uid = uuidv4();
  }
}
