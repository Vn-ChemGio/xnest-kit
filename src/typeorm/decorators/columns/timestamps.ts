import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';
import type { ColumnOptions } from './options';

/**
 * Creation timestamp column.
 *
 * Shorthand for `@CreateDateColumn({ name: 'created_at' })`.
 * Set once on insert, never updated.
 *
 * @param options - Column options (nullable)
 *
 * @example
 * ```typescript
 * import { XEntity, XId, XCreatedAt } from 'xnest-kit/typeorm';
 *
 * @XEntity('users', { timestamps: false })
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @XCreatedAt()
 *   createdAt: Date;
 * }
 * ```
 */
export function XCreatedAt(options?: ColumnOptions): PropertyDecorator {
  return CreateDateColumn({ name: 'created_at', nullable: options?.nullable });
}

/**
 * Last update timestamp column.
 *
 * Shorthand for `@UpdateDateColumn({ name: 'updated_at' })`.
 * Updated on every persist.
 *
 * @param options - Column options (nullable)
 *
 * @example
 * ```typescript
 * import { XEntity, XId, XUpdatedAt } from 'xnest-kit/typeorm';
 *
 * @XEntity('users', { timestamps: false })
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @XUpdatedAt()
 *   updatedAt: Date;
 * }
 * ```
 */
export function XUpdatedAt(options?: ColumnOptions): PropertyDecorator {
  return UpdateDateColumn({ name: 'updated_at', nullable: options?.nullable });
}

/**
 * Soft delete timestamp column.
 *
 * Shorthand for `@DeleteDateColumn({ name: 'deleted_at', nullable: true })`.
 * Set on soft delete, `null` when active.
 *
 * @param options - Column options (nullable)
 *
 * @example
 * ```typescript
 * import { XEntity, XId, XDeletedAt } from 'xnest-kit/typeorm';
 *
 * @XEntity('users', { softDelete: false })
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @XDeletedAt()
 *   deletedAt: Date | null;
 * }
 * ```
 */
export function XDeletedAt(options?: ColumnOptions): PropertyDecorator {
  return DeleteDateColumn({
    name: 'deleted_at',
    nullable: options?.nullable ?? true,
  });
}

/**
 * Optimistic locking version column.
 *
 * Shorthand for `@VersionColumn()`. Auto-increments on each persist.
 *
 * @param options - Column options (nullable)
 *
 * @example
 * ```typescript
 * import { XEntity, XId, XVersion } from 'xnest-kit/typeorm';
 *
 * @XEntity('users')
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @XVersion()
 *   version: number;
 * }
 * ```
 */
export function XVersion(options?: ColumnOptions): PropertyDecorator {
  return VersionColumn({ nullable: options?.nullable });
}
