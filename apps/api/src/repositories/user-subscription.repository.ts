import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserSubscriptionEntity } from '@entities/user-subscription.entity';

@Injectable()
export class UserSubscriptionRepository extends Repository<UserSubscriptionEntity> {
  constructor(private dataSource: DataSource) {
    super(UserSubscriptionEntity, dataSource.createEntityManager());
  }

  async findActiveByUserId(userId: number): Promise<UserSubscriptionEntity | null> {
    return this.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: number): Promise<UserSubscriptionEntity[]> {
    return this.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }
}
