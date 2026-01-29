import { Injectable } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UserEntity } from '@entities/user.entity';
import { UserException } from '@exceptions/app/user.exception';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { CreateUserRequestDto } from '../requests/create-user.request';
import { hashSync } from 'bcryptjs';
import { generateRandomString } from '@commons/utils/index.util';
import { UpdateResult } from 'typeorm';
import { UpdateUserRequestDto } from '../requests/update-user.request';
import { OrganizationRepository } from '@repositories/organization.repository';
import { UserOrganizationRepository } from '@repositories/user-organization.repository';
import { OrganizationRoleRepository } from '@repositories/organization-role.repository';
import { OrganizationInvitationRepository } from '@repositories/organization-invitation.repository';
import { InvitationStatus } from '@entities/organization-invitation.entity';
import { v4 as uuidv4 } from 'uuid';
import { RegisterRequest } from '@modules/auth/requests/register.request';
import { EmailConfirmationEvent } from '@modules/mail/events/mail.events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @InjectRepository(UserOrganizationRepository)
    private readonly userOrganizationRepository: UserOrganizationRepository,
    @InjectRepository(OrganizationRoleRepository)
    private readonly roleRepository: OrganizationRoleRepository,
    @InjectRepository(OrganizationInvitationRepository)
    private readonly invitationRepository: OrganizationInvitationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Paginates users with optional search and filtering.
   * @param textSearch Search text
   * @param options Pagination options
   * @param sortColumn Column to sort by
   * @param sortDirection Sort direction
   * @param includes Relations to include
   * @param conditions Additional conditions
   * @returns Paginated users
   */
  async paginate(
    textSearch = '',
    options: IPaginationOptions,
    sortColumn: string = 'updatedAt',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
    includes?: string,
    conditions?: { [key: string]: any },
  ): Promise<Pagination<UserEntity>> {
    return await this.userRepository.paginate(
      options,
      sortColumn,
      sortDirection,
      textSearch,
      ['firstName', 'lastName', 'email'],
      includes?.split(','),
      {
        ...conditions,
      },
    );
  }

  /**
   * Gets a user by UID.
   * @param uid User UID
   * @param includes Relations to include
   * @returns User entity
   */
  async getById(uid: string, includes?: string): Promise<UserEntity> {
    try {
      return await this.userRepository.findOneOrFail({
        relations: includes?.split(','),
        where: {
          uid,
          isActive: ActiveStatusEnum.ACTIVE,
        },
      });
    } catch (error) {
      throw UserException.notFound();
    }
  }

  /**
   * Registers a new user with password.
   * @param payload Registration data
   * @returns Created user
   */
  async register(payload: RegisterRequest): Promise<UserEntity> {
    try {
      const created: UserEntity = this.userRepository.create({
        email: payload.email.toLowerCase(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: hashSync(payload.password, 10),
        isActive: ActiveStatusEnum.IN_ACTIVE,
        confirmationToken: uuidv4(),
        confirmationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      const savedUser = await this.userRepository.save(created);

      await this.createDefaultOrganization(savedUser);

      await this.linkUserToEmailInvitations(savedUser.email, savedUser.id);

      this.eventEmitter.emit(
        EmailConfirmationEvent.NAME,
        new EmailConfirmationEvent(
          savedUser.email,
          savedUser.firstName,
          `${process.env.FRONTEND_APP_URL}/verify-email?token=${savedUser.confirmationToken}`,
        ),
      );

      return savedUser;
    } catch (error) {
      throw UserException.createError(['Something went wrong when registering user']);
    }
  }

  /**
   * Creates a new user with default organization (Admin created).
   * @param payload User creation data
   * @returns Created user and pending invitations
   */
  async create(payload: CreateUserRequestDto): Promise<{
    user: UserEntity;
    pendingInvitations: any[];
  }> {
    try {
      const generatePassword: string = generateRandomString(10);

      const created: UserEntity = this.userRepository.create({
        email: payload.email.toLowerCase(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: hashSync(generatePassword, 10),
        departmentId: payload.department,
      });

      const savedUser = await this.userRepository.save(created);

      await this.createDefaultOrganization(savedUser);

      const pendingInvitations = await this.invitationRepository.find({
        where: {
          userId: savedUser.id,
          status: InvitationStatus.PENDING,
        },
        relations: ['organization', 'role', 'inviter'],
      });

      return {
        user: savedUser,
        pendingInvitations,
      };
    } catch (error) {
      throw UserException.createError(['Something went wrong when creating user']);
    }
  }

  /**
   * Creates a default organization for a new user.
   * @param user User entity
   */
  private async createDefaultOrganization(user: UserEntity): Promise<void> {
    const organization = this.organizationRepository.create({
      name: `${user.firstName}'s Organization`,
      description: 'Personal Workspace',
      createdBy: user.id,
    });

    const savedOrg = await this.organizationRepository.save(organization);

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (adminRole) {
      const membership = this.userOrganizationRepository.create({
        userId: user.id,
        organizationId: savedOrg.id,
        roleId: adminRole.id,
        invitedBy: user.id,
      });
      await this.userOrganizationRepository.save(membership);
    }
  }

  /**
   * Links pending email-based invitations to a user after registration.
   * @param email User's email
   * @param userId User's ID
   */
  private async linkUserToEmailInvitations(email: string, userId: number): Promise<void> {
    const pendingInvitations = await this.invitationRepository.findAllPendingByEmail(
      email.toLowerCase(),
    );

    for (const invitation of pendingInvitations) {
      invitation.userId = userId;
      invitation.email = null;
      await this.invitationRepository.save(invitation);
    }
  }

  /**
   * Soft deletes a user by UID.
   * @param uid User UID
   * @returns Update result
   */
  async delete(uid: string): Promise<UpdateResult> {
    try {
      const user = await this.getById(uid);
      user.isActive = ActiveStatusEnum.IN_ACTIVE;

      return await this.userRepository.update(user.id, {
        isActive: ActiveStatusEnum.IN_ACTIVE,
        deletedAt: new Date(),
      });
    } catch (error) {
      throw UserException.notFound();
    }
  }

  /**
   * Updates a user by UID.
   * @param uid User UID
   * @param payload Update data
   * @returns Updated user
   */
  async update(uid: string, payload: UpdateUserRequestDto): Promise<UserEntity> {
    const user = await this.getById(uid);

    try {
      this.userRepository.merge(user, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        departmentId: payload.department,
      });

      const updatedUser: UserEntity = await this.userRepository.save(user);

      return this.getById(updatedUser.uid, 'department');
    } catch (error) {
      throw UserException.updateError(['Something went wrong when updating user']);
    }
  }
}
