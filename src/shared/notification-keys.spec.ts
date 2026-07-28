import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
  notificationProviderToken,
} from './notification-keys';

describe('notification-keys', () => {
  describe('injection tokens', () => {
    it('should export NOTIFICATION_MODULE_OPTIONS', () => {
      expect(NOTIFICATION_MODULE_OPTIONS).toBe('NOTIFICATION_MODULE_OPTIONS');
    });

    it('should export NOTIFICATION_QUEUE', () => {
      expect(NOTIFICATION_QUEUE).toBe('NOTIFICATION_QUEUE');
    });

    it('should export NOTIFICATION_STORE', () => {
      expect(NOTIFICATION_STORE).toBe('NOTIFICATION_STORE');
    });
  });

  describe('notificationProviderToken', () => {
    it('should be a function', () => {
      expect(typeof notificationProviderToken).toBe('function');
    });

    it('should generate token with default index', () => {
      const token = notificationProviderToken('email');
      expect(token).toBe('NOTIFICATION_MODULE_OPTIONS:provider:email:0');
    });

    it('should generate token with custom index', () => {
      const token = notificationProviderToken('email', 1);
      expect(token).toBe('NOTIFICATION_MODULE_OPTIONS:provider:email:1');
    });

    it('should generate different tokens for different channels', () => {
      const emailToken = notificationProviderToken('email');
      const smsToken = notificationProviderToken('sms');

      expect(emailToken).not.toBe(smsToken);
    });

    it('should generate different tokens for different indices', () => {
      const token0 = notificationProviderToken('email', 0);
      const token1 = notificationProviderToken('email', 1);

      expect(token0).not.toBe(token1);
    });

    it('should handle all channels', () => {
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
      ];

      channels.forEach((channel) => {
        const token = notificationProviderToken(channel);
        expect(token).toContain(channel);
      });
    });

    it('should be string injection tokens', () => {
      expect(typeof notificationProviderToken('email')).toBe('string');
      expect(typeof notificationProviderToken('sms')).toBe('string');
      expect(typeof notificationProviderToken('push')).toBe('string');
    });
  });
});
