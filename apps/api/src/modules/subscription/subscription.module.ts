import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from '@entities/plan.entity';
import { UserSubscriptionEntity } from '@entities/user-subscription.entity';
import { PlanRepository } from '@repositories/plan.repository';
import { UserSubscriptionRepository } from '@repositories/user-subscription.repository';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanEntity, UserSubscriptionEntity])],
  providers: [SubscriptionService, PlanRepository, UserSubscriptionRepository],
  exports: [SubscriptionService, PlanRepository, UserSubscriptionRepository],
})
export class SubscriptionModule {}
