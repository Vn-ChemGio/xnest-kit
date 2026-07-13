/**
 * @module xnest-kit/typeorm
 * @description TypeORM utilities for NestJS.
 * Provides quick configuration for TypeORM with entity and column decorators.
 *
 * @example
 * ```typescript
 * import { configTypeOrm } from 'xnest-kit/typeorm';
 *
 * const app = await NestFactory.create(AppModule);
 * configTypeOrm(app, { type: 'postgres', host: 'localhost', port: 5432 });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: TypeORM module.
 * @description Will provide TypeORM configuration and entity decorators.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class TypeOrmModule {
  constructor() {
    throw new Error(
      '[xnest-kit/typeorm] TypeOrmModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure TypeORM for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - TypeORM configuration options (type, host, port, database, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configTypeOrm(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/typeorm] configTypeOrm() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Decorator for quickly defining TypeORM entities.
 * @param _tableName - Optional table name override.
 * @throws {Error} Not yet implemented.
 */
export function XEntity(_tableName?: string): ClassDecorator {
  throw new Error(
    '[xnest-kit/typeorm] XEntity decorator is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Decorator for quickly defining TypeORM columns.
 * @param _options - Column configuration options.
 * @throws {Error} Not yet implemented.
 */
export function XColumn(_options?: Record<string, unknown>): PropertyDecorator {
  throw new Error(
    '[xnest-kit/typeorm] XColumn decorator is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
