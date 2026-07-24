/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const mockGetSlackWebApi = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetSlackWebApi),
}));

import { isPackageInstalled } from '../../../utils';
import { SlackProvider, isSlackWebApiInstalled } from './slack.provider';

const mockPostMessage = jest.fn();
const MockSlackWebApi = jest.fn().mockImplementation(() => ({
  chat: { postMessage: mockPostMessage },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetSlackWebApi.mockReturnValue(MockSlackWebApi);
});

describe('SlackProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new SlackProvider({ token: 'xoxb-test' });
    expect(provider.name).toBe('slack');
    expect(provider.channel).toBe('slack');
  });

  it('should return failure when no channel provided', async () => {
    const provider = new SlackProvider({ token: 'xoxb-test' });
    const result = await provider.send({
      channel: '',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No channel provided');
  });

  it('should use default channel', async () => {
    mockPostMessage.mockResolvedValue({ ok: true, ts: '1234.5678' });

    const provider = new SlackProvider({
      token: 'xoxb-test',
      defaultChannel: '#general',
    });

    await provider.send({
      channel: undefined,
      text: 'Hello',
    });

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: '#general' }),
    );
  });

  it('should send message successfully', async () => {
    mockPostMessage.mockResolvedValue({ ok: true, ts: '1234.5678' });

    const provider = new SlackProvider({ token: 'xoxb-test' });
    const result = await provider.send({
      channel: '#random',
      text: 'Hello Slack',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('1234.5678');
  });

  it('should handle API ok:false response', async () => {
    mockPostMessage.mockResolvedValue({
      ok: false,
      error: 'channel_not_found',
    });

    const provider = new SlackProvider({ token: 'xoxb-test' });
    const result = await provider.send({
      channel: '#missing',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
  });

  it('should handle send error', async () => {
    mockPostMessage.mockRejectedValue(new Error('Token revoked'));

    const provider = new SlackProvider({ token: 'xoxb-test' });
    const result = await provider.send({
      channel: '#general',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Token revoked');
  });

  it('should pass blocks, attachments, and threadTs', async () => {
    mockPostMessage.mockResolvedValue({ ok: true, ts: '9999.0001' });

    const provider = new SlackProvider({ token: 'xoxb-test' });

    await provider.send({
      channel: '#random',
      text: 'Threaded',
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: 'Hi' } }],
      attachments: [{ text: 'Attachment' }],
      threadTs: '1234.5678',
    });

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: expect.any(Array),
        attachments: expect.any(Array),
        thread_ts: '1234.5678',
      }),
    );
  });

  it('should reuse client on second call', async () => {
    mockPostMessage.mockResolvedValue({ ok: true, ts: '1111.2222' });

    const provider = new SlackProvider({ token: 'xoxb-test' });

    await provider.send({ channel: '#a', text: 'First' });
    await provider.send({ channel: '#b', text: 'Second' });

    expect(mockGetSlackWebApi).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error throw', async () => {
    mockPostMessage.mockRejectedValue('string error');

    const provider = new SlackProvider({ token: 'xoxb-test' });
    const result = await provider.send({
      channel: '#general',
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Slack error');
  });
});

describe('isSlackWebApiInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isSlackWebApiInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('@slack/web-api');
  });
});
