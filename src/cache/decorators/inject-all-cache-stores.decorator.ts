import { Inject } from '@nestjs/common';
import { CACHE_KEYV_ALL } from '../../shared/cache-keys';

/**
 * Inject all Keyv cache stores as an array.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CacheService {
 *   @InjectAllCacheStores()
 *   private stores!: Keyv[];
 *
 *   async writeToAll(key: string, value: unknown) {
 *     await Promise.all(this.stores.map(s => s.set(key, value)));
 *   }
 * }
 * ```
 */
export function InjectAllCacheStores(): PropertyDecorator {
  return Inject(CACHE_KEYV_ALL);
}
