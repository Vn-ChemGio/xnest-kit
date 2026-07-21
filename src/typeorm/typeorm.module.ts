import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configTypeOrm } from './config';

/**
 * TypeORM module for NestJS.
 *
 * Wraps `@nestjs/typeorm` `TypeOrmModule` with simplified configuration
 * via `configTypeOrm()`.
 *
 * @example
 * ```typescript
 * import { TypeOrmModule } from 'xnest-kit/typeorm';
 *
 * @Module({
 *   imports: [TypeOrmModule.forRoot({ type: 'postgres', host: 'localhost' })],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Using DATABASE_URL env variable
 * @Module({
 *   imports: [TypeOrmModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class TypeOrmModule {
  /**
   * Configure TypeORM module with options.
   *
   * @param options - TypeOrmModuleOptions or omit for env var resolution.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRoot(options?: TypeOrmModuleOptions): DynamicModule {
    return NestTypeOrmModule.forRoot(configTypeOrm(options));
  }
}
