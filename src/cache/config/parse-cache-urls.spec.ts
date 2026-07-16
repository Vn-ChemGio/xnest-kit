import { parseCacheUrls } from './parse-cache-urls';

describe('parseCacheUrls', () => {
  it('should return memory store for undefined input', () => {
    const result = parseCacheUrls(undefined);
    expect(result).toEqual([{ provider: 'memory', ttl: undefined }]);
  });

  it('should return memory store for empty string', () => {
    const result = parseCacheUrls('');
    expect(result).toEqual([{ provider: 'memory', ttl: undefined }]);
  });

  it('should return memory store for whitespace-only string', () => {
    const result = parseCacheUrls('   ');
    expect(result).toEqual([{ provider: 'memory', ttl: undefined }]);
  });

  it('should parse a single valkey URL', () => {
    const result = parseCacheUrls('redis://localhost:6379');
    expect(result).toEqual([
      { provider: 'valkey', url: 'redis://localhost:6379', ttl: undefined },
    ]);
  });

  it('should parse memory + valkey with leading pipe', () => {
    const result = parseCacheUrls('|redis://localhost:6379');
    expect(result).toEqual([
      { provider: 'memory', ttl: undefined },
      { provider: 'valkey', url: 'redis://localhost:6379', ttl: undefined },
    ]);
  });

  it('should parse memory + multiple valkey URLs', () => {
    const urls = '|redis://host1:6379|redis://host2:6379';
    const result = parseCacheUrls(urls);
    expect(result).toEqual([
      { provider: 'memory', ttl: undefined },
      { provider: 'valkey', url: 'redis://host1:6379', ttl: undefined },
      { provider: 'valkey', url: 'redis://host2:6379', ttl: undefined },
    ]);
  });

  it('should parse multiple valkey URLs without memory', () => {
    const urls = 'redis://host1:6379|redis://host2:6379';
    const result = parseCacheUrls(urls);
    expect(result).toEqual([
      { provider: 'valkey', url: 'redis://host1:6379', ttl: undefined },
      { provider: 'valkey', url: 'redis://host2:6379', ttl: undefined },
    ]);
  });

  it('should handle trailing pipe (memory only once)', () => {
    const result = parseCacheUrls('|');
    expect(result).toEqual([{ provider: 'memory', ttl: undefined }]);
  });

  it('should handle trailing pipe with URLs', () => {
    const result = parseCacheUrls('redis://localhost:6379|');
    expect(result).toEqual([
      { provider: 'valkey', url: 'redis://localhost:6379', ttl: undefined },
      { provider: 'memory', ttl: undefined },
    ]);
  });

  it('should apply ttl to all stores', () => {
    const result = parseCacheUrls('|redis://localhost:6379', 60_000);
    expect(result).toEqual([
      { provider: 'memory', ttl: 60_000 },
      { provider: 'valkey', url: 'redis://localhost:6379', ttl: 60_000 },
    ]);
  });

  it('should handle valkey:// protocol', () => {
    const result = parseCacheUrls('valkey://localhost:6379');
    expect(result).toEqual([
      { provider: 'valkey', url: 'valkey://localhost:6379', ttl: undefined },
    ]);
  });

  it('should handle rediss:// protocol (TLS)', () => {
    const result = parseCacheUrls('rediss://localhost:6380');
    expect(result).toEqual([
      { provider: 'valkey', url: 'rediss://localhost:6380', ttl: undefined },
    ]);
  });

  it('should handle spaces around pipe separator', () => {
    const urls = ' redis://host1:6379 | redis://host2:6379 ';
    const result = parseCacheUrls(urls);
    expect(result).toEqual([
      { provider: 'valkey', url: 'redis://host1:6379', ttl: undefined },
      { provider: 'valkey', url: 'redis://host2:6379', ttl: undefined },
    ]);
  });
});
