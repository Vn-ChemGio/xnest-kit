/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TeamsWebhookProvider', () => {
  let TeamsWebhookProvider: typeof import('./teams.provider').TeamsWebhookProvider;

  beforeAll(async () => {
    ({ TeamsWebhookProvider } = await import('./teams.provider'));
  });

  let provider: InstanceType<typeof TeamsWebhookProvider>;

  beforeEach(() => {
    provider = new TeamsWebhookProvider();
    mockFetch.mockReset();
  });

  it('should have correct name and channel', () => {
    expect(provider.name).toBe('teams-webhook');
    expect(provider.channel).toBe('teams');
  });

  it('should send a simple text message', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    const result = await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello Teams!',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('teams');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://outlook.office.com/webhook/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('should send a message with title', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      title: 'Alert',
      text: 'Something happened',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.sections[0].activityTitle).toBe('Alert');
    expect(body.sections[0].text).toBe('Something happened');
  });

  it('should send a message with sections', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      title: 'Main Title',
      text: 'Main text',
      sections: [
        {
          activityTitle: 'Section 1',
          facts: [{ name: 'Key', value: 'Value' }],
        },
      ],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.sections).toHaveLength(2);
    expect(body.sections[0].activityTitle).toBe('Main Title');
    expect(body.sections[1].activityTitle).toBe('Section 1');
  });

  it('should handle webhook failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const result = await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('400');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('should override themeColor and summary', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello',
      themeColor: 'FF0000',
      summary: 'Custom summary',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.themeColor).toBe('FF0000');
    expect(body.summary).toBe('Custom summary');
  });

  it('should send sections with activitySubtitle and activityText', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

    await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello',
      sections: [
        {
          activityTitle: 'Title',
          activitySubtitle: 'Subtitle',
          activityText: 'Text content',
          facts: [{ name: 'Key', value: 'Val' }],
        },
      ],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.sections[0].activitySubtitle).toBe('Subtitle');
    expect(body.sections[0].activityText).toBe('Text content');
  });

  it('should handle non-Error throw', async () => {
    mockFetch.mockRejectedValue('string error');

    const result = await provider.send({
      webhookUrl: 'https://outlook.office.com/webhook/test',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Teams error');
  });
});
