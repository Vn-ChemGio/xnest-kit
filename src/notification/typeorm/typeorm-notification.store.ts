import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogEntity } from './notification-log.entity';
import type {
  ChannelResult,
  ChannelType,
  NotificationRecord,
  NotificationStore,
  SendInput,
} from '../notification.type';

/**
 * TypeORM implementation of NotificationStore.
 *
 * Persists notification records to a database table using TypeORM.
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { TypeOrmModule } from '@nestjs/typeorm';
 * import { NotificationModule } from 'xnest-kit/notification';
 * import {
 *   NotificationLogEntity,
 *   TypeOrmNotificationStore,
 * } from 'xnest-kit/notification/typeorm';
 *
 * @Module({
 *   imports: [
 *     TypeOrmModule.forRoot({ entities: [NotificationLogEntity] }),
 *     NotificationModule.forRoot({
 *       providers: { email: [...] },
 *       storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
 *     }),
 *   ],
 *   providers: [
 *     {
 *       provide: 'NOTIFICATION_TYPEORM_STORE',
 *       useClass: TypeOrmNotificationStore,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Injectable()
export class TypeOrmNotificationStore implements NotificationStore {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly repo: Repository<NotificationLogEntity>,
  ) {}

  async save(
    record: Omit<NotificationRecord, 'id' | 'createdAt'>,
  ): Promise<NotificationRecord> {
    const entity = this.repo.create({
      channels: record.channels,
      status: record.status,
      results: JSON.stringify(record.results),
      input: JSON.stringify(record.input),
    });

    const saved = await this.repo.save(entity);
    return this.toRecord(saved);
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;
    return this.toRecord(entity);
  }

  async findByChannel(
    channel: ChannelType,
    limit = 20,
  ): Promise<NotificationRecord[]> {
    const entities = await this.repo
      .createQueryBuilder('n')
      .where(`n.channels LIKE :channel`, { channel: `%${channel}%` })
      .orderBy('n.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return entities.map((e) => this.toRecord(e));
  }

  async updateStatus(
    id: string,
    status: NotificationRecord['status'],
  ): Promise<void> {
    await this.repo.update(id, { status });
  }

  private toRecord(entity: NotificationLogEntity): NotificationRecord {
    return {
      id: entity.id,
      channels: entity.channels as ChannelType[],
      status: entity.status as NotificationRecord['status'],
      results: JSON.parse(entity.results) as ChannelResult[],
      input: JSON.parse(entity.input) as SendInput,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
