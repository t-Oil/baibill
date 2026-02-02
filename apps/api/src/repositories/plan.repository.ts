import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PlanEntity } from '@entities/plan.entity';

@Injectable()
export class PlanRepository extends Repository<PlanEntity> {
  constructor(private dataSource: DataSource) {
    super(PlanEntity, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<PlanEntity | null> {
    return this.findOne({ where: { name, isActive: true } });
  }

  async findDefault(): Promise<PlanEntity | null> {
    return this.findOne({ where: { isDefault: true, isActive: true } });
  }

  async findAllActive(): Promise<PlanEntity[]> {
    return this.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
