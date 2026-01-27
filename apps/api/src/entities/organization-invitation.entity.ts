import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationEntity } from './organization.entity';
import { OrganizationRoleEntity } from './organization-role.entity';
import { UserEntity } from './user.entity';

/**
 * Status of an organization invitation.
 */
export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

/**
 * Entity representing pending invitations for users to join organizations.
 */
@Entity('organization_invitations')
export class OrganizationInvitationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid', unique: true })
    uid!: string;

    @Column({ name: 'organization_id' })
    organizationId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email?: string;

    @Column({ name: 'user_id', nullable: true })
    userId?: number;

    @Column({ name: 'role_id' })
    roleId: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    token: string;

    @Column({ name: 'invited_by' })
    invitedById: number;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
    acceptedAt?: Date;

    @Column({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    })
    status: InvitationStatus;

    @ManyToOne(() => OrganizationEntity)
    @JoinColumn({ name: 'organization_id' })
    organization: OrganizationEntity;

    @ManyToOne(() => OrganizationRoleEntity)
    @JoinColumn({ name: 'role_id' })
    role: OrganizationRoleEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'invited_by' })
    inviter: UserEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user?: UserEntity;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

    @BeforeInsert()
    generateUid() {
        this.uid = uuidv4();
        this.token = uuidv4();
    }
}
