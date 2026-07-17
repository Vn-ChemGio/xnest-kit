import { isPackageInstalled } from '../utils';

if (!isPackageInstalled('@nestjs/cache-manager')) {
  throw new Error(
    'xnest-kit/cache requires @nestjs/cache-manager to be installed',
  );
}

export { configCache } from './config/config-cache';
export { CacheModule } from './cache.module';
export { CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL } from '../shared/cache-keys';
