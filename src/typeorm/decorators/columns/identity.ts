import { PrimaryGeneratedColumn } from 'typeorm';
import type { ColumnOptions } from './options';

/**
 * UUID primary key column.
 *
 * Shorthand for `@PrimaryGeneratedColumn('uuid')`.
 *
 * @param options - Column options (nullable, default — accepted for API consistency, not used for PKs)
 *
 * @example
 * ```typescript
 * import { XEntity, XId } from 'xnest-kit/typeorm';
 *
 * @XEntity('users')
 * export class User {
 *   @XId()
 *   id: string;
 * }
 * ```
 */
export function XId(_options?: ColumnOptions): PropertyDecorator {
  return PrimaryGeneratedColumn('uuid');
}

/**
 * Auto-increment primary key column.
 *
 * Shorthand for `@PrimaryGeneratedColumn('increment')`.
 *
 * @param options - Column options (nullable, default — accepted for API consistency, not used for PKs)
 *
 * @example
 * ```typescript
 * import { XEntity, XIncrementId } from 'xnest-kit/typeorm';
 *
 * @XEntity('products')
 * export class Product {
 *   @XIncrementId()
 *   id: number;
 * }
 * ```
 */
export function XIncrementId(_options?: ColumnOptions): PropertyDecorator {
  return PrimaryGeneratedColumn('increment');
}
