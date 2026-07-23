/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { ViberBotProvider } from './viber.provider';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ViberBotProvider', () => {
  let provider: ViberBotProvider;

  beforeEach(() => {
    provider = new ViberBotProvider({ authToken: 'test-token' });
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('viber-bot');
    expect(provider.channel).toBe('viber');
  });

  it('should send a text message', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message: 'ok' }),
    });

    const result = await provider.send({
      to: 'user-id-123',
      text: 'Hello Viber!',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('viber');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://chatapi.viber.com/pa/send_message',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Viber-Auth-Token': 'test-token',
        }),
      }),
    );
  });

  it('should send a picture message', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message_token: 12345 }),
    });

    await provider.send({
      to: 'user-id-123',
      text: 'Check this',
      mediaUrl: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('picture');
    expect(body.media).toBe('https://example.com/image.jpg');
  });

  it('should send a keyboard message', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message_token: 12345 }),
    });

    await provider.send({
      to: 'user-id-123',
      text: 'Choose:',
      buttons: [{ text: 'Option 1', url: 'https://example.com' }],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('keyboard');
    expect(body.keyboard.buttons).toHaveLength(1);
  });

  it('should handle API error', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 2, message: 'Invalid token' }),
    });

    const result = await provider.send({
      to: 'user-id-123',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Viber API error 2');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const result = await provider.send({
      to: 'user-id-123',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });

  it('should send picture without thumbnailUrl', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message_token: 100 }),
    });

    await provider.send({
      to: 'user-id-123',
      text: 'Check',
      mediaUrl: 'https://example.com/img.jpg',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.thumbnail).toBeUndefined();
  });

  it('should use custom from name', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message_token: 101 }),
    });

    await provider.send({
      to: 'user-id-123',
      text: 'Hello',
      from: 'CustomBot',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.sender.name).toBe('CustomBot');
  });

  it('should handle button with actionBody', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0, message_token: 102 }),
    });

    await provider.send({
      to: 'user-id-123',
      text: 'Choose:',
      buttons: [{ text: 'Reply', actionBody: 'reply-action' }],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.keyboard.buttons[0].ActionBody).toBe('reply-action');
    expect(body.keyboard.buttons[0].ActionType).toBe('reply');
  });

  it('should handle response without message_token', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ status: 0 }),
    });

    const result = await provider.send({
      to: 'user-id-123',
      text: 'Hello',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeUndefined();
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      to: 'user-id-123',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Viber error');
  });
});
