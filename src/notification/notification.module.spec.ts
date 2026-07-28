import { Test, type TestingModule } from '@nestjs/testing';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_STORE,
  NOTIFICATION_QUEUE,
  notificationProviderToken,
} from '../shared/notification-keys';
import type {
  NotificationModuleOptions,
  NotificationStore,
} from './notification.type';
import type { NotificationProvider } from './notification.constants';

const createMockProvider = (
  name: string,
  channel: string,
): NotificationProvider => ({
  name,
  channel,
  send: jest.fn().mockResolvedValue({
    success: true,
    providerName: name,
    channel,
    messageId: `msg-${name}`,
  }),
});

const defaultOptions: NotificationModuleOptions = {
  providers: {},
};

describe('NotificationModule', () => {
  describe('forRoot', () => {
    it('should return a dynamic module', () => {
      const result = NotificationModule.forRoot(defaultOptions);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
      expect(result).toHaveProperty('providers');
      expect(result).toHaveProperty('exports');
    });

    it('should set module to NotificationModule', () => {
      const result = NotificationModule.forRoot(defaultOptions);
      expect(result.module).toBe(NotificationModule);
    });

    it('should be global by default', () => {
      const result = NotificationModule.forRoot(defaultOptions);
      expect(result.global).toBe(true);
    });

    it('should allow disabling global', () => {
      const result = NotificationModule.forRoot({
        ...defaultOptions,
        global: false,
      });
      expect(result.global).toBe(false);
    });

    it('should provide NOTIFICATION_MODULE_OPTIONS via factory', async () => {
      const result = NotificationModule.forRoot(defaultOptions);
      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;
      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      expect(resolved).toEqual(defaultOptions);
    });

    it('should provide NotificationService', () => {
      const result = NotificationModule.forRoot(defaultOptions);
      const providers = result.providers as unknown[];
      expect(providers).toContain(NotificationService);
    });

    it('should export NotificationService', () => {
      const result = NotificationModule.forRoot(defaultOptions);
      expect(result.exports).toContain(NotificationService);
    });

    it('should register per-channel provider tokens', async () => {
      const emailProvider = createMockProvider('sendgrid', 'email');
      const smsProvider = createMockProvider('twilio', 'sms');

      const result = NotificationModule.forRoot({
        providers: {
          email: [emailProvider],
          sms: [smsProvider],
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationProvider>;
      }>;

      const emailToken = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );
      const smsToken = providers.find(
        (p) => p.provide === notificationProviderToken('sms', 0),
      );

      expect(emailToken).toBeDefined();
      expect(emailToken?.useFactory).toBeInstanceOf(Function);
      const resolvedEmail = await emailToken.useFactory();
      expect(resolvedEmail).toBe(emailProvider);
      expect(smsToken).toBeDefined();
      const resolvedSms = await smsToken.useFactory();
      expect(resolvedSms).toBe(smsProvider);
    });

    it('should register multiple providers per channel', async () => {
      const provider1 = createMockProvider('sendgrid', 'email');
      const provider2 = createMockProvider('mailgun', 'email');

      const result = NotificationModule.forRoot({
        providers: {
          email: [provider1, provider2],
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationProvider>;
      }>;

      const emailToken0 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );
      const emailToken1 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 1),
      );

      expect(emailToken0).toBeDefined();
      expect(emailToken1).toBeDefined();
      const resolved0 = await emailToken0.useFactory();
      expect(resolved0).toBe(provider1);
      const resolved1 = await emailToken1.useFactory();
      expect(resolved1).toBe(provider2);
    });

    it('should register storage provider when enabled', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: true, inject: 'MOCK_STORE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: (store: unknown) => unknown;
        inject: string[];
      }>;

      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeDefined();
      expect(storeProvider?.inject).toEqual(['MOCK_STORE']);
      expect(typeof storeProvider?.useFactory).toBe('function');
    });

    it('should not register storage provider when disabled', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: false },
      });

      const providers = result.providers as Array<{ provide: string }>;
      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeUndefined();
    });

    it('should register queue provider when enabled', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        queue: { enabled: true, inject: 'MOCK_QUEUE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: (q: unknown) => unknown;
        inject: string[];
      }>;

      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeDefined();
      expect(queueProvider?.inject).toEqual(['MOCK_QUEUE']);
      expect(typeof queueProvider?.useFactory).toBe('function');
    });

    it('should not register queue provider when disabled', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        queue: { enabled: false },
      });

      const providers = result.providers as Array<{ provide: string }>;
      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeUndefined();
    });

    it('should register storage provider with useClass', () => {
      class MockStore implements NotificationStore {
        save = jest.fn();
        findById = jest.fn();
        findByChannel = jest.fn();
        updateStatus = jest.fn();
      }

      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: true, useClass: MockStore },
      });

      const providers = result.providers as Array<{
        provide: string;
        useClass?: unknown;
      }>;

      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeDefined();
      expect(storeProvider?.useClass).toBe(MockStore);
    });

    it('should register queue provider with useClass', () => {
      class MockQueue {
        add = jest.fn();
      }

      const result = NotificationModule.forRoot({
        providers: {},
        queue: { enabled: true, useClass: MockQueue },
      });

      const providers = result.providers as Array<{
        provide: string;
        useClass?: unknown;
      }>;

      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeDefined();
      expect(queueProvider?.useClass).toBe(MockQueue);
    });

    it('should return empty when storage enabled but no useClass/inject', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: true },
      });

      const providers = result.providers as Array<{ provide: string }>;
      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeUndefined();
    });

    it('should return empty when queue enabled but no useClass/inject', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        queue: { enabled: true },
      });

      const providers = result.providers as Array<{ provide: string }>;
      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeUndefined();
    });

    it('should invoke storage useFactory to create provider instance', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: true, inject: 'MY_STORE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory?: (s: unknown) => unknown;
      }>;

      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeDefined();
      const mockInstance = { id: 'test' };
      expect(storeProvider.useFactory(mockInstance)).toBe(mockInstance);
    });

    it('should invoke queue useFactory to create provider instance', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        queue: { enabled: true, inject: 'MY_QUEUE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory?: (q: unknown) => unknown;
      }>;

      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeDefined();
      const mockInstance = { name: 'test-queue' };
      expect(queueProvider.useFactory(mockInstance)).toBe(mockInstance);
    });

    it('should resolve config objects through resolveProvider for known channel', async () => {
      const result = NotificationModule.forRoot({
        providers: {
          email: [{ host: 'smtp.example.com' }],
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationProvider>;
      }>;

      const emailToken = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );

      expect(emailToken).toBeDefined();
      const resolved = await emailToken.useFactory();
      expect(resolved).toBeDefined();
      expect(typeof resolved.send).toBe('function');
    });

    it('should fallback for unknown channel in resolveProvider via options factory', async () => {
      const config = { webhookUrl: 'https://hook.example.com' };
      const result = NotificationModule.forRoot({
        providers: {
          unknownchannel: [config],
        } as NotificationModuleOptions['providers'],
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      const rp = resolved.providers as Record<string, unknown[]>;
      expect(rp.unknownchannel).toHaveLength(1);
      expect(rp.unknownchannel[0]).toBe(config);
    });

    it('should mix provider instances and config objects in same channel', async () => {
      const instance = createMockProvider('sendgrid', 'email');
      const result = NotificationModule.forRoot({
        providers: {
          email: [instance, { host: 'smtp2.example.com' }],
        } as NotificationModuleOptions['providers'],
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationProvider>;
      }>;

      const token0 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );
      const token1 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 1),
      );

      const resolved0 = await token0.useFactory();
      expect(resolved0).toBe(instance);

      const resolved1 = await token1.useFactory();
      expect(resolved1).toBeDefined();
      expect(typeof resolved1.send).toBe('function');
    });

    it('should resolve config objects in options factory via resolveAllProviders', async () => {
      const result = NotificationModule.forRoot({
        providers: {
          email: [{ host: 'smtp.example.com' }],
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      expect(resolved.providers.email).toHaveLength(1);
      expect(
        typeof (resolved.providers.email[0] as NotificationProvider).send,
      ).toBe('function');
    });

    it('should resolve config objects for all known channels', async () => {
      const channelConfigs: Record<string, unknown[]> = {
        email: [{ host: 'smtp.example.com' }],
        sms: [{ accountSid: 'AC123', authToken: 'token' }],
        push: [{ projectId: 'proj-123' }],
        telegram: [{ token: '123:ABC' }],
        slack: [{ token: 'xoxb-test' }],
        teams: [{ webhookUrl: 'https://hooks.example.com' }],
        googlechat: [{ webhookUrl: 'https://chat.example.com' }],
        whatsapp: [{ phoneNumberId: '123', accessToken: 'tok' }],
        viber: [{ authToken: 'viber-token' }],
        line: [{ channelAccessToken: 'line-token', channelSecret: 'sec' }],
        webpush: [{ publicKey: 'pub', privateKey: 'priv', subject: 'sub' }],
        inapp: [{ namespace: 'chat' }],
        discord: [{ token: 'discord-token' }],
        wechat: [{ appId: 'wx123', appSecret: 'secret' }],
      };

      const result = NotificationModule.forRoot({
        providers: channelConfigs,
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      const resolved = await optionsProvider.useFactory();
      const resolvedProviders = resolved.providers as Record<string, unknown[]>;

      for (const [channel, configs] of Object.entries(channelConfigs)) {
        expect(resolvedProviders[channel]).toHaveLength(configs.length);
        const first = resolvedProviders[channel][0] as NotificationProvider;
        expect(typeof first.send).toBe('function');
      }
    });

    it('should skip undefined provider lists in resolveAllProviders', async () => {
      const result = NotificationModule.forRoot({
        providers: {
          email: [createMockProvider('sendgrid', 'email')],
          sms: undefined,
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      const resolved = await optionsProvider.useFactory();
      expect(resolved.providers.email).toHaveLength(1);
      expect(resolved.providers.sms).toBeUndefined();
    });
  });

  describe('forRootAsync', () => {
    it('should return a dynamic module', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
      expect(result).toHaveProperty('providers');
      expect(result).toHaveProperty('exports');
    });

    it('should set module to NotificationModule', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });
      expect(result.module).toBe(NotificationModule);
    });

    it('should be global by default', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });
      expect(result.global).toBe(true);
    });

    it('should allow disabling global', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
        global: false,
      });
      expect(result.global).toBe(false);
    });

    it('should provide factory-based options', async () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: () => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      expect(resolved).toEqual(defaultOptions);
    });

    it('should provide NotificationService', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });
      const providers = result.providers as unknown[];
      expect(providers).toContain(NotificationService);
    });

    it('should export NotificationService', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });
      expect(result.exports).toContain(NotificationService);
    });

    it('should resolve provider configs in async factory', async () => {
      const emailProvider = createMockProvider('sendgrid', 'email');

      const result = NotificationModule.forRootAsync({
        useFactory: () => ({
          providers: { email: [emailProvider] },
        }),
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: (...args: unknown[]) => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      expect(resolved.providers.email).toContain(emailProvider);
    });

    it('should pass inject tokens to factory', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: (_config: unknown) => ({
          providers: {},
        }),
        inject: ['CONFIG'],
      });

      const providers = result.providers as Array<{
        provide: string;
        inject: string[];
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider?.inject).toContain('CONFIG');
    });

    it('should pass imports to module', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
        imports: ['SomeModule'],
      });

      expect(result.imports).toContain('SomeModule');
    });

    it('should handle empty imports', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
      });

      expect(result.imports).toEqual([]);
    });

    it('should register NOTIFICATION_STORE from top-level storage', () => {
      const result = NotificationModule.forRootAsync({
        useFactory: () => defaultOptions,
        storage: { enabled: true, inject: 'MY_STORE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        inject?: string[];
      }>;

      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeDefined();
      expect(storeProvider?.inject).toEqual(['MY_STORE']);
    });

    it('should propagate top-level storage into resolved options', async () => {
      const storageConfig = { enabled: true, inject: 'MY_STORE' as const };

      const result = NotificationModule.forRootAsync({
        useFactory: () => ({
          providers: { email: [] },
        }),
        storage: storageConfig,
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: (...args: unknown[]) => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      const resolved = await optionsProvider.useFactory();
      expect(resolved.storage).toEqual(storageConfig);
    });

    it('should prefer factory storage over top-level storage', async () => {
      const factoryStorage = {
        enabled: true,
        inject: 'FACTORY_STORE' as const,
      };

      const result = NotificationModule.forRootAsync({
        useFactory: () => ({
          providers: { email: [] },
          storage: factoryStorage,
        }),
        storage: { enabled: false, inject: 'TOP_LEVEL_STORE' as const },
      });

      const providers = result.providers as Array<{
        provide: string;
        useFactory: (...args: unknown[]) => Promise<NotificationModuleOptions>;
      }>;

      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      const resolved = await optionsProvider.useFactory();
      expect(resolved.storage).toEqual(factoryStorage);
    });
  });

  describe('integration', () => {
    it('should create a working module with forRoot', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          NotificationModule.forRoot({
            providers: {},
          }),
        ],
      }).compile();

      const service = module.get(NotificationService);
      expect(service).toBeDefined();
    });

    it('should create a working module with forRootAsync', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          NotificationModule.forRootAsync({
            useFactory: () => ({
              providers: {},
            }),
          }),
        ],
      }).compile();

      const service = module.get(NotificationService);
      expect(service).toBeDefined();
    });
  });
});
