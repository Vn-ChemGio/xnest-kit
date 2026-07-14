import { ApiProperty as NestApiProperty } from '@nestjs/swagger';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { getFormatExample } from './format-examples';
import { getValidatorDecorators } from './format-validators';

/**
 * Base options shared by all overloads.
 * Overrides `required` to only accept `boolean | undefined` (not `string[]`).
 */
type BaseProps = Omit<ApiPropertyOptions, 'type' | 'format' | 'required'> & {
  required?: boolean;
};

// ─── Format type unions ──────────────────────────────────────────

/**
 * String formats — property type must be `String` (or omitted, defaults to string).
 */
export type StringFormat =
  // Identity
  | 'uuid'
  | 'uuid-v1'
  | 'uuid-v4'
  | 'mongo'
  | 'ulid'
  // User Info
  | 'first-name'
  | 'last-name'
  | 'full-name'
  | 'username'
  | 'nickname'
  | 'job-title'
  | 'company'
  | 'department'
  // Contact
  | 'email'
  | 'idn-email'
  | 'phone'
  | 'phone-international'
  | 'phone-us'
  | 'phone-vn'
  | 'fax'
  // Social
  | 'website'
  | 'avatar'
  | 'github'
  | 'linkedin'
  | 'twitter'
  // Network
  | 'url'
  | 'uri'
  | 'uri-reference'
  | 'hostname'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'ip'
  | 'port'
  | 'mac'
  | 'user-agent'
  | 'content-type'
  | 'accept'
  | 'bearer-token'
  | 'api-key'
  // Date & Time
  | 'date'
  | 'date-time'
  | 'time'
  | 'time-24h'
  | 'timestamp'
  | 'duration'
  | 'timezone'
  // Address
  | 'address-line1'
  | 'address-line2'
  | 'address-city'
  | 'address-state'
  | 'address-country'
  | 'address'
  | 'postal-code'
  | 'postal-code-us'
  | 'postal-code-vn'
  | 'country-code-2'
  | 'country-code-3'
  | 'country-code-numeric'
  // Financial (string)
  | 'creditcard'
  | 'creditcard-visa'
  | 'creditcard-mc'
  | 'credit-card'
  | 'card-number'
  | 'cvv'
  | 'iban'
  | 'swift'
  | 'bic'
  | 'currency'
  | 'bitcoin'
  | 'ethereum'
  | 'tax-id'
  | 'vat'
  // Money (formatted string)
  | 'money'
  | 'decimal'
  // Document
  | 'isbn'
  | 'isbn10'
  | 'isbn13'
  | 'ean'
  | 'passport'
  | 'identity-card'
  | 'driver-license'
  | 'ssn'
  // Media & Encoding
  | 'base64'
  | 'hex'
  | 'binary'
  | 'byte'
  | 'json'
  | 'jwt'
  | 'mime'
  | 'mimetype'
  | 'slug'
  | 'password'
  | 'strong'
  // Code & Tech
  | 'semver'
  | 'locale'
  | 'alpha'
  | 'alphanumeric'
  | 'numeric'
  | 'octal'
  | 'ascii'
  | 'regex'
  // Color
  | 'color'
  | 'color-name'
  | 'hexcolor'
  | 'rgb'
  | 'hsl'
  // File
  | 'file-path'
  | 'dir-path'
  | 'file-ext'
  | 'css-class'
  | 'css-selector'
  // Markup
  | 'markdown'
  | 'html'
  | 'xml';

/**
 * Number formats — property type MUST be `Number`.
 */
export type NumberFormat =
  | 'float'
  | 'double'
  | 'int32'
  | 'int64'
  | 'positive'
  | 'negative'
  | 'latitude'
  | 'longitude'
  | 'percentage';

/**
 * Boolean formats — property type MUST be `Boolean`.
 */
export type BooleanFormat = 'boolean';

// ─── Typed options for overloads ─────────────────────────────────

/**
 * Options when using a StringFormat.
 * `type` defaults to `String`; if provided, must be `String`.
 */
type StringFormatProps = BaseProps & {
  type?: typeof String;
  format: StringFormat;
};

/**
 * Options when using a NumberFormat.
 * `type` is required and must be `Number`.
 */
type NumberFormatProps = BaseProps & {
  type: typeof Number;
  format: NumberFormat;
};

/**
 * Options when using a BooleanFormat.
 * `type` is required and must be `Boolean`.
 */
type BooleanFormatProps = BaseProps & {
  type: typeof Boolean;
  format: BooleanFormat;
};

/**
 * Options when no format is specified (any type allowed).
 */
type NoFormatProps = BaseProps & {
  type?: ApiPropertyOptions['type'];
  format?: undefined;
};

// ─── Enhanced XPropertyOptions (for internal use / documentation) ─

/**
 * Enhanced ApiProperty options.
 * Adds auto-example generation and optional class-validator integration.
 *
 * Use `required: false` to mark a property as optional.
 *
 * @example
 * ```typescript
 * import { ApiProperty } from 'xnest-kit/swagger';
 *
 * class User {
 *   @ApiProperty({ format: 'uuid' })
 *   id: string;          // required, example: "550e8400-e29b-41d4-a716-446655440000"
 *
 *   @ApiProperty({ format: 'email' })
 *   email: string;       // required, example: "user@example.com"
 *
 *   @ApiProperty({ format: 'phone', required: false })
 *   phone?: string;      // optional, example: "+1-202-555-0149"
 *
 *   @ApiProperty({ type: Number, format: 'latitude' })
 *   lat: number;         // required, example: 10.762622
 * }
 * ```
 */
export type XPropertyOptions = ApiPropertyOptions & {
  format?: StringFormat | NumberFormat | BooleanFormat;
};

// ─── Implementation ──────────────────────────────────────────────

/**
 * Resolve example from format when not explicitly provided.
 */
function resolveOptions(
  options: { type?: unknown; format?: string } & BaseProps,
): ApiPropertyOptions {
  const opts = options as XPropertyOptions;
  if (!opts.format) return options as ApiPropertyOptions;
  const autoExample =
    opts.example === undefined
      ? getFormatExample(
          typeof opts.type === 'string' ? opts.type : undefined,
          opts.format,
        )
      : undefined;
  return {
    ...opts,
    ...(autoExample !== undefined ? { example: autoExample } : {}),
  };
}

/**
 * Create a combined decorator that applies both swagger and class-validator.
 */
function createEnhancedDecorator(
  options: { type?: unknown; format?: string; required?: boolean } & BaseProps,
): PropertyDecorator {
  const swaggerOpts = resolveOptions(options);
  const swaggerDeco = NestApiProperty(swaggerOpts);
  const validatorDecos = getValidatorDecorators({
    format: options?.format,
    required: options?.required,
  });

  return (target: object, propertyKey: string | symbol) => {
    swaggerDeco(target, propertyKey);
    validatorDecos.forEach((deco) => deco(target, propertyKey));
  };
}

// ─── Public API with overloads ───────────────────────────────────

/**
 * Enhanced ApiProperty decorator.
 *
 * Wraps `@nestjs/swagger` `ApiProperty` with:
 * - Auto-example generation based on `type` + `format`
 * - Auto class-validator integration when `class-validator` is installed
 * - **Compile-time type checking** between `type` and `format`
 *
 * **Type rules:**
 * - `StringFormat` (uuid, email, ...) → `type?: String` (or omitted)
 * - `NumberFormat` (latitude, float, ...) → `type: Number` (required)
 * - `BooleanFormat` (boolean) → `type: Boolean` (required)
 * - No format → any type allowed
 *
 * Use `required: false` to mark the field as optional in the API schema.
 *
 * @param options - Property options with type-safe format
 * @returns Property decorator (combines swagger + validation)
 *
 * @example
 * ```typescript
 * import { ApiProperty } from 'xnest-kit/swagger';
 *
 * class User {
 *   @ApiProperty({ format: 'uuid' })
 *   id: string;
 *
 *   @ApiProperty({ format: 'email' })
 *   email: string;
 *
 *   @ApiProperty({ format: 'phone', required: false })
 *   phone?: string;
 *
 *   @ApiProperty({ type: Number, format: 'latitude' })
 *   latitude: number;
 * }
 * ```
 */
export function ApiProperty(options: StringFormatProps): PropertyDecorator;
export function ApiProperty(options: NumberFormatProps): PropertyDecorator;
export function ApiProperty(options: BooleanFormatProps): PropertyDecorator;
export function ApiProperty(options: NoFormatProps): PropertyDecorator;
export function ApiProperty(
  options?:
    StringFormatProps | NumberFormatProps | BooleanFormatProps | NoFormatProps,
): PropertyDecorator {
  return createEnhancedDecorator(options ?? {});
}
