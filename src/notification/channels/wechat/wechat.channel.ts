/**
 * WeChat channel types.
 *
 * Required packages by provider:
 * - `wechat-api` or `wechat-jssdk`
 * - Or use HTTP API directly (no package needed)
 *
 * @module
 */

/** WeChat channel input via WeChat Official Account API. */
export interface WeChatSendInput {
  /** OpenID of the recipient. */
  toUser: string;
  /** Template ID for template messages. */
  templateId?: string;
  /** URL to redirect when template message is clicked. */
  url?: string;
  /** Mini program page path (for mini program messages). */
  miniprogram?: { appId: string; pagePath: string };
  /** Template data key-value pairs. */
  data?: Record<string, { value: string; color?: string }>;
  /** Text content for customer service messages. */
  text?: string;
}
