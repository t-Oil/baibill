import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

/**
 * Entity representing a subscription plan.
 * Defines plan features and limits.
 */
@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'upload_limit', type: 'int', default: 3 })
  uploadLimit: number;

  @Column({ name: 'can_create_org', type: 'boolean', default: false })
  canCreateOrg: boolean;

  @Column({ name: 'max_organizations', type: 'int', default: 0 })
  maxOrganizations: number;

  @Column({ name: 'max_members_per_org', type: 'int', default: 0 })
  maxMembersPerOrg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'THB' })
  currency: string;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 20, default: 'monthly' })
  billingCycle: string;

  @Column({ type: 'jsonb', nullable: true })
  features?: Record<string, any>;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @BeforeInsert()
  insertCreated() {
    this.uid = uuidv4();
  }
}
