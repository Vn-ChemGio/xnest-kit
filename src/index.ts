/**
 * @module xnest-kit
 * @description A modular, production-ready NestJS toolkit.
 *
 * Provides bootstrap, Auth, SaaS, and infrastructure integrations in a single package.
 * Each module can be imported individually for tree-shaking.
 *
 * @example
 * ```typescript
 * // Import all modules
 * import { configOpenApi, configCache, configTypeOrm } from 'xnest-kit';
 *
 * // Import specific module (recommended for tree-shaking)
 * import { configOpenApi } from 'xnest-kit/openapi';
 * import { configCache } from 'xnest-kit/cache';
 * import { configTypeOrm } from 'xnest-kit/typeorm';
 * ```
 *
 * @see {@link https://github.com/Vn-ChemGio/xnest-kit} for documentation
 */

export * from './openapi';
export * from './cache';
export * from './typeorm';
export * from './queue';
export * from './validation';
export * from './notification';
export * from './activity-feed';
export * from './audit-log';
export * from './logger';
export * from './metrics';
export * from './rate-limit';
export * from './storage';
export * from './stripe';
export * from './webhook';
export * from './excel';
