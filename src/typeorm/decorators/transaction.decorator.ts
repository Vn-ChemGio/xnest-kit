import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

/** Reflect metadata key for transaction options. */
export const TRANSACTION_OPTIONS_KEY = 'xnest-kit:transaction-options';

/** Request property key used to store the transactional EntityManager. */
export const TRANSACTION_MANAGER_KEY = 'xnest-kit:transaction-manager';

/**
 * Options for the `@UseTransaction()` decorator.
 */
export interface TransactionOptions {
  /**
   * Database isolation level for the transaction.
   *
   * @example 'READ COMMITTED'
   */
  isolation?: IsolationLevel;
}

/**
 * Method decorator that wraps the handler in a database transaction.
 *
 * When applied, the `TransactionInterceptor` starts a query-runner transaction
 * before the handler executes. The transactional `EntityManager` is then
 * available via the `@GetManager()` parameter decorator.
 *
 * On success the transaction is committed; on any error it is rolled back
 * automatically.
 *
 * Must be used together with `@UseInterceptors(TransactionInterceptor)`.
 *
 * @param options - Transaction options (e.g. isolation level)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * import { UseInterceptors } from '@nestjs/common';
 * import { UseTransaction, GetManager, TransactionInterceptor } from 'xnest-kit/typeorm';
 *
 * @Controller('orders')
 * @UseInterceptors(TransactionInterceptor)
 * export class OrdersController {
 *   @Post()
 *   @UseTransaction({ isolation: 'SERIALIZABLE' })
 *   async create(
 *     @GetManager() em: EntityManager,
 *     @Body() dto: CreateOrderDto,
 *   ) {
 *     const order = em.create(Order, dto);
 *     await em.save(order);
 *     // auto-commit on success, auto-rollback on error
 *     return order;
 *   }
 * }
 * ```
 */
export function UseTransaction(options?: TransactionOptions): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    _descriptor: TypedPropertyDescriptor<unknown>,
  ) => {
    Reflect.defineMetadata(
      TRANSACTION_OPTIONS_KEY,
      options ?? {},
      target,
      String(propertyKey),
    );
  };
}

/**
 * Parameter decorator that injects the transactional `EntityManager`.
 *
 * The EntityManager is provided by the `TransactionInterceptor` and
 * is scoped to the current request's transaction.
 *
 * @returns Parameter decorator yielding `EntityManager`
 *
 * @example
 * ```typescript
 * @Post()
 * @UseTransaction()
 * async create(@GetManager() em: EntityManager, @Body() dto: CreateDto) {
 *   const entity = em.create(Entity, dto);
 *   await em.save(entity);
 *   return entity;
 * }
 * ```
 */
export const GetManager = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Record<string, unknown>>();
    return request[TRANSACTION_MANAGER_KEY];
  },
);
