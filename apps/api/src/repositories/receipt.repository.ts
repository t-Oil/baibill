import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { ReceiptEntity } from '@entities/receipt.entity';

@Injectable()
export class ReceiptRepository extends BaseRepository<ReceiptEntity> {
  constructor(private dataSource: DataSource) {
    super(ReceiptEntity, dataSource.createEntityManager());
  }
}
