import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  @Exclude()
  createdById!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  @Exclude()
  updatedById!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt!: Date;

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
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  insertUpdated() {
    this.updatedAt = new Date();
  }
}
