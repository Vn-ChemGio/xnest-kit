const mockGetTwilio = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetTwilio),
}));

import { isPackageInstalled } from '../../../utils';
import { TwilioSmsProvider, isTwilioInstalled } from './twilio.provider';

const mockCreate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetTwilio.mockReturnValue(
    jest.fn().mockReturnValue({ messages: { create: mockCreate } }),
  );
});

describe('TwilioSmsProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });
    expect(provider.name).toBe('twilio');
    expect(provider.channel).toBe('sms');
  });

  it('should send SMS successfully', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM123' });

    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });

    const result = await provider.send({
      to: '+0987654321',
      body: 'Hello SMS',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('SM123');
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+1234567890',
      to: '+0987654321',
      body: 'Hello SMS',
    });
  });

  it('should override from number', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM456' });

    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });

    await provider.send({
      to: '+0987654321',
      from: '+1111111111',
      body: 'Override',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ from: '+1111111111' }),
    );
  });

  it('should handle send failure', async () => {
    mockCreate.mockRejectedValue(new Error('Invalid number'));

    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });

    const result = await provider.send({
      to: '+0987654321',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid number');
  });

  it('should reuse client on second call', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM-reuse' });

    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const twilioFn = mockGetTwilio();

    await provider.send({ to: '+0987654321', body: 'First' });
    await provider.send({ to: '+0987654321', body: 'Second' });

    expect(twilioFn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error throw', async () => {
    mockCreate.mockRejectedValue('string error');

    const provider = new TwilioSmsProvider({
      accountSid: 'sid',
      authToken: 'token',
      from: '+1234567890',
    });

    const result = await provider.send({
      to: '+0987654321',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Twilio error');
  });
});

describe('isTwilioInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isTwilioInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('twilio');
  });
});
