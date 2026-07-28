const mockGetSocketIo = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetSocketIo),
}));

import { isPackageInstalled } from '../../../utils';
import { InAppSocketProvider, isSocketIoInstalled } from './inapp.provider';

const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
const MockServer = jest.fn().mockImplementation(() => ({
  to: mockTo,
}));

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetSocketIo.mockReturnValue(MockServer);
  mockTo.mockReturnValue({ emit: mockEmit });
});

describe('InAppSocketProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new InAppSocketProvider();
    expect(provider.name).toBe('socket-io');
    expect(provider.channel).toBe('inapp');
  });

  it('should emit notification to user', async () => {
    const provider = new InAppSocketProvider({ port: 3001 });

    const result = await provider.send({
      userId: 'user-123',
      title: 'Hello',
      body: 'In-App notification',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('inapp');
    expect(mockTo).toHaveBeenCalledWith('user:user-123');
    expect(mockEmit).toHaveBeenCalledWith(
      'notification',
      expect.objectContaining({
        title: 'Hello',
        body: 'In-App notification',
        type: 'info',
      }),
    );
  });

  it('should emit to multiple users', async () => {
    const provider = new InAppSocketProvider();

    await provider.send({
      userId: ['user-1', 'user-2', 'user-3'],
      title: 'Broadcast',
      body: 'System message',
    });

    expect(mockTo).toHaveBeenCalledTimes(3);
    expect(mockTo).toHaveBeenCalledWith('user:user-1');
    expect(mockTo).toHaveBeenCalledWith('user:user-2');
    expect(mockTo).toHaveBeenCalledWith('user:user-3');
  });

  it('should include actionUrl and metadata', async () => {
    const provider = new InAppSocketProvider();

    await provider.send({
      userId: 'user-1',
      title: 'Alert',
      body: 'Click here',
      type: 'warning',
      actionUrl: '/alerts/123',
      metadata: { severity: 'high' },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const notification = mockEmit.mock.calls[0][1] as Record<string, unknown>;
    expect(notification.type).toBe('warning');
    expect(notification.actionUrl).toBe('/alerts/123');
    expect(notification.metadata).toEqual({ severity: 'high' });
  });

  it('should handle emit error', async () => {
    mockTo.mockImplementation(() => {
      throw new Error('Socket not connected');
    });

    const provider = new InAppSocketProvider();

    const result = await provider.send({
      userId: 'user-1',
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Socket not connected');
  });

  it('should get IOServer instance', () => {
    const provider = new InAppSocketProvider({ port: 4000 });
    const server = provider.getIOServer();
    expect(server).toBeDefined();
    expect(MockServer).toHaveBeenCalledWith(4000, expect.any(Object));
  });

  it('should include expiresAt and icon', async () => {
    const provider = new InAppSocketProvider();

    await provider.send({
      userId: 'user-1',
      title: 'Expiring',
      body: 'This expires',
      icon: 'https://example.com/icon.png',
      expiresAt: new Date('2025-12-31').toISOString(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const notification = mockEmit.mock.calls[0][1] as Record<string, unknown>;
    expect(notification.icon).toBe('https://example.com/icon.png');
    expect(notification.expiresAt).toBe(new Date('2025-12-31').toISOString());
  });

  it('should default type to info', async () => {
    const provider = new InAppSocketProvider();

    await provider.send({
      userId: 'user-1',
      title: 'Default',
      body: 'Type test',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const notification = mockEmit.mock.calls[0][1] as Record<string, unknown>;
    expect(notification.type).toBe('info');
  });

  it('should handle non-Error throw', async () => {
    mockTo.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'string error';
    });

    const provider = new InAppSocketProvider();

    const result = await provider.send({
      userId: 'user-1',
      title: 'Hello',
      body: 'World',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Socket.IO error');
  });

  it('should spread server options', () => {
    const provider = new InAppSocketProvider({
      port: 4000,
      cors: { origin: 'https://example.com' },
    });

    provider.getIOServer();

    expect(MockServer).toHaveBeenCalledWith(
      4000,
      expect.objectContaining({
        port: 4000,
      }),
    );
  });
});

describe('isSocketIoInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isSocketIoInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('socket.io');
  });
});
