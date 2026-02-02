import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@modules/logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthException } from '@exceptions/app/auth.exception';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { UserRepository } from '@repositories/user.repository';
import { UserEntity } from '@entities/user.entity';
import { MenuRepository } from '@repositories/menu.repository';
import { MenuEntity } from '@entities/menu.entity';
import { UserSubscriptionRepository } from '@repositories/user-subscription.repository';
import { PlanRepository } from '@repositories/plan.repository';
import { PlanEntity } from '@entities/plan.entity';

@Injectable()
export class MeService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
    @InjectRepository(UserRepository)
    private readonly adminUserRepository: UserRepository,
    @InjectRepository(MenuRepository)
    private readonly menuRepository: MenuRepository,
    private readonly userSubscriptionRepository: UserSubscriptionRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async getMe(userId: number): Promise<UserEntity & { menus: MenuEntity[]; plan: PlanEntity | null }> {
    const cachedData = await this.cacheManager.get(`auth-${userId}`);

    if (cachedData) {
      return cachedData as UserEntity & { menus: MenuEntity[]; plan: PlanEntity | null };
    }

    try {
      const user: UserEntity = await this.adminUserRepository.findOneOrFail({
        where: {
          id: userId,
          isActive: ActiveStatusEnum.ACTIVE,
        },
      });

      const menus: MenuEntity[] = [];

      let plan: PlanEntity | null = null;
      const subscription = await this.userSubscriptionRepository.findActiveByUserId(userId);
      
      if (subscription?.plan) {
        plan = subscription.plan;
      } else {
        plan = await this.planRepository.findDefault();
      }

      const result: UserEntity & { menus: MenuEntity[]; plan: PlanEntity | null } = {
        ...user,
        menus,
        plan,
      };

      await this.cacheManager.set(`auth-${userId}`, result);

      return result;
    } catch (error) {
      this.logger.error(`${MeService.name}[GET_ME]`, {
        error: {
          userId,
          message: error.message,
        },
      });
      throw AuthException.Unauthorized();
    }
  }
}
