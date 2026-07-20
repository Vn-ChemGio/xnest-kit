jest.mock('@nestjs/cache-manager', () => ({
  CacheModule: {
    register: jest.fn(() => ({
      module: 'CacheModuleMock',
      providers: [],
      exports: [],
    })),
  },
}));

import { CacheModule } from './cache.module';
import { CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL } from '../shared/cache-keys';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockRegister = jest.mocked(NestCacheModule.register);

interface Provider {
  provide: string;
  useValue: unknown;
}

describe('CacheModule', () => {
  it('should be defined', () => {
    expect(CacheModule).toBeDefined();
  });

  describe('forRoot', () => {
    it('should return a dynamic module', () => {
      const result = CacheModule.forRoot();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
    });

    it('should set module to CacheModule', () => {
      const result = CacheModule.forRoot();
      expect(result.module).toBe(CacheModule);
    });

    it('should provide CACHE_KEYV_PRIMARY', () => {
      const result = CacheModule.forRoot();
      const providers = result.providers as Provider[];
      const primary = providers.find((p) => p.provide === CACHE_KEYV_PRIMARY);
      expect(primary).toBeDefined();
      expect(primary?.useValue).toBeDefined();
    });

    it('should provide CACHE_KEYV_ALL', () => {
      const result = CacheModule.forRoot();
      const providers = result.providers as Provider[];
      const all = providers.find((p) => p.provide === CACHE_KEYV_ALL);
      expect(all).toBeDefined();
      expect(Array.isArray(all?.useValue)).toBe(true);
    });

    it('should export CACHE_KEYV_PRIMARY and CACHE_KEYV_ALL', () => {
      const result = CacheModule.forRoot();
      expect(result.exports).toContain(CACHE_KEYV_PRIMARY);
      expect(result.exports).toContain(CACHE_KEYV_ALL);
    });

    it('should call NestCacheModule.register', () => {
      mockRegister.mockClear();
      CacheModule.forRoot({ ttl: 30_000 });
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ ttl: 30_000 }),
      );
    });
  });
});
