/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { WhatsAppCloudProvider } from './whatsapp.provider';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WhatsAppCloudProvider', () => {
  let provider: WhatsAppCloudProvider;

  beforeEach(() => {
    provider = new WhatsAppCloudProvider({
      apiVersion: 'v18.0',
      phoneNumberId: '123456',
      accessToken: 'test-token',
    });
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('whatsapp-cloud');
    expect(provider.channel).toBe('whatsapp');
  });

  it('should send a text message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-123' }] }),
    });

    const result = await provider.send({
      to: '+1234567890',
      body: 'Hello WhatsApp!',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('graph.facebook.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('should send a template message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-456' }] }),
    });

    await provider.send({
      to: '+1234567890',
      body: '',
      template: 'welcome_template',
      templateParams: { name: 'John' },
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('template');
    expect(body.template.name).toBe('welcome_template');
  });

  it('should send an image message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-789' }] }),
    });

    await provider.send({
      to: '+1234567890',
      body: '',
      mediaUrl: 'https://example.com/image.jpg',
      caption: 'Check this out',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('image');
    expect(body.image.link).toBe('https://example.com/image.jpg');
  });

  it('should handle API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Invalid number' } }),
    });

    const result = await provider.send({
      to: '+1234567890',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid number');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Timeout'));

    const result = await provider.send({
      to: '+1234567890',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Timeout');
  });

  it('should handle API error without error.message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const result = await provider.send({
      to: '+1234567890',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('HTTP 500');
  });

  it('should send template without templateParams', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-tpl' }] }),
    });

    await provider.send({
      to: '+1234567890',
      body: '',
      template: 'welcome',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('template');
    expect(body.template.components).toBeUndefined();
  });

  it('should send image without caption', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-img' }] }),
    });

    await provider.send({
      to: '+1234567890',
      body: '',
      mediaUrl: 'https://example.com/img.jpg',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.type).toBe('image');
    expect(body.image.caption).toBeUndefined();
  });

  it('should strip + from phone number', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'msg-strip' }] }),
    });

    await provider.send({
      to: '+1234567890',
      body: 'Hello',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.to).toBe('1234567890');
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      to: '+1234567890',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown WhatsApp error');
  });
});
