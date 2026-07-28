/**
 * WeChat Official Account API provider.
 *
 * Uses built-in `fetch` (no external packages required).
 *
 * @module
 */

import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { WeChatSendInput } from './wechat.channel';

/**
 * Configuration for the WeChat Official Account provider.
 */
export interface WeChatOfficialProviderConfig {
  /** WeChat Official Account AppID. */
  appId: string;
  /** WeChat Official Account AppSecret. */
  appSecret: string;
}

/**
 * WeChat provider via Official Account API.
 *
 * @example
 * ```typescript
 * import { WeChatOfficialProvider } from 'xnest-kit/notification/channel/wechat';
 *
 * const provider = new WeChatOfficialProvider({
 *   appId: process.env.WECHAT_APP_ID,
 *   appSecret: process.env.WECHAT_APP_SECRET,
 * });
 * ```
 */
export class WeChatOfficialProvider implements NotificationProvider<WeChatSendInput> {
  readonly name = 'wechat-official';
  readonly channel = 'wechat';

  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: WeChatOfficialProviderConfig) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.appId}&secret=${this.config.appSecret}`;
    const response = await fetch(url);
    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      errcode?: number;
      errmsg?: string;
    };

    if (data.errcode) {
      throw new Error(`WeChat token error ${data.errcode}: ${data.errmsg}`);
    }

    this.accessToken = data.access_token!;
    this.tokenExpiry = Date.now() + (data.expires_in ?? 7200) * 1000 - 60000;
    return this.accessToken;
  }

  async send(input: WeChatSendInput): Promise<ProviderResult> {
    try {
      const token = await this.getAccessToken();

      if (input.templateId) {
        const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;

        const data: Record<string, unknown> = {
          touser: input.toUser,
          template_id: input.templateId,
          url: input.url ?? '',
        };

        if (input.miniprogram) {
          data.miniprogram = input.miniprogram;
        }

        if (input.data) {
          data.data = input.data;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = (await response.json()) as {
          errcode: number;
          errmsg: string;
          msgid?: number;
        };

        if (result.errcode !== 0) {
          return {
            success: false,
            providerName: this.name,
            channel: this.channel,
            error: `WeChat API error ${result.errcode}: ${result.errmsg}`,
          };
        }

        return {
          success: true,
          providerName: this.name,
          channel: this.channel,
          messageId: result.msgid ? String(result.msgid) : undefined,
        };
      }

      if (input.text) {
        const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            touser: input.toUser,
            msgtype: 'text',
            text: { content: input.text },
          }),
        });

        const result = (await response.json()) as {
          errcode: number;
          errmsg: string;
        };

        if (result.errcode !== 0) {
          return {
            success: false,
            providerName: this.name,
            channel: this.channel,
            error: `WeChat API error ${result.errcode}: ${result.errmsg}`,
          };
        }

        return {
          success: true,
          providerName: this.name,
          channel: this.channel,
        };
      }

      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: 'No templateId or text provided',
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown WeChat error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
