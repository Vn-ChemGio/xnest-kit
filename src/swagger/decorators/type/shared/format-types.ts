/**
 * Format type unions used by ApiProperty, ApiParam, and ApiQuery overloads.
 *
 * These types enforce compile-time type checking between `type` and `format`.
 * They are internal to the swagger module and not exported publicly.
 *
 * @module
 */

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
