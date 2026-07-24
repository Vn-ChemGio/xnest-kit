/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
const mockGetWebPush = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetWebPush),
}));

import { isPackageInstalled } from '../../../utils';
import { WebPushProvider, isWebPushInstalled } from './webpush.provider';

const mockSetVapidDetails = jest.fn();
const mockSendNotification = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetWebPush.mockReturnValue({
    setVapidDetails: mockSetVapidDetails,
    sendNotification: mockSendNotification,
  });
});

describe('WebPushProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });
    expect(provider.name).toBe('web-push');
    expect(provider.channel).toBe('webpush');
  });

  it('should send push notification successfully', async () => {
    mockSendNotification.mockResolvedValue({ statusCode: 201 });

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    const result = await provider.send({
      endpoint: 'https://fcm.googleapis.com/send/test',
      keys: { p256dh: 'key1', auth: 'auth1' },
      title: 'Hello',
      body: 'Web Push',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('webpush-201');
    expect(mockSetVapidDetails).toHaveBeenCalledWith(
      'mailto:test@example.com',
      'pub-key',
      'priv-key',
    );
  });

  it('should handle send failure', async () => {
    mockSendNotification.mockRejectedValue(new Error('Subscription expired'));

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    const result = await provider.send({
      endpoint: 'https://fcm.googleapis.com/send/test',
      keys: { p256dh: 'key1', auth: 'auth1' },
      title: 'Hello',
      body: 'Web Push',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Subscription expired');
  });

  it('should only initialize once', async () => {
    mockSendNotification.mockResolvedValue({ statusCode: 200 });

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    await provider.send({
      endpoint: 'https://test.com',
      keys: { p256dh: 'k', auth: 'a' },
      title: 'A',
      body: 'B',
    });

    await provider.send({
      endpoint: 'https://test.com',
      keys: { p256dh: 'k', auth: 'a' },
      title: 'C',
      body: 'D',
    });

    expect(mockSetVapidDetails).toHaveBeenCalledTimes(1);
  });

  it('should include icon, badge, data, url, and ttl in payload', async () => {
    mockSendNotification.mockResolvedValue({ statusCode: 201 });

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    await provider.send({
      endpoint: 'https://test.com',
      keys: { p256dh: 'k', auth: 'a' },
      title: 'Title',
      body: 'Body',
      icon: 'https://example.com/icon.png',
      badge: 'https://example.com/badge.png',
      data: { url: '/page' },
      url: '/page',
      ttl: 3600,
    });

    const payload = JSON.parse(mockSendNotification.mock.calls[0][1] as string);
    expect(payload.icon).toBe('https://example.com/icon.png');
    expect(payload.badge).toBe('https://example.com/badge.png');
    expect(payload.url).toBe('/page');

    const options = mockSendNotification.mock.calls[0][2] as Record<
      string,
      unknown
    >;
    expect(options.TTL).toBe(3600);
  });

  it('should not set TTL when undefined', async () => {
    mockSendNotification.mockResolvedValue({ statusCode: 201 });

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    await provider.send({
      endpoint: 'https://test.com',
      keys: { p256dh: 'k', auth: 'a' },
      title: 'Title',
      body: 'Body',
    });

    const options = mockSendNotification.mock.calls[0][2] as Record<
      string,
      unknown
    >;
    expect(options.TTL).toBeUndefined();
  });

  it('should handle non-Error throw', async () => {
    mockSendNotification.mockRejectedValue('string error');

    const provider = new WebPushProvider({
      subject: 'mailto:test@example.com',
      publicKey: 'pub-key',
      privateKey: 'priv-key',
    });

    const result = await provider.send({
      endpoint: 'https://test.com',
      keys: { p256dh: 'k', auth: 'a' },
      title: 'Title',
      body: 'Body',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Web Push error');
  });
});

describe('isWebPushInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isWebPushInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('web-push');
  });
});
