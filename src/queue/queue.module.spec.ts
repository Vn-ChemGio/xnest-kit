jest.mock('@nestjs/bullmq', () => {
  const mockForRoot = jest.fn((..._args: unknown[]) => ({
    module: 'BullRootModuleMock',
    providers: [],
    exports: [],
    global: true,
  }));
  const mockRegisterQueue = jest.fn((..._args: unknown[]) => ({
    module: 'BullQueueModuleMock',
    providers: [],
    exports: [],
  }));
  const mockRegisterFlowProducer = jest.fn((..._args: unknown[]) => ({
    module: 'BullFlowModuleMock',
    providers: [],
    exports: [],
  }));
  return {
    BullModule: {
      forRoot: mockForRoot,
      registerQueue: mockRegisterQueue,
      registerFlowProducer: mockRegisterFlowProducer,
    },
    getQueueToken: jest.fn((name?: string) => `BullQueue_${name ?? 'default'}`),
    getQueueOptionsToken: jest.fn(
      (name?: string) => `BullMQQueueOptions_${name ?? 'default'}`,
    ),
    getFlowProducerToken: jest.fn(
      (name?: string) => `BullFlowProducer_${name ?? 'default'}`,
    ),
    getFlowProducerOptionsToken: jest.fn(
      (name?: string) => `BullMQFlowProducerOptions_${name ?? 'default'}`,
    ),
    getSharedConfigToken: jest.fn(
      (key?: string) => `BULLMQ_CONFIG(${key ?? 'default'})`,
    ),
  };
});

import { QueueModule } from './queue.module';
import { QUEUE_PRIMARY, QUEUE_ALL } from '../shared/queue-keys';
import { BullModule } from '@nestjs/bullmq';

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockForRoot = jest.mocked(BullModule.forRoot);
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockRegisterQueue = jest.mocked(BullModule.registerQueue);
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockRegisterFlowProducer = jest.mocked(BullModule.registerFlowProducer);

interface Provider {
  provide: string;
  useValue?: unknown;
  useExisting?: string;
}

describe('QueueModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(QueueModule).toBeDefined();
  });

  describe('forRoot', () => {
    it('should return a dynamic module', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
      });
      expect(mod).toBeDefined();
      expect(mod.module).toBe(QueueModule);
    });

    it('should set module to QueueModule', () => {
      const mod = QueueModule.forRoot();
      expect(mod.module).toBe(QueueModule);
    });

    it('should call BullModule.forRoot for each connection', () => {
      QueueModule.forRoot({
        connections: [
          { configKey: 'default', url: 'redis://localhost:6379' },
          { configKey: 'analytics', url: 'redis://analytics:6379' },
        ],
        queues: [{ name: 'email' }],
      });
      expect(mockForRoot).toHaveBeenCalledTimes(2);
    });

    it('should default configKey to "default" when omitted from connection', () => {
      QueueModule.forRoot({
        connections: [{ url: 'redis://nokey:6379' }],
        queues: [{ name: 'email' }],
      });
      expect(mockForRoot).toHaveBeenCalledWith(
        expect.objectContaining({
          connection: { url: 'redis://nokey:6379' },
        }),
      );
    });

    it('should call BullModule.forRoot with configKey for named connections', () => {
      QueueModule.forRoot({
        connections: [
          { configKey: 'default', url: 'redis://default:6379' },
          { configKey: 'analytics', url: 'redis://analytics:6379' },
          { configKey: 'logs', url: 'redis://logs:6379' },
        ],
        queues: [{ name: 'email' }],
      });
      // default → BullModule.forRoot(opts)
      // analytics → BullModule.forRoot('analytics', opts)
      // logs → BullModule.forRoot('logs', opts)
      expect(mockForRoot).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          connection: { url: 'redis://default:6379' },
        }),
      );
      expect(mockForRoot).toHaveBeenNthCalledWith(
        2,
        'analytics',
        expect.objectContaining({
          connection: { url: 'redis://analytics:6379' },
        }),
      );
      expect(mockForRoot).toHaveBeenNthCalledWith(
        3,
        'logs',
        expect.objectContaining({ connection: { url: 'redis://logs:6379' } }),
      );
    });

    it('should call BullModule.registerQueue with queue configs', () => {
      QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }, { name: 'notifications' }],
      });
      expect(mockRegisterQueue).toHaveBeenCalledWith(
        { name: 'email', configKey: undefined, defaultJobOptions: undefined },
        {
          name: 'notifications',
          configKey: undefined,
          defaultJobOptions: undefined,
        },
      );
    });

    it('should pass configKey and defaultJobOptions to registerQueue', () => {
      QueueModule.forRoot({
        connections: [
          { configKey: 'default', url: 'redis://localhost:6379' },
          { configKey: 'analytics', url: 'redis://analytics:6379' },
        ],
        queues: [
          { name: 'email' },
          {
            name: 'reports',
            configKey: 'analytics',
            defaultJobOptions: { attempts: 5 },
          },
        ],
      });
      expect(mockRegisterQueue).toHaveBeenCalledWith(
        { name: 'email', configKey: undefined, defaultJobOptions: undefined },
        {
          name: 'reports',
          configKey: 'analytics',
          defaultJobOptions: { attempts: 5 },
        },
      );
    });

    it('should call BullModule.registerFlowProducer when flows provided', () => {
      QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
        flows: [{ name: 'order-pipeline' }],
      });
      expect(mockRegisterFlowProducer).toHaveBeenCalledWith({
        name: 'order-pipeline',
        configKey: undefined,
      });
    });

    it('should NOT call registerFlowProducer when no flows', () => {
      QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
      });
      expect(mockRegisterFlowProducer).not.toHaveBeenCalled();
    });

    it('should pass flow configKey to registerFlowProducer', () => {
      QueueModule.forRoot({
        connections: [
          { configKey: 'default', url: 'redis://localhost:6379' },
          { configKey: 'analytics', url: 'redis://analytics:6379' },
        ],
        queues: [{ name: 'email' }],
        flows: [{ name: 'analytics-flow', configKey: 'analytics' }],
      });
      expect(mockRegisterFlowProducer).toHaveBeenCalledWith({
        name: 'analytics-flow',
        configKey: 'analytics',
      });
    });

    it('should provide QUEUE_PRIMARY', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
      });
      const providers = mod.providers as Provider[];
      const primary = providers.find((p) => p.provide === QUEUE_PRIMARY);
      expect(primary).toBeDefined();
      expect(primary?.useExisting).toBe('BullQueue_email');
    });

    it('should NOT provide QUEUE_PRIMARY when no queues', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
      });
      const providers = mod.providers as Provider[];
      const primary = providers.find((p) => p.provide === QUEUE_PRIMARY);
      expect(primary).toBeUndefined();
    });

    it('should provide QUEUE_ALL', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }, { name: 'notifications' }],
      });
      const providers = mod.providers as Provider[];
      const all = providers.find((p) => p.provide === QUEUE_ALL);
      expect(all).toBeDefined();
      expect(all?.useValue).toEqual([
        { name: 'email', token: 'BullQueue_email' },
        { name: 'notifications', token: 'BullQueue_notifications' },
      ]);
    });

    it('should provide empty QUEUE_ALL when no queues', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
      });
      const providers = mod.providers as Provider[];
      const all = providers.find((p) => p.provide === QUEUE_ALL);
      expect(all).toBeDefined();
      expect(all?.useValue).toEqual([]);
    });

    it('should default isGlobal to true', () => {
      const mod = QueueModule.forRoot();
      expect(mod.global).toBe(true);
    });

    it('should set isGlobal to false when specified', () => {
      const mod = QueueModule.forRoot({ isGlobal: false });
      expect(mod.global).toBe(false);
    });

    it('should export QUEUE_PRIMARY and QUEUE_ALL', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
      });
      expect(mod.exports).toContain(QUEUE_PRIMARY);
      expect(mod.exports).toContain(QUEUE_ALL);
    });

    it('should export the queue dynamic module for re-export', () => {
      const mod = QueueModule.forRoot({
        connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
        queues: [{ name: 'email' }],
      });
      const queueExport = (mod.exports as (string | symbol | object)[]).find(
        (e) => typeof e === 'object' && e !== null && 'module' in e,
      );
      expect(queueExport).toBeDefined();
      expect((queueExport as { module: string }).module).toBe(
        'BullQueueModuleMock',
      );
    });
  });
});
