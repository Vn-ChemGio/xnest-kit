const mockGetFirebaseAdmin = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetFirebaseAdmin),
}));

import { isPackageInstalled } from '../../../utils';
import { FcmPushProvider, isFirebaseAdminInstalled } from './fcm.provider';

const mockSendEachForMulticast = jest.fn();
const mockInitializeApp = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetFirebaseAdmin.mockReturnValue({
    initializeApp: mockInitializeApp,
    messaging: jest.fn().mockReturnValue({
      sendEachForMulticast: mockSendEachForMulticast,
    }),
  });
});

describe('FcmPushProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new FcmPushProvider();
    expect(provider.name).toBe('fcm');
    expect(provider.channel).toBe('push');
  });

  it('should send push notification successfully', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: true }, { success: true }],
    });

    const provider = new FcmPushProvider({ projectId: 'test-project' });
    const result = await provider.send({
      tokens: ['token-1', 'token-2'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('fcm-batch-2');
  });

  it('should handle partial failure', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [
        { success: true },
        { success: false, error: { message: 'Invalid token' } },
      ],
    });

    const provider = new FcmPushProvider();
    const result = await provider.send({
      tokens: ['token-1', 'token-2'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Partial failure');
  });

  it('should handle all failures', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [
        { success: false, error: { message: 'Bad token' } },
        { success: false, error: { message: 'Bad token' } },
      ],
    });

    const provider = new FcmPushProvider();
    const result = await provider.send({
      tokens: ['token-1'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad token');
  });

  it('should handle initialization error', async () => {
    mockInitializeApp.mockImplementation(() => {
      throw new Error('Firebase init failed');
    });

    const provider = new FcmPushProvider();
    const result = await provider.send({
      tokens: ['token-1'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Firebase init failed');
  });

  it('should include image, sound, badge, and data in payload', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: true }],
    });

    const provider = new FcmPushProvider();
    await provider.send({
      tokens: ['token-1'],
      title: 'Hello',
      body: 'World',
      image: 'https://example.com/img.png',
      sound: 'default',
      badge: 5,
      data: { key: 'value' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const message = mockSendEachForMulticast.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect((message.notification as Record<string, unknown>).imageUrl).toBe(
      'https://example.com/img.png',
    );
    expect((message.data as Record<string, unknown>).key).toBe('value');
  });

  it('should handle all failures without firstError message', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: false }],
    });

    const provider = new FcmPushProvider();
    const result = await provider.send({
      tokens: ['token-1'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('All tokens failed');
  });

  it('should handle non-Error throw', async () => {
    mockSendEachForMulticast.mockRejectedValue('string error');

    const provider = new FcmPushProvider();
    const result = await provider.send({
      tokens: ['token-1'],
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown FCM error');
  });

  it('should only initialize once', async () => {
    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: true }],
    });

    const provider = new FcmPushProvider();

    await provider.send({ tokens: ['t1'], title: 'A', body: 'B' });
    await provider.send({ tokens: ['t2'], title: 'C', body: 'D' });

    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
  });
});

describe('isFirebaseAdminInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isFirebaseAdminInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('firebase-admin');
  });
});
