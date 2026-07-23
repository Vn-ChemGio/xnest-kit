/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const mockGetTelegramBot = jest.fn();

jest.mock('../../../utils', () => ({
  isPackageInstalled: jest.fn(() => false),
  lazyImport: jest.fn().mockReturnValue(mockGetTelegramBot),
}));

import { isPackageInstalled } from '../../../utils';
import {
  TelegramBotProvider,
  isTelegramBotInstalled,
} from './telegram.provider';

const mockSendMessage = jest.fn();
const mockSendPhoto = jest.fn();
const MockTelegramBot = jest.fn().mockImplementation(() => ({
  sendMessage: mockSendMessage,
  sendPhoto: mockSendPhoto,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTelegramBot.mockReturnValue(MockTelegramBot);
});

describe('TelegramBotProvider', () => {
  it('should have correct name and channel', () => {
    const provider = new TelegramBotProvider({ token: 'bot-token' });
    expect(provider.name).toBe('telegram-bot');
    expect(provider.channel).toBe('telegram');
  });

  it('should return failure when no chatId provided', async () => {
    const provider = new TelegramBotProvider({ token: 'bot-token' });
    const result = await provider.send({
      chatId: undefined,
      text: 'Hello',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No chatId provided');
  });

  it('should send message successfully', async () => {
    mockSendMessage.mockResolvedValue({ message_id: 123 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    const result = await provider.send({ text: 'Hello Telegram' });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('123');
    expect(mockSendMessage).toHaveBeenCalledWith(
      '12345',
      'Hello Telegram',
      expect.objectContaining({ parse_mode: 'HTML' }),
    );
  });

  it('should send photo', async () => {
    mockSendPhoto.mockResolvedValue({ message_id: 456 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    const result = await provider.send({
      text: 'Photo caption',
      photo: 'https://example.com/photo.jpg',
    });

    expect(result.success).toBe(true);
    expect(mockSendPhoto).toHaveBeenCalled();
  });

  it('should send with inline keyboard', async () => {
    mockSendMessage.mockResolvedValue({ message_id: 789 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    await provider.send({
      text: 'Choose:',
      buttons: [[{ text: 'Click me', url: 'https://example.com' }]],
    });

    const options = mockSendMessage.mock.calls[0][2] as Record<string, unknown>;
    expect(options.reply_markup).toBeDefined();
  });

  it('should handle send error', async () => {
    mockSendMessage.mockRejectedValue(new Error('Chat not found'));

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    const result = await provider.send({ text: 'Hello' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Chat not found');
  });

  it('should send document', async () => {
    const mockSendDocument = jest.fn().mockResolvedValue({ message_id: 999 });
    mockGetTelegramBot.mockImplementation(() =>
      jest.fn().mockImplementation(() => ({
        sendMessage: mockSendMessage,
        sendPhoto: mockSendPhoto,
        sendDocument: mockSendDocument,
      })),
    );

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    const result = await provider.send({
      text: 'File',
      document: 'https://example.com/file.pdf',
    });

    expect(result.success).toBe(true);
    expect(mockSendDocument).toHaveBeenCalled();
  });

  it('should use input.parseMode over config.parseMode', async () => {
    mockSendMessage.mockResolvedValue({ message_id: 100 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
      parseMode: 'HTML',
    });

    await provider.send({
      text: 'Hello',
      parseMode: 'MarkdownV2',
    });

    const options = mockSendMessage.mock.calls[0][2] as Record<string, unknown>;
    expect(options.parse_mode).toBe('MarkdownV2');
  });

  it('should handle buttons with callbackData', async () => {
    mockSendMessage.mockResolvedValue({ message_id: 101 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    await provider.send({
      text: 'Choose:',
      buttons: [[{ text: 'Btn', callbackData: 'cb-123' }]],
    });

    const options = mockSendMessage.mock.calls[0][2] as Record<string, unknown>;
    const markup = JSON.parse(options.reply_markup as string) as Record<
      string,
      unknown
    >;
    const keyboard = (markup.inline_keyboard as unknown[][])[0][0];
    expect(keyboard).toHaveProperty('callback_data');
  });

  it('should handle non-Error throw', async () => {
    mockSendMessage.mockRejectedValue('string error');

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    const result = await provider.send({ text: 'Hello' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown Telegram error');
  });

  it('should reuse bot instance', async () => {
    mockSendMessage.mockResolvedValue({ message_id: 200 });

    const provider = new TelegramBotProvider({
      token: 'bot-token',
      defaultChatId: '12345',
    });

    await provider.send({ text: 'First' });
    await provider.send({ text: 'Second' });

    expect(mockGetTelegramBot).toHaveBeenCalledTimes(1);
  });
});

describe('isTelegramBotInstalled', () => {
  it('should check package installation', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);
    expect(isTelegramBotInstalled()).toBe(true);
    expect(isPackageInstalled).toHaveBeenCalledWith('node-telegram-bot-api');
  });
});
