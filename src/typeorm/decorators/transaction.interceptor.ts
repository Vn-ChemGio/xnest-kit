import {
  Inject,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { DataSource, type QueryRunner } from 'typeorm';
import { type Observable, from, switchMap } from 'rxjs';
import {
  TRANSACTION_MANAGER_KEY,
  TRANSACTION_OPTIONS_KEY,
  type TransactionOptions,
} from './transaction.decorator';

/**
 * NestJS interceptor that wraps a route handler in a TypeORM transaction.
 *
 * Reads the transaction options set by `@UseTransaction()` via Reflect
 * metadata. If no metadata is found the handler executes normally
 * (without a transaction).
 *
 * On success the transaction is committed; on any error it is rolled back.
 * The query runner is always released.
 *
 * @example
 * ```typescript
 * import { UseInterceptors, Controller, Post, Body } from '@nestjs/common';
 * import { UseTransaction, GetManager, TransactionInterceptor } from 'xnest-kit/typeorm';
 *
 * @Controller('users')
 * @UseInterceptors(TransactionInterceptor)
 * export class UsersController {
 *   @Post()
 *   @UseTransaction()
 *   async create(@GetManager() em: EntityManager, @Body() dto: CreateUserDto) {
 *     return em.save(em.create(User, dto));
 *   }
 * }
 * ```
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = Reflect.getMetadata(
      TRANSACTION_OPTIONS_KEY,
      context.getHandler(),
    ) as TransactionOptions | undefined;

    if (!options) {
      return next.handle();
    }

    const queryRunner = this.dataSource.createQueryRunner();

    return from(queryRunner.startTransaction(options.isolation)).pipe(
      switchMap(() => {
        this.attachManager(context, queryRunner);

        return next.handle().pipe(
          switchMap((value) =>
            from(queryRunner.commitTransaction()).pipe(
              switchMap(() =>
                from(queryRunner.release()).pipe(
                  switchMap(() => [value] as unknown[]),
                ),
              ),
            ),
          ),

          switchMap(async (err: unknown) => {
            await queryRunner.rollbackTransaction().catch(() => {});
            await queryRunner.release().catch(() => {});
            throw err;
          }),
        );
      }),
    );
  }

  /**
   * Attach the transactional EntityManager to the request object so that
   * `@GetManager()` can retrieve it.
   */
  private attachManager(
    context: ExecutionContext,
    queryRunner: QueryRunner,
  ): void {
    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    request[TRANSACTION_MANAGER_KEY] = queryRunner.manager;
  }
}
