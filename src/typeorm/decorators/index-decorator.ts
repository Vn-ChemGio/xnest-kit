import { Index as TypeOrmIndex } from 'typeorm';
import type { IndexOptions } from 'typeorm';

export interface HalfIndexOptions extends IndexOptions {
  /**
   * Column name(s) to index.
   * If omitted, indexes the decorated property.
   */
  columns?: string[];
}

/**
 * Partial index where `deleted_at IS NULL`.
 *
 * Standard pattern for soft-delete entities: only indexes active (non-deleted) rows.
 * Avoids indexing deleted rows, improving index performance.
 *
 * Supports PostgreSQL, SQLite, and CockroachDB.
 *
 * @param options - Index options (name, unique, columns)
 *
 * @example
 * ```typescript
 * import { XEntity, XId, Column, HalfIndex } from 'xnest-kit/typeorm';
 *
 * @XEntity('users')
 * @HalfIndex({ columns: ['email'] })
 * export class User {
 *   @XId()
 *   id: string;
 *
 *   @Column()
 *   email: string;
 * }
 * // → CREATE UNIQUE INDEX ... ON users (email) WHERE deleted_at IS NULL
 * ```
 *
 * @example
 * ```typescript
 * // Named index
 * @XEntity('orders')
 * @HalfIndex('idx_order_status', { columns: ['status'] })
 * export class Order {
 *   @XId()
 *   id: string;
 *
 *   @Column()
 *   status: string;
 * }
 * // → CREATE INDEX idx_order_status ON orders (status) WHERE deleted_at IS NULL
 * ```
 */
export function HalfIndex(
  nameOrOptions?: string | HalfIndexOptions,
  maybeOptions?: HalfIndexOptions,
): ClassDecorator {
  let name: string | undefined;
  let options: HalfIndexOptions;

  if (typeof nameOrOptions === 'string') {
    name = nameOrOptions;
    options = maybeOptions ?? {};
  } else {
    name = undefined;
    options = nameOrOptions ?? {};
  }

  const indexOptions: IndexOptions = {
    ...options,
    where: 'deleted_at IS NULL',
  };

  if (name) {
    return TypeOrmIndex(name, options.columns ?? [], indexOptions);
  }

  if (options.columns) {
    return TypeOrmIndex(options.columns, indexOptions);
  }

  return TypeOrmIndex(indexOptions);
}
