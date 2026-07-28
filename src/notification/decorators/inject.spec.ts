import {
  InjectNotificationOptions,
  InjectNotificationProvider,
  InjectNotificationStore,
  InjectNotificationQueue,
} from './inject.decorator';

describe('Notification Decorators', () => {
  describe('InjectNotificationOptions', () => {
    it('should be a function', () => {
      expect(typeof InjectNotificationOptions).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = InjectNotificationOptions();
      expect(typeof decorator).toBe('function');
    });

    it('should work with parameter decorator', () => {
      class TestClass {
        constructor(
          @InjectNotificationOptions()
          public readonly options: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass({ providers: {} });
      expect(instance.options).toEqual({ providers: {} });
    });
  });

  describe('InjectNotificationProvider', () => {
    it('should be a function', () => {
      expect(typeof InjectNotificationProvider).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = InjectNotificationProvider('email');
      expect(typeof decorator).toBe('function');
    });

    it('should return a decorator function with custom index', () => {
      const decorator = InjectNotificationProvider('email', 1);
      expect(typeof decorator).toBe('function');
    });

    it('should work with parameter decorator', () => {
      class TestClass {
        constructor(
          @InjectNotificationProvider('email')
          public readonly provider: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass({ name: 'sendgrid' });
      expect(instance.provider).toEqual({ name: 'sendgrid' });
    });

    it('should work with custom index', () => {
      class TestClass {
        constructor(
          @InjectNotificationProvider('email', 1)
          public readonly provider: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass({ name: 'mailgun' });
      expect(instance.provider).toEqual({ name: 'mailgun' });
    });

    it('should work with different channels', () => {
      class TestClass {
        constructor(
          @InjectNotificationProvider('email')
          public readonly emailProvider: unknown,
          @InjectNotificationProvider('sms')
          public readonly smsProvider: unknown,
          @InjectNotificationProvider('push')
          public readonly pushProvider: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass(
        { name: 'email-provider' },
        { name: 'sms-provider' },
        { name: 'push-provider' },
      );
      expect(instance.emailProvider).toEqual({ name: 'email-provider' });
      expect(instance.smsProvider).toEqual({ name: 'sms-provider' });
      expect(instance.pushProvider).toEqual({ name: 'push-provider' });
    });
  });

  describe('InjectNotificationStore', () => {
    it('should be a function', () => {
      expect(typeof InjectNotificationStore).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = InjectNotificationStore();
      expect(typeof decorator).toBe('function');
    });

    it('should work with parameter decorator', () => {
      class TestClass {
        constructor(
          @InjectNotificationStore()
          public readonly store: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass({ save: jest.fn() });
      expect(instance.store).toBeDefined();
    });
  });

  describe('InjectNotificationQueue', () => {
    it('should be a function', () => {
      expect(typeof InjectNotificationQueue).toBe('function');
    });

    it('should return a decorator function', () => {
      const decorator = InjectNotificationQueue();
      expect(typeof decorator).toBe('function');
    });

    it('should work with parameter decorator', () => {
      class TestClass {
        constructor(
          @InjectNotificationQueue()
          public readonly queue: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass({ add: jest.fn() });
      expect(instance.queue).toBeDefined();
    });
  });

  describe('combined decorators', () => {
    it('should work with all decorators on same class', () => {
      class TestClass {
        constructor(
          @InjectNotificationOptions()
          public readonly options: unknown,
          @InjectNotificationProvider('email')
          public readonly emailProvider: unknown,
          @InjectNotificationProvider('sms')
          public readonly smsProvider: unknown,
          @InjectNotificationStore()
          public readonly store: unknown,
          @InjectNotificationQueue()
          public readonly queue: unknown,
        ) {}
      }

      expect(TestClass).toBeDefined();
      const instance = new TestClass(
        { providers: {} },
        { name: 'email' },
        { name: 'sms' },
        { save: jest.fn() },
        { add: jest.fn() },
      );
      expect(instance.options).toEqual({ providers: {} });
      expect(instance.emailProvider).toEqual({ name: 'email' });
      expect(instance.smsProvider).toEqual({ name: 'sms' });
      expect(instance.store).toBeDefined();
      expect(instance.queue).toBeDefined();
    });
  });
});
