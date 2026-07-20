import { CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL } from './cache-keys';

describe('cache-keys', () => {
  it('should export CACHE_KEYV_PRIMARY', () => {
    expect(CACHE_KEYV_PRIMARY).toBe('CACHE_KEYV_PRIMARY');
  });

  it('should export CACHE_KEYV_ALL', () => {
    expect(CACHE_KEYV_ALL).toBe('CACHE_KEYV_ALL');
  });

  it('CACHE_KEYV_PRIMARY and CACHE_KEYV_ALL should be different', () => {
    expect(CACHE_KEYV_PRIMARY).not.toBe(CACHE_KEYV_ALL);
  });

  it('should be string injection tokens', () => {
    expect(typeof CACHE_KEYV_PRIMARY).toBe('string');
    expect(typeof CACHE_KEYV_ALL).toBe('string');
  });
});
