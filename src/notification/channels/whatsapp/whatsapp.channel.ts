/**
 * WhatsApp channel types.
 *
 * Required packages by provider:
 * - WhatsApp Business API (Cloud): `@whiskeysockets/baileys` or HTTP API
 * - WhatsApp Business API (On-Premise): `whatsapp-web.js`
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** WhatsApp channel input via WhatsApp Business API. */
export interface WhatsAppSendInput {
  /** Recipient phone number in E.164 format (e.g., '+1234567890'). */
  to: string;
  /** Message body text. */
  body: string;
  /** Sender phone number or WhatsApp Business ID. */
  from?: string;
  /** Template message name (for template-based messages). */
  template?: string;
  /** Template parameters. */
  templateParams?: Record<string, string>;
  /** Media URL to send as attachment. */
  mediaUrl?: string;
  /** Caption for media messages. */
  caption?: string;
}
