/**
 * Injection tokens for cache stores.
 * Use these to inject cache providers in any module.
 */

/**
 * Inject the primary (first) Keyv cache store.
 * This is the fastest store — typically in-memory.
 *
 * @example
 * ```typescript
 * import { CACHE_KEYV_PRIMARY } from 'xnest-kit/cache';
 *
 * @Injectable()
 * export class UserService {
 *   constructor(@Inject(CACHE_KEYV_PRIMARY) private cache: Keyv) {}
 * }
 * ```
 */
export const CACHE_KEYV_PRIMARY = 'CACHE_KEYV_PRIMARY';

/**
 * Inject ALL Keyv cache stores as an array.
 * Ordered by priority: first = primary, last = fallback.
 *
 * @example
 * ```typescript
 * import { CACHE_KEYV_ALL } from 'xnest-kit/cache';
 *
 * @Injectable()
 * export class CacheService {
 *   constructor(@Inject(CACHE_KEYV_ALL) private stores: Keyv[]) {}
 * }
 * ```
 */
export const CACHE_KEYV_ALL = 'CACHE_KEYV_ALL';
