/**
 * @module xnest-kit/audit-log
 * @description Audit log utilities for NestJS.
 * Provides audit logging for tracking user actions and system changes.
 *
 * @example
 * ```typescript
 * import { configAuditLog } from 'xnest-kit/audit-log';
 *
 * const app = await NestFactory.create(AppModule);
 * configAuditLog(app, { storage: 'database', retention: 90 });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Audit Log module.
 * @description Will provide audit logging for user actions and system changes.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class AuditLogModule {
  constructor() {
    throw new Error(
      '[xnest-kit/audit-log] AuditLogModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure audit log for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Audit log configuration options.
 * @throws {Error} Not yet implemented.
 */
export function configAuditLog(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/audit-log] configAuditLog() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
