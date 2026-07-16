jest.mock('@keyv/redis', () => ({
  createKeyv: jest.fn(() => ({
    store: 'mock-redis-store',
    on: jest.fn(),
  })),
}));

import { configCache } from './config-cache';

describe('configCache', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['CACHE_URLS'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return a CacheConfig with stores', () => {
    const config = configCache();
    expect(config).toBeDefined();
    expect(config.stores).toBeInstanceOf(Array);
    expect(config.stores.length).toBeGreaterThan(0);
  });

  it('should have primary store as first store', () => {
    const config = configCache();
    expect(config.primary).toBe(config.stores[0]);
  });

  it('should default to memory provider', () => {
    const config = configCache();
    expect(config.primary.provider).toBe('memory');
  });

  it('should parse CACHE_URLS from environment', () => {
    process.env['CACHE_URLS'] = '|redis://localhost:6379';
    const config = configCache();
    expect(config.stores.length).toBe(2);
    expect(config.stores[0].provider).toBe('memory');
    expect(config.stores[1].provider).toBe('valkey');
  });

  it('should use provided stores over env', () => {
    process.env['CACHE_URLS'] = 'redis://from-env:6379';
    const config = configCache({
      stores: [{ provider: 'memory', ttl: 5000 }],
    });
    expect(config.stores.length).toBe(1);
    expect(config.stores[0].provider).toBe('memory');
  });

  it('should apply ttl option', () => {
    const config = configCache({ ttl: 30_000 });
    expect(config.ttl).toBe(30_000);
  });

  it('should default isGlobal to true', () => {
    const config = configCache();
    expect(config.isGlobal).toBe(true);
  });

  it('should set isGlobal to false when specified', () => {
    const config = configCache({ isGlobal: false });
    expect(config.isGlobal).toBe(false);
  });

  it('should default nonBlocking to false', () => {
    const config = configCache();
    expect(config.nonBlocking).toBe(false);
  });

  it('should set nonBlocking when specified', () => {
    const config = configCache({ nonBlocking: true });
    expect(config.nonBlocking).toBe(true);
  });
});
