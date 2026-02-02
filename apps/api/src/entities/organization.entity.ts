import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { UserEntity } from './user.entity';
import { UserOrganizationEntity } from './user-organization.entity';

/**
 * Entity representing an organization.
 * Organizations are multi-tenant containers for receipts.
 */
@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'created_by', nullable: true })
  @Exclude()
  createdBy?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  creator?: UserEntity;

  @OneToMany(() => UserOrganizationEntity, (userOrg) => userOrg.organization)
  members?: UserOrganizationEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt?: Date;

  @Column({
    name: 'is_active',
    type: 'smallint',
    default: ActiveStatusEnum.ACTIVE,
  })
  @Exclude()
  isActive!: ActiveStatusEnum;

  @BeforeInsert()
  insertCreated() {
    this.uid = uuidv4();
  }
}
