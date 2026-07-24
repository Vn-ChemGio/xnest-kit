import { Test, type TestingModule } from '@nestjs/testing';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_STORE,
  NOTIFICATION_QUEUE,
  notificationProviderToken,
} from '../shared/notification-keys';
import type { NotificationModuleOptions } from './notification.type';
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

    it('should provide NOTIFICATION_MODULE_OPTIONS', () => {
      const result = NotificationModule.forRoot(defaultOptions);
      const providers = result.providers as Array<{
        provide: string;
        useValue: unknown;
      }>;
      const optionsProvider = providers.find(
        (p) => p.provide === NOTIFICATION_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
      expect(optionsProvider?.useValue).toEqual(defaultOptions);
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

    it('should register per-channel provider tokens', () => {
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
        useValue: unknown;
      }>;

      const emailToken = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );
      const smsToken = providers.find(
        (p) => p.provide === notificationProviderToken('sms', 0),
      );

      expect(emailToken).toBeDefined();
      expect(emailToken?.useValue).toBe(emailProvider);
      expect(smsToken).toBeDefined();
      expect(smsToken?.useValue).toBe(smsProvider);
    });

    it('should register multiple providers per channel', () => {
      const provider1 = createMockProvider('sendgrid', 'email');
      const provider2 = createMockProvider('mailgun', 'email');

      const result = NotificationModule.forRoot({
        providers: {
          email: [provider1, provider2],
        },
      });

      const providers = result.providers as Array<{
        provide: string;
        useValue: unknown;
      }>;

      const emailToken0 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 0),
      );
      const emailToken1 = providers.find(
        (p) => p.provide === notificationProviderToken('email', 1),
      );

      expect(emailToken0?.useValue).toBe(provider1);
      expect(emailToken1?.useValue).toBe(provider2);
    });

    it('should register storage provider when enabled', () => {
      const result = NotificationModule.forRoot({
        providers: {},
        storage: { enabled: true, inject: 'MOCK_STORE' },
      });

      const providers = result.providers as Array<{
        provide: string;
        useExisting: string;
      }>;

      const storeProvider = providers.find(
        (p) => p.provide === NOTIFICATION_STORE,
      );

      expect(storeProvider).toBeDefined();
      expect(storeProvider?.useExisting).toBe('MOCK_STORE');
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
        useExisting: string;
      }>;

      const queueProvider = providers.find(
        (p) => p.provide === NOTIFICATION_QUEUE,
      );

      expect(queueProvider).toBeDefined();
      expect(queueProvider?.useExisting).toBe('MOCK_QUEUE');
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
