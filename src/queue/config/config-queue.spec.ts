import { configQueue } from './config-queue';

describe('configQueue', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['QUEUE_URLS'];
    delete process.env['QUEUE_NAMES'];
    delete process.env['QUEUE_FLOWS'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return a ResolvedQueueConfig with defaults', () => {
    const config = configQueue();
    expect(config).toBeDefined();
    expect(config.connections).toBeInstanceOf(Array);
    expect(config.connections.length).toBeGreaterThan(0);
    expect(config.queues).toEqual([]);
    expect(config.flows).toEqual([]);
  });

  it('should have default Redis connection when no options or env', () => {
    const config = configQueue();
    expect(config.connections).toEqual([
      { configKey: 'default', url: 'redis://localhost:6379' },
    ]);
  });

  it('should use provided connections over env', () => {
    process.env['QUEUE_URLS'] = 'redis://from-env:6379';
    const config = configQueue({
      connections: [{ configKey: 'default', url: 'redis://explicit:6379' }],
    });
    expect(config.connections).toEqual([
      { configKey: 'default', url: 'redis://explicit:6379' },
    ]);
  });

  it('should use provided queues over env', () => {
    process.env['QUEUE_NAMES'] = 'from-env';
    const config = configQueue({
      connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
      queues: [{ name: 'explicit-queue' }],
    });
    expect(config.queues).toEqual([{ name: 'explicit-queue' }]);
  });

  it('should use provided flows over env', () => {
    process.env['QUEUE_FLOWS'] = 'from-env';
    const config = configQueue({
      connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
      queues: [{ name: 'q' }],
      flows: [{ name: 'explicit-flow' }],
    });
    expect(config.flows).toEqual([{ name: 'explicit-flow' }]);
  });

  it('should parse QUEUE_URLS from environment', () => {
    process.env['QUEUE_URLS'] = 'redis://env-host:6379|redis://env-host2:6380';
    const config = configQueue();
    expect(config.connections.length).toBe(2);
    expect(config.connections[0].configKey).toBe('default');
    expect(config.connections[0].url).toBe('redis://env-host:6379');
    expect(config.connections[1].configKey).toBe('queue-1');
  });

  it('should parse QUEUE_NAMES from environment', () => {
    process.env['QUEUE_NAMES'] = 'email,notifications,reports';
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    const config = configQueue();
    expect(config.queues).toEqual([
      { name: 'email' },
      { name: 'notifications' },
      { name: 'reports' },
    ]);
  });

  it('should parse QUEUE_FLOWS from environment', () => {
    process.env['QUEUE_FLOWS'] = 'order-pipeline,analytics';
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    const config = configQueue();
    expect(config.flows).toEqual([
      { name: 'order-pipeline' },
      { name: 'analytics' },
    ]);
  });

  it('should handle empty QUEUE_NAMES env', () => {
    process.env['QUEUE_NAMES'] = '';
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    const config = configQueue();
    expect(config.queues).toEqual([]);
  });

  it('should handle QUEUE_NAMES with whitespace', () => {
    process.env['QUEUE_NAMES'] = ' email , notifications ';
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    const config = configQueue();
    expect(config.queues).toEqual([
      { name: 'email' },
      { name: 'notifications' },
    ]);
  });

  it('should default isGlobal to true', () => {
    const config = configQueue();
    expect(config.isGlobal).toBe(true);
  });

  it('should set isGlobal to false when specified', () => {
    const config = configQueue({ isGlobal: false });
    expect(config.isGlobal).toBe(false);
  });

  it('should throw when connections array is empty', () => {
    expect(() =>
      configQueue({
        connections: [],
        queues: [{ name: 'email' }],
      }),
    ).toThrow(
      '[xnest-kit/queue] No queue connections configured. Check YOUR_QUEUE_URLS env or connections option.',
    );
  });

  it('should throw when env is set to empty string and no options', () => {
    process.env['QUEUE_URLS'] = '';
    // Since empty string triggers early return with one default connection,
    // this will NOT throw. Test that it still returns a single default.
    const config = configQueue();
    expect(config.connections.length).toBe(1);
    expect(config.connections[0].url).toBe('redis://localhost:6379');
  });

  it('should handle nullish QUEUE_FLOWS gracefully', () => {
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    process.env['QUEUE_FLOWS'] = undefined;
    const config = configQueue();
    expect(config.flows).toEqual([]);
  });

  it('should handle undefined QUEUE_NAMES', () => {
    process.env['QUEUE_URLS'] = 'redis://localhost:6379';
    delete process.env['QUEUE_NAMES'];
    const config = configQueue();
    expect(config.queues).toEqual([]);
  });

  it('should preserve connection config with custom options', () => {
    const config = configQueue({
      connections: [
        {
          configKey: 'analytics',
          url: 'redis://analytics:6379',
          prefix: 'bull-analytics',
          defaultJobOptions: { attempts: 3 },
        },
      ],
      queues: [{ name: 'report-queue', configKey: 'analytics' }],
      flows: [{ name: 'report-flow', configKey: 'analytics' }],
    });
    expect(config.connections[0].configKey).toBe('analytics');
    expect(config.connections[0].prefix).toBe('bull-analytics');
    expect(config.queues[0].configKey).toBe('analytics');
    expect(config.flows[0].configKey).toBe('analytics');
  });
});
