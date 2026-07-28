/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WeChatOfficialProvider', () => {
  let WeChatOfficialProvider: typeof import('./wechat.provider').WeChatOfficialProvider;

  beforeAll(async () => {
    ({ WeChatOfficialProvider } = await import('./wechat.provider'));
  });

  let provider: InstanceType<typeof WeChatOfficialProvider>;

  beforeEach(() => {
    provider = new WeChatOfficialProvider({
      appId: 'wx123',
      appSecret: 'secret',
    });
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('wechat-official');
    expect(provider.channel).toBe('wechat');
  });

  it('should send a text message', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ errcode: 0, errmsg: 'ok' }),
      });

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
      text: 'Hello WeChat!',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('wechat');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle token fetch error', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ errcode: 40001, errmsg: 'invalid credential' }),
    });

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('invalid credential');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('DNS error'));

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('DNS error');
  });

  it('should send custom text message without template', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ errcode: 0, errmsg: 'ok' }),
      });

    const result = await provider.send({
      to: 'openid123',
      text: 'Custom text',
    });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const customUrl = mockFetch.mock.calls[1][0] as string;
    expect(customUrl).toContain('custom/send');
  });

  it('should return error when no templateId or text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
    });

    const result = await provider.send({
      to: 'openid123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('No templateId or text provided');
  });

  it('should handle template API error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ errcode: 40003, errmsg: 'invalid openid' }),
      });

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('40003');
  });

  it('should handle custom text API error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ errcode: 40003, errmsg: 'invalid openid' }),
      });

    const result = await provider.send({
      to: 'openid123',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('40003');
  });

  it('should send template with miniprogram', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ errcode: 0, errmsg: 'ok', msgid: 12345 }),
      });

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
      url: 'https://example.com',
      miniprogram: { appid: 'wx123', pagepath: '/pages/index' },
      data: { first: { value: 'Hello' } },
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('12345');
  });

  it('should use cached token on second call', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ access_token: 'tok-abc', expires_in: 7200 }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ errcode: 0, errmsg: 'ok' }),
      });

    await provider.send({ to: 'openid123', templateId: 'tpl-001' });
    await provider.send({ to: 'openid456', templateId: 'tpl-002' });

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      to: 'openid123',
      templateId: 'tpl-001',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown WeChat error');
  });
});
