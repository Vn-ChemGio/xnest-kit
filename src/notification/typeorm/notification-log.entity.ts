import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * TypeORM entity for persisting notification logs.
 *
 * Stores the result of each notification send attempt, including
 * channel information, status, and detailed results.
 *
 * @example
 * ```typescript
 * import { NotificationLogEntity } from 'xnest-kit/notification/typeorm';
 *
 * // Use in your TypeORM config:
 * TypeOrmModule.forRoot({
 *   entities: [NotificationLogEntity],
 *   // ...
 * });
 * ```
 */
@Entity({ name: 'notification_logs' })
@Index(['channels'])
@Index(['status'])
@Index(['createdAt'])
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-array')
  channels!: string[];

  @Column({ length: 20, default: 'pending' })
  status!: string;

  @Column('simple-json')
  results!: string;

  @Column('simple-json')
  input!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
