/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { GoogleChatWebhookProvider } from './googlechat.provider';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GoogleChatWebhookProvider', () => {
  let provider: GoogleChatWebhookProvider;

  beforeEach(() => {
    provider = new GoogleChatWebhookProvider();
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('googlechat-webhook');
    expect(provider.channel).toBe('googlechat');
  });

  it('should send a text message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    const result = await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages?key=abc',
      text: 'Hello Google Chat!',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('googlechat');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('chat.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should append threadKey to URL', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'Hello',
      threadKey: 'thread-123',
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('threadKey=thread-123');
  });

  it('should send cards when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'ignored when cards present',
      cards: [
        {
          header: { title: 'Card Title' },
          sections: [
            {
              widgets: [{ textParagraph: { text: 'Hello' } }],
            },
          ],
        },
      ],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.cards).toHaveLength(1);
    expect(body.cards[0].header.title).toBe('Card Title');
  });

  it('should handle webhook failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const result = await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('403');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const result = await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });

  it('should send card without sections', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'ignored',
      cards: [{ header: { title: 'Card' } }],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.cards[0].sections).toBeUndefined();
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      webhookUrl: 'https://chat.googleapis.com/v1/spaces/test/messages',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Google Chat error');
  });
});
