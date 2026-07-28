import { Test, type TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_STORE,
  NOTIFICATION_QUEUE,
} from '../shared/notification-keys';
import type {
  NotificationDiagnostics,
  NotificationModuleOptions,
  NotificationStore,
  SendInput,
} from './notification.type';
import type { NotificationProvider } from './notification.constants';

const createMockProvider = (
  name: string,
  channel: string,
  shouldSucceed = true,
): NotificationProvider => ({
  name,
  channel,
  send: jest.fn().mockResolvedValue({
    success: shouldSucceed,
    providerName: name,
    channel,
    messageId: shouldSucceed ? `msg-${name}` : undefined,
    error: shouldSucceed ? undefined : 'Send failed',
  }),
});

const createMockStore = (): NotificationStore => ({
  save: jest.fn().mockImplementation((record) =>
    Promise.resolve({
      ...record,
      id: 'test-id-123',
      createdAt: new Date(),
    }),
  ),
  findById: jest.fn().mockResolvedValue(null),
  findByChannel: jest.fn().mockResolvedValue([]),
  updateStatus: jest.fn().mockResolvedValue(undefined),
});

const defaultOptions: NotificationModuleOptions = {
  providers: {},
};

describe('NotificationService', () => {
  let service: NotificationService;

  describe('without store or queue', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: defaultOptions },
        ],
      }).compile();

      service = module.get(NotificationService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('send', () => {
      it('should throw when no providers configured', async () => {
        await expect(
          service.send('email', {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          }),
        ).rejects.toThrow('No providers configured for channel "email"');
      });

      it('should send through configured provider', async () => {
        const provider = createMockProvider('test-email', 'email');
        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const result = await svc.send('email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        });

        expect(result.success).toBe(true);
        expect(result.channels).toHaveLength(1);
        expect(result.channels[0].channel).toBe('email');
        expect(result.channels[0].results).toHaveLength(1);
        expect(result.channels[0].results[0].providerName).toBe('test-email');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(provider.send).toHaveBeenCalledWith({
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        });
      });

      it('should handle provider failure', async () => {
        const provider = createMockProvider('failing-provider', 'email', false);
        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const result = await svc.send('email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        });

        expect(result.success).toBe(false);
        expect(result.channels[0].results[0].success).toBe(false);
        expect(result.channels[0].results[0].error).toBe('Send failed');
      });

      it('should throw when provider throws error', async () => {
        const provider: NotificationProvider = {
          name: 'throwing-provider',
          channel: 'email',
          send: jest.fn().mockRejectedValue(new Error('Network error')),
        };

        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        await expect(
          svc.send('email', {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          }),
        ).rejects.toThrow('Network error');
      });

      it('should throw when provider throws string error', async () => {
        const provider: NotificationProvider = {
          name: 'string-error-provider',
          channel: 'email',
          send: jest.fn().mockRejectedValue('String error'),
        };

        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        await expect(
          svc.send('email', {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          }),
        ).rejects.toBe('String error');
      });

      it('should throw when provider throws unknown error', async () => {
        const provider: NotificationProvider = {
          name: 'unknown-error-provider',
          channel: 'email',
          send: jest.fn().mockRejectedValue(42),
        };

        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        await expect(
          svc.send('email', {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          }),
        ).rejects.toBe(42);
      });

      it('should send partial success with multiple providers', async () => {
        const provider1 = createMockProvider('provider-1', 'email', true);
        const provider2 = createMockProvider('provider-2', 'email', false);

        const options: NotificationModuleOptions = {
          providers: { email: [provider1, provider2] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const result = await svc.send('email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        });

        expect(result.success).toBe(false);
        expect(result.channels[0].results).toHaveLength(2);
        expect(result.channels[0].results[0].success).toBe(true);
        expect(result.channels[0].results[1].success).toBe(false);
      });

      it('should pass template options', async () => {
        const provider = createMockProvider('test-email', 'email');
        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        await svc.send(
          'email',
          {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
          { template: 'welcome', templateData: { name: 'John' } },
        );

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(provider.send).toHaveBeenCalled();
      });
    });

    describe('sendFromInput', () => {
      it('should return failure when no channel detected', async () => {
        const result = await service.sendFromInput({});

        expect(result.success).toBe(false);
        expect(result.channels).toHaveLength(0);
      });

      it('should detect email channel from input', async () => {
        const provider = createMockProvider('test-email', 'email');
        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const input: SendInput = {
          email: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
        };

        const result = await svc.sendFromInput(input);

        expect(result.success).toBe(true);
        expect(result.channels[0].channel).toBe('email');
      });

      it('should detect sms channel from input', async () => {
        const provider = createMockProvider('test-sms', 'sms');
        const options: NotificationModuleOptions = {
          providers: { sms: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const input: SendInput = {
          sms: {
            to: '+1234567890',
            body: 'Hello',
          },
        };

        const result = await svc.sendFromInput(input);

        expect(result.success).toBe(true);
        expect(result.channels[0].channel).toBe('sms');
      });
    });

    describe('enqueue', () => {
      it('should return queued false when no queue', async () => {
        const result = await service.enqueue({
          email: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
        });

        expect(result.queued).toBe(false);
      });
    });

    describe('getStatus', () => {
      it('should return null when no store', async () => {
        const result = await service.getStatus('test-id');

        expect(result).toBeNull();
      });
    });

    describe('getByChannel', () => {
      it('should return empty array when no store', async () => {
        const result = await service.getByChannel('email');

        expect(result).toEqual([]);
      });

      it('should respect limit parameter', async () => {
        const result = await service.getByChannel('email', 5);

        expect(result).toEqual([]);
      });
    });

    describe('getProviders', () => {
      it('should return empty array when no providers configured', () => {
        const result = service.getProviders('email');

        expect(result).toEqual([]);
      });

      it('should return configured providers', async () => {
        const provider = createMockProvider('test-email', 'email');
        const options: NotificationModuleOptions = {
          providers: { email: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const result = svc.getProviders('email');

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('test-email');
      });
    });
  });

  describe('with store', () => {
    let mockStore: NotificationStore;

    beforeEach(async () => {
      mockStore = createMockStore();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: defaultOptions },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      service = module.get(NotificationService);
    });

    it('should persist notification when storage enabled', async () => {
      const provider = createMockProvider('test-email', 'email');
      const options: NotificationModuleOptions = {
        providers: { email: [provider] },
        storage: { enabled: true, inject: 'MOCK_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const result = await svc.send('email', {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Hello',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockStore.save).toHaveBeenCalled();
      expect(result.id).toBe('test-id-123');
    });

    it('should persist to store even when provider throws', async () => {
      const failProvider = createMockProvider('fail-email', 'email');
      (failProvider.send as jest.Mock).mockRejectedValue(
        new Error('SMTP connection refused'),
      );
      const options: NotificationModuleOptions = {
        providers: { email: [failProvider] },
        storage: { enabled: true, inject: 'MOCK_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      const svc = module.get(NotificationService);

      await expect(
        svc.send('email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        }),
      ).rejects.toThrow('SMTP connection refused');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockStore.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          channels: ['email'],
        }),
      );
    });

    it('should not persist when storage disabled', async () => {
      const provider = createMockProvider('test-email', 'email');
      const options: NotificationModuleOptions = {
        providers: { email: [provider] },
        storage: { enabled: false },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      await svc.send('email', {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Hello',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockStore.save).not.toHaveBeenCalled();
    });

    describe('getStatus', () => {
      it('should retrieve notification by id', async () => {
        const mockRecord = {
          id: 'test-id',
          channels: ['email'] as const,
          status: 'sent' as const,
          results: [],
          input: {},
          createdAt: new Date(),
        };

        (mockStore.findById as jest.Mock).mockResolvedValue(mockRecord);

        const result = await service.getStatus('test-id');

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mockStore.findById).toHaveBeenCalledWith('test-id');
        expect(result).toEqual(mockRecord);
      });
    });

    describe('getByChannel', () => {
      it('should retrieve notifications by channel', async () => {
        const mockRecords = [
          {
            id: '1',
            channels: ['email'] as const,
            status: 'sent' as const,
            results: [],
            input: {},
            createdAt: new Date(),
          },
        ];

        (mockStore.findByChannel as jest.Mock).mockResolvedValue(mockRecords);

        const result = await service.getByChannel('email', 10);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mockStore.findByChannel).toHaveBeenCalledWith('email', 10);
        expect(result).toEqual(mockRecords);
      });
    });
  });

  describe('with queue', () => {
    let mockQueue: { add: jest.Mock };

    beforeEach(async () => {
      mockQueue = { add: jest.fn().mockResolvedValue({ id: 'job-123' }) };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: defaultOptions },
          { provide: NOTIFICATION_QUEUE, useValue: mockQueue },
        ],
      }).compile();

      service = module.get(NotificationService);
    });

    it('should enqueue when queue enabled', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        queue: { enabled: true, inject: 'MOCK_QUEUE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_QUEUE, useValue: mockQueue },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const result = await svc.send('email', {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Hello',
      });

      expect(result.success).toBe(true);
      expect(result.channels).toHaveLength(0);
      expect(mockQueue.add).toHaveBeenCalledWith('notification', {
        email: {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        },
      });
    });

    it('should enqueue with template options', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        queue: { enabled: true, inject: 'MOCK_QUEUE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_QUEUE, useValue: mockQueue },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      await svc.send(
        'email',
        {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        },
        { template: 'welcome', templateData: { name: 'John' } },
      );

      expect(mockQueue.add).toHaveBeenCalledWith('notification', {
        email: {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        },
        template: 'welcome',
        templateData: { name: 'John' },
      });
    });

    describe('enqueue', () => {
      it('should add job to queue', async () => {
        const result = await service.enqueue({
          email: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
        });

        expect(result.queued).toBe(true);
        expect(result.jobId).toBe('job-123');
        expect(mockQueue.add).toHaveBeenCalledWith('notification', {
          email: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
        });
      });

      it('should handle queue failure', async () => {
        mockQueue.add.mockRejectedValue(new Error('Queue error'));

        const result = await service.enqueue({
          email: {
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello',
          },
        });

        expect(result.queued).toBe(false);
      });
    });
  });

  describe('all channels', () => {
    const channels = [
      'email',
      'sms',
      'push',
      'telegram',
      'slack',
      'teams',
      'googlechat',
      'whatsapp',
      'viber',
      'line',
      'webpush',
      'inapp',
      'discord',
      'wechat',
    ] as const;

    channels.forEach((channel) => {
      it(`should support ${channel} channel`, async () => {
        const provider = createMockProvider(`test-${channel}`, channel);
        const options: NotificationModuleOptions = {
          providers: { [channel]: [provider] },
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            NotificationService,
            { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          ],
        }).compile();

        const svc = module.get(NotificationService);
        const result = svc.getProviders(channel);

        expect(result).toHaveLength(1);
        expect(result[0].channel).toBe(channel);
      });
    });
  });

  describe('onModuleInit', () => {
    it('should warn when storage enabled but store not injected', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const spy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(
          'storage is enabled but the store provider was not resolved',
        ),
      );
    });

    it('should warn when queue enabled but queue not injected', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        queue: { enabled: true, inject: 'NOTIFICATION_QUEUE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const spy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(
          'queue is enabled but the queue provider was not resolved',
        ),
      );
    });

    it('should not warn when store is properly injected', async () => {
      const mockStore = createMockStore();
      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const spy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not warn when storage disabled', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: false },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const spy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should dynamically create store from useClass when not injected', async () => {
      const mockStore = createMockStore();
      const MockStoreClass = jest.fn().mockImplementation(() => mockStore);
      const mockModuleRef = { create: jest.fn().mockResolvedValue(mockStore) };

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: ModuleRef, useValue: mockModuleRef },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      await svc.onModuleInit();

      expect(mockModuleRef.create).toHaveBeenCalledWith(MockStoreClass);
      expect(svc['store']).toBe(mockStore);
    });

    it('should log success when store created via useClass', async () => {
      const mockStore = createMockStore();
      const MockStoreClass = jest.fn().mockImplementation(() => mockStore);
      const mockModuleRef = { create: jest.fn().mockResolvedValue(mockStore) };

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: ModuleRef, useValue: mockModuleRef },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const logSpy = jest.spyOn(svc['logger'], 'log');

      await svc.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith(
        'Notification store initialized via useClass',
      );
    });

    it('should log error when useClass instantiation fails', async () => {
      const mockModuleRef = {
        create: jest
          .fn()
          .mockRejectedValue(new Error('Cannot resolve dependencies')),
      };
      const MockStoreClass = jest.fn();

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: ModuleRef, useValue: mockModuleRef },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const errorSpy = jest.spyOn(svc['logger'], 'error');
      const warnSpy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize notification store'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'storage is enabled but the store provider was not resolved',
        ),
      );
    });

    it('should skip useClass when store already injected', async () => {
      const mockStore = createMockStore();
      const MockStoreClass = jest.fn();
      const mockModuleRef = { create: jest.fn() };

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
          { provide: ModuleRef, useValue: mockModuleRef },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      await svc.onModuleInit();

      expect(mockModuleRef.create).not.toHaveBeenCalled();
    });

    it('should skip useClass when moduleRef is not injected', async () => {
      const MockStoreClass = jest.fn();

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: ModuleRef, useValue: undefined },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const warnSpy = jest.spyOn(svc['logger'], 'warn');

      await svc.onModuleInit();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'storage is enabled but the store provider was not resolved',
        ),
      );
    });
  });

  describe('getDiagnostics', () => {
    it('should return correct diagnostics without store', async () => {
      const options: NotificationModuleOptions = {
        providers: {
          email: [createMockProvider('email-1', 'email')],
          sms: [createMockProvider('sms-1', 'sms')],
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const diag: NotificationDiagnostics = svc.getDiagnostics();

      expect(diag.storageEnabled).toBe(false);
      expect(diag.storageInitialized).toBe(false);
      expect(diag.queueEnabled).toBe(false);
      expect(diag.queueInitialized).toBe(false);
      expect(diag.providers.email).toBe(1);
      expect(diag.providers.sms).toBe(1);
    });

    it('should return correct diagnostics with store', async () => {
      const mockStore = createMockStore();
      const options: NotificationModuleOptions = {
        providers: { email: [createMockProvider('email-1', 'email')] },
        storage: { enabled: true, inject: 'MOCK_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_STORE, useValue: mockStore },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const diag: NotificationDiagnostics = svc.getDiagnostics();

      expect(diag.storageEnabled).toBe(true);
      expect(diag.storageInitialized).toBe(true);
      expect(diag.providers.email).toBe(1);
    });

    it('should show storage enabled but not initialized when store missing', async () => {
      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const diag: NotificationDiagnostics = svc.getDiagnostics();

      expect(diag.storageEnabled).toBe(true);
      expect(diag.storageInitialized).toBe(false);
    });

    it('should return correct queue diagnostics', async () => {
      const mockQueue = { add: jest.fn() };
      const options: NotificationModuleOptions = {
        providers: {},
        queue: { enabled: true, inject: 'MOCK_QUEUE' },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: NOTIFICATION_QUEUE, useValue: mockQueue },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const diag: NotificationDiagnostics = svc.getDiagnostics();

      expect(diag.queueEnabled).toBe(true);
      expect(diag.queueInitialized).toBe(true);
    });

    it('should fallback to 0 when provider list is undefined', async () => {
      const options: NotificationModuleOptions = {
        providers: {
          email: [createMockProvider('email-1', 'email')],
          sms: undefined,
        },
      };

      const module = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const diag: NotificationDiagnostics = svc.getDiagnostics();

      expect(diag.providers.sms).toBe(0);
    });

    it('should fallback to unknown provider name when provider has no name', async () => {
      const namelessProvider = {
        channel: 'email',
        send: jest.fn().mockRejectedValue(new Error('Send failed')),
      } as unknown as NotificationProvider;

      const options: NotificationModuleOptions = {
        providers: { email: [namelessProvider] },
      };

      const module = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
        ],
      }).compile();

      const svc = module.get(NotificationService);

      await expect(
        svc.send('email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Hello',
        }),
      ).rejects.toThrow('Send failed');
    });
  });

  describe('onModuleInit - non-Error useClass failure', () => {
    it('should handle non-Error exception from useClass', async () => {
      const mockModuleRef = {
        create: jest.fn().mockRejectedValue('string error'),
      };
      const MockStoreClass = jest.fn();

      const options: NotificationModuleOptions = {
        providers: {},
        storage: { enabled: true, useClass: MockStoreClass },
      };

      const module = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
          { provide: ModuleRef, useValue: mockModuleRef },
        ],
      }).compile();

      const svc = module.get(NotificationService);
      const errorSpy = jest.spyOn(svc['logger'], 'error');

      await svc.onModuleInit();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize notification store'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('string error'),
      );
    });
  });
});
