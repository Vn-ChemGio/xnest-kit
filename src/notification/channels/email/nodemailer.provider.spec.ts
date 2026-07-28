/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const mockGetNodemailer = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetNodemailer),
}));

import { isPackageInstalled } from '../../../utils';
import {
  NodemailerEmailProvider,
  isNodemailerInstalled,
} from './nodemailer.provider';

const mockSendMail = jest.fn();
const mockClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (isPackageInstalled as jest.Mock).mockReturnValue(true);
  mockGetNodemailer.mockReturnValue({
    createTransport: jest.fn().mockReturnValue({
      sendMail: mockSendMail,
      close: mockClose,
    }),
  });
});

describe('NodemailerEmailProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });
    expect(provider.name).toBe('nodemailer');
    expect(provider.channel).toBe('email');
  });

  it('should send an email successfully', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-123' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
      port: 587,
      user: 'user@gmail.com',
      pass: 'password',
      from: 'user@gmail.com',
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: '<h1>Hello</h1>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
    expect(result.channel).toBe('email');
  });

  it('should handle multiple recipients', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-456' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: ['a@example.com', 'b@example.com'],
      subject: 'Test',
      body: 'Hello',
    });

    const mailOptions = mockSendMail.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(mailOptions.to).toBe('a@example.com, b@example.com');
  });

  it('should handle cc and bcc', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-789' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: 'main@example.com',
      cc: ['cc1@example.com'],
      bcc: ['bcc1@example.com'],
      subject: 'Test',
      body: 'Hello',
    });

    const mailOptions = mockSendMail.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(mailOptions.cc).toBe('cc1@example.com');
    expect(mailOptions.bcc).toBe('bcc1@example.com');
  });

  it('should handle send failure', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('SMTP connection failed');
  });

  it('should close transport after send', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-000' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: 'Hello',
    });

    expect(mockClose).toHaveBeenCalled();
  });

  it('should use input.from over config.from', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-111' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
      from: 'config@gmail.com',
    });

    await provider.send({
      to: 'recipient@example.com',
      from: 'override@gmail.com',
      subject: 'Test',
      body: 'Hello',
    });

    const mailOptions = mockSendMail.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(mailOptions.from).toBe('override@gmail.com');
  });

  it('should handle non-Error throw', async () => {
    mockSendMail.mockRejectedValue('string error');

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown SMTP error');
  });

  it('should send text-only without body', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-text' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      text: 'Plain text only',
    });

    const mailOptions = mockSendMail.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(mailOptions.text).toBe('Plain text only');
  });

  it('should pass replyTo and attachments', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-att' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: 'Hello',
      replyTo: 'reply@example.com',
      attachments: [{ filename: 'file.txt', content: 'test' }],
    });

    const mailOptions = mockSendMail.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(mailOptions.replyTo).toBe('reply@example.com');
    expect(mailOptions.attachments).toEqual([
      { filename: 'file.txt', content: 'test' },
    ]);
  });

  it('should use default port and secure when not provided', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'msg-def' });

    const provider = new NodemailerEmailProvider({
      host: 'smtp.gmail.com',
    });

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Test',
      body: 'Hello',
    });

    expect(mockGetNodemailer().createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 587,
        secure: false,
        auth: undefined,
      }),
    );
  });
});

describe('isNodemailerInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isNodemailerInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('nodemailer');
  });
});
