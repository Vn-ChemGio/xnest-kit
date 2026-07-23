import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
  NOTIFICATION_EMAIL_PROVIDER,
  NOTIFICATION_SMS_PROVIDER,
  NOTIFICATION_PUSH_PROVIDER,
  NOTIFICATION_TELEGRAM_PROVIDER,
  NOTIFICATION_SLACK_PROVIDER,
  NOTIFICATION_TEAMS_PROVIDER,
  NOTIFICATION_GOOGLECHAT_PROVIDER,
  NOTIFICATION_WHATSAPP_PROVIDER,
  NOTIFICATION_VIBER_PROVIDER,
  NOTIFICATION_LINE_PROVIDER,
  NOTIFICATION_WEBPUSH_PROVIDER,
  NOTIFICATION_INAPP_PROVIDER,
  NOTIFICATION_DISCORD_PROVIDER,
  NOTIFICATION_WECHAT_PROVIDER,
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

    it('should export NOTIFICATION_EMAIL_PROVIDER', () => {
      expect(NOTIFICATION_EMAIL_PROVIDER).toBe('NOTIFICATION_EMAIL_PROVIDER');
    });

    it('should export NOTIFICATION_SMS_PROVIDER', () => {
      expect(NOTIFICATION_SMS_PROVIDER).toBe('NOTIFICATION_SMS_PROVIDER');
    });

    it('should export NOTIFICATION_PUSH_PROVIDER', () => {
      expect(NOTIFICATION_PUSH_PROVIDER).toBe('NOTIFICATION_PUSH_PROVIDER');
    });

    it('should export NOTIFICATION_TELEGRAM_PROVIDER', () => {
      expect(NOTIFICATION_TELEGRAM_PROVIDER).toBe(
        'NOTIFICATION_TELEGRAM_PROVIDER',
      );
    });

    it('should export NOTIFICATION_SLACK_PROVIDER', () => {
      expect(NOTIFICATION_SLACK_PROVIDER).toBe('NOTIFICATION_SLACK_PROVIDER');
    });

    it('should export NOTIFICATION_TEAMS_PROVIDER', () => {
      expect(NOTIFICATION_TEAMS_PROVIDER).toBe('NOTIFICATION_TEAMS_PROVIDER');
    });

    it('should export NOTIFICATION_GOOGLECHAT_PROVIDER', () => {
      expect(NOTIFICATION_GOOGLECHAT_PROVIDER).toBe(
        'NOTIFICATION_GOOGLECHAT_PROVIDER',
      );
    });

    it('should export NOTIFICATION_WHATSAPP_PROVIDER', () => {
      expect(NOTIFICATION_WHATSAPP_PROVIDER).toBe(
        'NOTIFICATION_WHATSAPP_PROVIDER',
      );
    });

    it('should export NOTIFICATION_VIBER_PROVIDER', () => {
      expect(NOTIFICATION_VIBER_PROVIDER).toBe('NOTIFICATION_VIBER_PROVIDER');
    });

    it('should export NOTIFICATION_LINE_PROVIDER', () => {
      expect(NOTIFICATION_LINE_PROVIDER).toBe('NOTIFICATION_LINE_PROVIDER');
    });

    it('should export NOTIFICATION_WEBPUSH_PROVIDER', () => {
      expect(NOTIFICATION_WEBPUSH_PROVIDER).toBe(
        'NOTIFICATION_WEBPUSH_PROVIDER',
      );
    });

    it('should export NOTIFICATION_INAPP_PROVIDER', () => {
      expect(NOTIFICATION_INAPP_PROVIDER).toBe('NOTIFICATION_INAPP_PROVIDER');
    });

    it('should export NOTIFICATION_DISCORD_PROVIDER', () => {
      expect(NOTIFICATION_DISCORD_PROVIDER).toBe(
        'NOTIFICATION_DISCORD_PROVIDER',
      );
    });

    it('should export NOTIFICATION_WECHAT_PROVIDER', () => {
      expect(NOTIFICATION_WECHAT_PROVIDER).toBe('NOTIFICATION_WECHAT_PROVIDER');
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
