import { Inject } from '@nestjs/common';
import { CACHE_INSTANCE } from '../../shared/cache-keys';

/**
 * Inject the NestJS Cache instance (from cache-manager).
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   @InjectCacheInstance()
 *   private cache!: Cache;
 *
 *   async getUser(id: string) {
 *     return this.cache.get(`user:${id}`);
 *   }
 * }
 * ```
 */
export function InjectCacheInstance(): PropertyDecorator {
  return Inject(CACHE_INSTANCE);
}
