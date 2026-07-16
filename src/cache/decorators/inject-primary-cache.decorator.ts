import { Inject } from '@nestjs/common';
import { CACHE_KEYV_PRIMARY } from '../../shared/cache-keys';

/**
 * Inject the primary Keyv cache store.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   @InjectPrimaryCache()
 *   private cache!: Keyv;
 *
 *   async getUser(id: string) {
 *     return this.cache.get(`user:${id}`);
 *   }
 * }
 * ```
 */
export function InjectPrimaryCache(): PropertyDecorator {
  return Inject(CACHE_KEYV_PRIMARY);
}
