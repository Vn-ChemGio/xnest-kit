/**
 * Google Chat channel types.
 *
 * Required packages by provider:
 * - None (uses built-in `fetch` for webhook-based sending)
 *
 * @module
 */

/** Google Chat channel input. */
export interface GoogleChatSendInput {
  webhookUrl: string;
  text: string;
  threadKey?: string;
  cards?: Array<{
    header?: {
      title?: string;
      subtitle?: string;
      imageUrl?: string;
    };
    sections?: Array<{
      header?: string;
      widgets?: Array<{
        textParagraph?: { text: string };
        keyValue?: {
          topLabel?: string;
          content?: string;
          bottomLabel?: string;
        };
        buttons?: Array<{
          textButton?: {
            text: string;
            onClick?: { openLink?: { url: string } };
          };
        }>;
      }>;
    }>;
  }>;
}
