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
 * import { configSwagger, configCache, configTypeOrm } from 'xnest-kit';
 *
 * // Import specific module (recommended for tree-shaking)
 * import { configSwagger } from 'xnest-kit/swagger';
 * import { configCache } from 'xnest-kit/cache';
 * import { configTypeOrm } from 'xnest-kit/typeorm';
 * ```
 *
 * @see {@link https://github.com/Vn-ChemGio/xnest-kit} for documentation
 */

import { isPackageInstalled } from './utils';

/**
 * Conditional swagger re-export.
 * Requires @nestjs/swagger to be installed.
 * If not installed, swagger exports are silently skipped.
 */
if (isPackageInstalled('@nestjs/swagger')) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const swagger = require('./swagger') as Record<string, unknown>;
  Object.keys(swagger).forEach((key) => {
    Object.defineProperty(exports, key, {
      get: () => swagger[key],
      enumerable: true,
    });
  });
}

if (isPackageInstalled('typeorm')) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const typeorm = require('./typeorm') as Record<string, unknown>;
  Object.keys(typeorm).forEach((key) => {
    Object.defineProperty(exports, key, {
      get: () => typeorm[key],
      enumerable: true,
    });
  });
}

export {
  isPackageInstalled,
  assertPackageInstalled,
  lazyImport,
} from './utils';
export * from './cache';
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
