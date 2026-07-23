/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { LineMessagingProvider } from './line.provider';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LineMessagingProvider', () => {
  let provider: LineMessagingProvider;

  beforeEach(() => {
    provider = new LineMessagingProvider({ channelAccessToken: 'test-token' });
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('line-messaging');
    expect(provider.channel).toBe('line');
  });

  it('should send a text message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const result = await provider.send({
      to: 'U1234567890abcdef',
      text: 'Hello LINE!',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('line');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].type).toBe('text');
    expect(body.messages[0].text).toBe('Hello LINE!');
  });

  it('should send a sticker message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: '',
      stickerPackageId: 6325,
      stickerId: 10979904,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].type).toBe('sticker');
    expect(body.messages[0].packageId).toBe('6325');
  });

  it('should send an image message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: '',
      imageUrl: 'https://example.com/image.jpg',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].type).toBe('image');
    expect(body.messages[0].originalContentUrl).toBe(
      'https://example.com/image.jpg',
    );
  });

  it('should add quickReply', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: 'Choose:',
      quickReply: [{ text: 'Option 1' }, { text: 'Option 2' }],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].quickReply).toBeDefined();
    expect(body.messages[0].quickReply.items).toHaveLength(2);
  });

  it('should handle API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Invalid request' }),
    });

    const result = await provider.send({
      to: 'U1234567890abcdef',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid request');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Timeout'));

    const result = await provider.send({
      to: 'U1234567890abcdef',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Timeout');
  });

  it('should send video message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: '',
      videoUrl: 'https://example.com/video.mp4',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].type).toBe('video');
    expect(body.messages[0].originalContentUrl).toBe(
      'https://example.com/video.mp4',
    );
  });

  it('should send audio message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: '',
      audioUrl: 'https://example.com/audio.mp3',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].type).toBe('audio');
    expect(body.messages[0].duration).toBe(60000);
  });

  it('should handle API error without message field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    });

    const result = await provider.send({
      to: 'U1234567890abcdef',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('LINE API returned 403');
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      to: 'U1234567890abcdef',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown LINE error');
  });

  it('should add quickReply with custom action spread', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await provider.send({
      to: 'U1234567890abcdef',
      text: 'Choose:',
      quickReply: [
        {
          text: 'Btn',
          action: { type: 'uri', label: 'Go', uri: 'https://example.com' },
        },
      ],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.messages[0].quickReply.items[0].action.type).toBe('uri');
  });
});
