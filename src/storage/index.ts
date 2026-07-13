/**
 * @module xnest-kit/storage
 * @description Storage utilities for NestJS.
 * Provides cloud storage integration (S3, GCS, Azure Blob).
 *
 * @example
 * ```typescript
 * import { configStorage } from 'xnest-kit/storage';
 *
 * const app = await NestFactory.create(AppModule);
 * configStorage(app, { provider: 's3', bucket: 'my-bucket' });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Storage module.
 * @description Will provide cloud storage integration (S3, GCS, Azure).
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class StorageModule {
  constructor() {
    throw new Error(
      '[xnest-kit/storage] StorageModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure storage for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Storage configuration options (provider, bucket, credentials, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configStorage(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/storage] configStorage() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
