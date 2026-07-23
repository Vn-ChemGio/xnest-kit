import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';

/**
 * Interceptor that wraps request handling in a database transaction.
 *
 * Useful for ensuring notification sends and log persistence
 * are committed atomically.
 *
 * @example
 * ```typescript
 * @UseInterceptors(TransactionInterceptor)
 * @Post('notify')
 * async sendNotification(@Body() body: SendInput) {
 *   return this.notificationService.send(body);
 * }
 * ```
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await next.handle().toPromise();
      await queryRunner.commitTransaction();
      return new Observable((subscriber) => {
        subscriber.next(result);
        subscriber.complete();
      });
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
