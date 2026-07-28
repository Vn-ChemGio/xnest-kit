const mockGetDiscordJs = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetDiscordJs),
}));

import { isPackageInstalled } from '../../../utils';
import { DiscordProvider, isDiscordJsInstalled } from './discord.provider';

const mockSend = jest.fn();
const mockLogin = jest.fn().mockResolvedValue('ready');
const MockClient = jest.fn().mockImplementation(() => ({
  login: mockLogin,
  channels: {
    cache: {
      get: jest.fn().mockReturnValue({ send: mockSend }),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetDiscordJs.mockReturnValue({
    Client: MockClient,
    GatewayIntentBits: { Guilds: 1 },
  });
});

describe('DiscordProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new DiscordProvider();
    expect(provider.name).toBe('discord');
    expect(provider.channel).toBe('discord');
  });

  describe('webhook mode (webhookUrl in input)', () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should send via webhook when webhookUrl provided', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider();
      const result = await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'Hello Discord!',
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('discord');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should not require token when webhookUrl is present', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider();
      const result = await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'No token needed',
      });

      expect(result.success).toBe(true);
    });

    it('should use defaultWebhookUrl from config', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider({
        defaultWebhookUrl: 'https://discord.com/api/webhooks/default',
      });
      await provider.send({ text: 'Default webhook' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/default',
        expect.anything(),
      );
    });

    it('should prefer input.webhookUrl over config.defaultWebhookUrl', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider({
        defaultWebhookUrl: 'https://discord.com/api/webhooks/default',
      });
      await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/override',
        text: 'Override webhook',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/override',
        expect.anything(),
      );
    });

    it('should send embed via webhook', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider();
      await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: '',
        embed: {
          title: 'Embed Title',
          description: 'Description',
          color: 0xff0000,
          url: 'https://example.com',
          author: { name: 'Author' },
          thumbnail: { url: 'https://example.com/thumb.png' },
          image: { url: 'https://example.com/image.png' },
          fields: [{ name: 'Field', value: 'Value', inline: true }],
          footer: { text: 'Footer' },
          timestamp: '2024-01-01T00:00:00Z',
        },
      });

      const fetchArgs = mockFetch.mock.calls[0] as [string, { body: string }];
      const body = JSON.parse(fetchArgs[1].body) as Record<string, unknown>;
      expect(body.embeds).toHaveLength(1);
      expect((body.embeds as Record<string, unknown>[])[0].title).toBe(
        'Embed Title',
      );
      expect((body.embeds as Record<string, unknown>[])[0].color).toBe(
        0xff0000,
      );
    });

    it('should send with username and avatar via webhook', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

      const provider = new DiscordProvider();
      await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'Hello',
        username: 'Bot',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const fetchArgs = mockFetch.mock.calls[0] as [string, { body: string }];
      const body = JSON.parse(fetchArgs[1].body) as Record<string, unknown>;
      expect(body.username).toBe('Bot');
      expect(body.avatar_url).toBe('https://example.com/avatar.png');
    });

    it('should handle webhook failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const provider = new DiscordProvider();
      const result = await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should handle webhook network error', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const provider = new DiscordProvider();
      const result = await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ECONNREFUSED');
    });

    it('should handle webhook non-Error throw', async () => {
      mockFetch.mockRejectedValue('string error');

      const provider = new DiscordProvider();
      const result = await provider.send({
        webhookUrl: 'https://discord.com/api/webhooks/test',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown Discord webhook error');
    });
  });

  describe('bot mode (token in config + channelId in input)', () => {
    it('should send message via bot', async () => {
      mockSend.mockResolvedValue({ id: 'msg-123' });

      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({
        channelId: 'ch-001',
        text: 'Hello Discord Bot',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Hello Discord Bot' }),
      );
    });

    it('should send embed via bot', async () => {
      mockSend.mockResolvedValue({ id: 'msg-456' });

      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({
        channelId: 'ch-001',
        text: '',
        embed: {
          title: 'Embed Title',
          color: 0x00ff00,
        },
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          embeds: expect.arrayContaining([
            expect.objectContaining({ title: 'Embed Title' }),
          ]),
        }),
      );
    });

    it('should return error when no token and no webhookUrl', async () => {
      const provider = new DiscordProvider();
      const result = await provider.send({
        channelId: 'ch-001',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bot token is required');
    });

    it('should return error when no channelId provided', async () => {
      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({ text: 'Hello' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No channelId provided');
    });

    it('should handle send error', async () => {
      mockSend.mockRejectedValue(new Error('Missing Permissions'));

      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({
        channelId: 'ch-001',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Permissions');
    });

    it('should return error when channel not found', async () => {
      const MockClientNotFound = jest.fn().mockImplementation(() => ({
        login: mockLogin,
        channels: {
          cache: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      }));

      mockGetDiscordJs.mockReturnValue({
        Client: MockClientNotFound,
        GatewayIntentBits: { Guilds: 1 },
      });

      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({
        channelId: 'missing-channel',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle non-Error throw', async () => {
      mockSend.mockRejectedValue('string error');

      const provider = new DiscordProvider({ token: 'bot-token' });
      const result = await provider.send({
        channelId: 'ch-001',
        text: 'Hello',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown Discord Bot error');
    });

    it('should reuse client on second call', async () => {
      mockSend.mockResolvedValue({ id: 'msg-1' });

      const provider = new DiscordProvider({ token: 'bot-token' });

      await provider.send({ channelId: 'ch-001', text: 'First' });
      await provider.send({ channelId: 'ch-001', text: 'Second' });

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });
});

describe('isDiscordJsInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isDiscordJsInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('discord.js');
  });
});
