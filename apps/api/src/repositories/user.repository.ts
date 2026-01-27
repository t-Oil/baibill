import { UserEntity } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@repositories/base.repository';
import { DataSource } from 'typeorm';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * Finds a user by email address (case-insensitive).
   * @param email User's email address
   * @returns User entity or null if not found
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: ActiveStatusEnum.ACTIVE,
      },
    });
  }
}
