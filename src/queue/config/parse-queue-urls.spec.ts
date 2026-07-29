import { parseQueueUrls } from './parse-queue-urls';

describe('parseQueueUrls', () => {
  it('should return default Redis connection for undefined input', () => {
    const result = parseQueueUrls(undefined);
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
    ]);
  });

  it('should return default Redis connection for empty string', () => {
    const result = parseQueueUrls('');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
    ]);
  });

  it('should return default Redis connection for whitespace-only string', () => {
    const result = parseQueueUrls('   ');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
    ]);
  });

  it('should parse a single Redis URL with default configKey', () => {
    const result = parseQueueUrls('redis://redis-1:6379');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://redis-1:6379' },
    ]);
  });

  it('should parse multiple Redis URLs with auto-incrementing configKeys', () => {
    const result = parseQueueUrls('redis://host1:6379|redis://host2:6380');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://host1:6379' },
      { configKey: 'queue-1', url: 'redis://host2:6380' },
    ]);
  });

  it('should parse three Redis URLs', () => {
    const result = parseQueueUrls(
      'redis://h1:6379|redis://h2:6379|redis://h3:6379',
    );
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://h1:6379' },
      { configKey: 'queue-1', url: 'redis://h2:6379' },
      { configKey: 'queue-2', url: 'redis://h3:6379' },
    ]);
  });

  it('should handle leading pipe as default connection', () => {
    const result = parseQueueUrls('|redis://custom:6379');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
      { configKey: 'queue-1', url: 'redis://custom:6379' },
    ]);
  });

  it('should handle trailing pipe (empty segment ignored after default set)', () => {
    const result = parseQueueUrls('redis://custom:6379|');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://custom:6379' },
    ]);
  });

  it('should handle double pipe (empty middle segment ignored)', () => {
    const result = parseQueueUrls('redis://h1:6379||redis://h2:6379');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://h1:6379' },
      { configKey: 'queue-1', url: 'redis://h2:6379' },
    ]);
  });

  it('should handle spaces around pipe separator', () => {
    const result = parseQueueUrls(' redis://h1:6379 | redis://h2:6379 ');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://h1:6379' },
      { configKey: 'queue-1', url: 'redis://h2:6379' },
    ]);
  });

  it('should handle rediss:// protocol (TLS)', () => {
    const result = parseQueueUrls('rediss://localhost:6380');
    expect(result).toEqual([
      { configKey: 'default', url: 'rediss://localhost:6380' },
    ]);
  });

  it('should only add default once for multiple empty pipes', () => {
    const result = parseQueueUrls('|');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
    ]);
  });

  it('should only add default once for leading pipe with URL', () => {
    const result = parseQueueUrls('||redis://h1:6379');
    expect(result).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
      { configKey: 'queue-1', url: 'redis://h1:6379' },
    ]);
  });
});
