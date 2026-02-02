import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from './user.entity';
import { PlanEntity } from './plan.entity';

/**
 * Entity representing a user's subscription to a plan.
 * Tracks subscription status, dates, and payment info.
 */
@Entity('user_subscriptions')
export class UserSubscriptionEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ name: 'user_id' })
  @Exclude()
  userId: number;

  @Column({ name: 'plan_id' })
  @Exclude()
  planId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'plan_id' })
  plan: PlanEntity;

  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_trial', type: 'boolean', default: false })
  isTrial: boolean;

  @Column({ name: 'payment_id', type: 'varchar', length: 255, nullable: true })
  paymentId?: string;

  @Column({ name: 'payment_provider', type: 'varchar', length: 50, nullable: true })
  paymentProvider?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @BeforeInsert()
  insertCreated() {
    this.uid = uuidv4();
    if (!this.startedAt) {
      this.startedAt = new Date();
    }
  }
}
