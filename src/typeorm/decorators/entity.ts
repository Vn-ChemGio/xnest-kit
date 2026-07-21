import {
  Entity as TypeOrmEntity,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { EntityOptions } from 'typeorm';

export interface XEntityOptions extends EntityOptions {
  /** Enable soft delete via @DeleteDateColumn. @default true */
  softDelete?: boolean;
  /** Enable @CreateDateColumn + @UpdateDateColumn. @default true */
  timestamps?: boolean;
}

/**
 * Enhanced Entity decorator with soft delete and timestamps.
 *
 * Wraps `@Entity` and auto-applies:
 * - `@DeleteDateColumn()` — soft delete (unless `softDelete: false`)
 * - `@CreateDateColumn()` — creation timestamp
 * - `@UpdateDateColumn()` — last update timestamp
 *
 * @param tableName - Table name (optional, same as @Entity)
 * @param options - Entity options + softDelete/timestamps flags
 *
 * @example
 * ```typescript
 * import { XEntity, XId, Column } from 'xnest-kit/typeorm';
 *
 * @XEntity('users')
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @Column()
 *   name: string;
 *
 *   // Auto: deletedAt, createdAt, updatedAt
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Disable soft delete
 * @XEntity('logs', { softDelete: false })
 * export class Log {
 *   @XId()
 *   id: string;
 *
 *   // Auto: createdAt, updatedAt (no deletedAt)
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Disable all auto columns
 * @XEntity('config', { softDelete: false, timestamps: false })
 * export class Config {
 *   @Column({ primary: true })
 *   key: string;
 * }
 * ```
 */
export function XEntity(
  tableNameOrOptions?: string | XEntityOptions,
  maybeOptions?: XEntityOptions,
): ClassDecorator {
  let tableName: string | undefined;
  let options: XEntityOptions;

  if (typeof tableNameOrOptions === 'string') {
    tableName = tableNameOrOptions;
    options = maybeOptions ?? {};
  } else {
    tableName = undefined;
    options = tableNameOrOptions ?? {};
  }

  const { softDelete = true, timestamps = true, ...entityOptions } = options;

  return (target) => {
    // Apply base @Entity
    if (tableName) {
      TypeOrmEntity(tableName, entityOptions)(target);
    } else {
      TypeOrmEntity(entityOptions)(target);
    }

    // Apply timestamps (column decorators need prototype)
    if (timestamps) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      CreateDateColumn({ name: 'created_at' })(target.prototype, 'createdAt');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      UpdateDateColumn({ name: 'updated_at' })(target.prototype, 'updatedAt');
    }

    // Apply soft delete (column decorators need prototype)
    if (softDelete) {
      DeleteDateColumn({ name: 'deleted_at', nullable: true })(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        target.prototype,
        'deletedAt',
      );
    }
  };
}
