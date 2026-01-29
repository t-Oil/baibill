import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { UserEntity } from './user.entity';
import { OrganizationEntity } from './organization.entity';
import { OrganizationRoleEntity } from './organization-role.entity';

/**
 * Entity representing user membership in an organization.
 * Links users to organizations with specific roles.
 */
@Entity('user_organizations')
export class UserOrganizationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'invited_by', nullable: true })
  invitedBy?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => OrganizationEntity, (org) => org.members)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @ManyToOne(() => OrganizationRoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: OrganizationRoleEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'invited_by' })
  inviter?: UserEntity;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamp' })
  joinedAt!: Date;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.ACTIVE,
  })
  isActive!: ActiveStatusEnum;
}
