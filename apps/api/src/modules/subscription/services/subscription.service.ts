import { Injectable } from '@nestjs/common';
import { PlanRepository } from '@repositories/plan.repository';
import { UserSubscriptionRepository } from '@repositories/user-subscription.repository';
import { PlanEntity } from '@entities/plan.entity';
import { UserSubscriptionEntity } from '@entities/user-subscription.entity';

export interface UserPlanInfo {
  plan: PlanEntity;
  subscription: UserSubscriptionEntity | null;
  uploadLimit: number;
  canCreateOrg: boolean;
  maxOrganizations: number;
  isUnlimited: boolean;
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly userSubscriptionRepository: UserSubscriptionRepository,
  ) {}

  /**
   * Get user's current active plan info
   * Returns default (free) plan if no subscription exists
   */
  async getUserPlanInfo(userId: number): Promise<UserPlanInfo> {
    const subscription = await this.userSubscriptionRepository.findActiveByUserId(userId);

    let plan: PlanEntity;

    if (subscription && subscription.plan) {
      if (subscription.expiresAt && new Date() > subscription.expiresAt) {
        plan = await this.planRepository.findDefault();
      } else {
        plan = subscription.plan;
      }
    } else {
      plan = await this.planRepository.findDefault();
    }

    if (!plan) {
      return {
        plan: null,
        subscription: null,
        uploadLimit: 3,
        canCreateOrg: false,
        maxOrganizations: 0,
        isUnlimited: false,
      };
    }

    return {
      plan,
      subscription,
      uploadLimit: plan.uploadLimit,
      canCreateOrg: plan.canCreateOrg,
      maxOrganizations: plan.maxOrganizations,
      isUnlimited: plan.uploadLimit === -1,
    };
  }

  /**
   * Check if user can upload more receipts
   */
  async canUpload(userId: number, currentUploadCount: number): Promise<boolean> {
    const planInfo = await this.getUserPlanInfo(userId);

    if (planInfo.isUnlimited) {
      return true;
    }

    return currentUploadCount < planInfo.uploadLimit;
  }

  /**
   * Check if user can create organization
   */
  async canCreateOrganization(userId: number): Promise<boolean> {
    const planInfo = await this.getUserPlanInfo(userId);
    return planInfo.canCreateOrg;
  }

  /**
   * Assign default plan to new user
   */
  async assignDefaultPlan(userId: number): Promise<UserSubscriptionEntity> {
    const defaultPlan = await this.planRepository.findDefault();

    if (!defaultPlan) {
      throw new Error('No default plan found');
    }

    const subscription = this.userSubscriptionRepository.create({
      userId,
      planId: defaultPlan.id,
      startedAt: new Date(),
      isActive: true,
      isTrial: false,
    });

    return this.userSubscriptionRepository.save(subscription);
  }

  /**
   * Upgrade user to a new plan
   */
  async upgradePlan(
    userId: number,
    planName: string,
    paymentId?: string,
    paymentProvider?: string,
  ): Promise<UserSubscriptionEntity> {
    const plan = await this.planRepository.findByName(planName);

    if (!plan) {
      throw new Error(`Plan ${planName} not found`);
    }

    const currentSubscription = await this.userSubscriptionRepository.findActiveByUserId(userId);
    if (currentSubscription) {
      currentSubscription.isActive = false;
      currentSubscription.cancelledAt = new Date();
      await this.userSubscriptionRepository.save(currentSubscription);
    }

    const subscription = this.userSubscriptionRepository.create({
      userId,
      planId: plan.id,
      startedAt: new Date(),
      isActive: true,
      isTrial: false,
      paymentId,
      paymentProvider,
    });

    return this.userSubscriptionRepository.save(subscription);
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans(): Promise<PlanEntity[]> {
    return this.planRepository.findAllActive();
  }

  /**
   * Get plan by name
   */
  async getPlanByName(name: string): Promise<PlanEntity | null> {
    return this.planRepository.findByName(name);
  }
}
