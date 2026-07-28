/**
 * SMS channel types.
 *
 * Required packages by provider:
 * - Twilio: `twilio`
 * - Vonage: `@vonage/server-sdk`
 * - AWS SNS: `@aws-sdk/client-sns`
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** SMS channel input. */
export interface SmsSendInput {
  to: string;
  body: string;
  from?: string;
}
