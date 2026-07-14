/**
 * Format Example Map
 *
 * Resolved example values for common OpenAPI formats.
 * Each entry maps a format string to a realistic example value
 * that will be used when the user does not provide an explicit `example`.
 *
 * @module
 */

/**
 * Format → example value mapping.
 *
 * Examples follow OpenAPI spec conventions and are grouped by category.
 * - **String formats** produce string examples
 * - **Number formats** produce number examples
 * - **Financial formats** produce either string (formatted) or number examples
 */
export const FORMAT_EXAMPLES: Record<string, unknown> = {
  // ─── Identity ─────────────────────────────────────────────────
  /** UUID v4 (most common) */
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  /** UUID v1 (time-based) */
  'uuid-v1': '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  /** UUID v4 (random) */
  'uuid-v4': '550e8400-e29b-41d4-a716-446655440000',
  /** MongoDB ObjectId (24-char hex) */
  mongo: '507f1f77bcf86cd799439011',
  /** ULID (time-sortable identifier) */
  ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',

  // ─── User Info ────────────────────────────────────────────────
  /** First name */
  'first-name': 'John',
  /** Last name */
  'last-name': 'Doe',
  /** Full name */
  'full-name': 'John Doe',
  /** Username / login */
  username: 'johndoe',
  /** Display name / nickname */
  nickname: 'Johnny',
  /** Job title */
  'job-title': 'Senior Software Engineer',
  /** Company / organization */
  company: 'Acme Corporation',
  /** Department */
  department: 'Engineering',

  // ─── Contact ──────────────────────────────────────────────────
  /** Email address */
  email: 'user@example.com',
  /** International email (IDN) */
  'idn-email': 'user@example.com',
  /** Phone number (E.164) */
  phone: '+1-202-555-0149',
  /** International phone */
  'phone-international': '+84 912 345 678',
  /** US phone */
  'phone-us': '(202) 555-0149',
  /** Vietnamese phone */
  'phone-vn': '0912345678',
  /** Fax number */
  fax: '+1-202-555-0199',

  // ─── Social / Online ─────────────────────────────────────────
  /** Website URL */
  website: 'https://example.com',
  /** Avatar / profile image URL */
  avatar: 'https://example.com/avatar.jpg',
  /** GitHub profile URL */
  github: 'https://github.com/johndoe',
  /** LinkedIn profile URL */
  linkedin: 'https://linkedin.com/in/johndoe',
  /** Twitter/X profile URL */
  twitter: 'https://twitter.com/johndoe',

  // ─── Network ──────────────────────────────────────────────────
  /** URL */
  url: 'https://example.com',
  /** URI */
  uri: 'https://example.com/path?query=1',
  /** URI reference (relative) */
  'uri-reference': '/api/v1/users',
  /** Hostname */
  hostname: 'example.com',
  /** IDN hostname */
  'idn-hostname': 'example.com',
  /** IPv4 address */
  ipv4: '192.168.1.1',
  /** IPv6 address */
  ipv6: '2001:db8::1',
  /** IP address (v4 or v6) */
  ip: '192.168.1.1',
  /** Port number */
  port: '8080',
  /** MAC address */
  mac: '00:1A:2B:3C:4D:5E',
  /** User-Agent string */
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  /** Content-Type */
  'content-type': 'application/json',
  /** Accept header */
  accept: 'application/json',
  /** Bearer token */
  'bearer-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  /** API key */
  'api-key': 'sk_live_abc123def456',

  // ─── Date & Time ──────────────────────────────────────────────
  /** Date only (ISO 8601) */
  date: '2024-01-15',
  /** Date-time (ISO 8601) */
  'date-time': '2024-01-15T09:30:00Z',
  /** Time only */
  time: '09:30:00',
  /** 24-hour time */
  'time-24h': '23:59',
  /** Unix timestamp (seconds) */
  timestamp: '1705312200',
  /** ISO 8601 duration */
  duration: 'P3Y6M4DT12H30M5S',
  /** IANA timezone */
  timezone: 'Asia/Ho_Chi_Minh',

  // ─── Address ──────────────────────────────────────────────────
  /** Street address line 1 */
  'address-line1': '123 Main Street',
  /** Street address line 2 */
  'address-line2': 'Suite 100',
  /** City / locality */
  'address-city': 'San Francisco',
  /** State / province / region */
  'address-state': 'California',
  /** Country */
  'address-country': 'United States',
  /** Full address */
  address: '123 Main St, San Francisco, CA 94105, United States',
  /** Postal / ZIP code */
  'postal-code': '100000',
  /** US ZIP code */
  'postal-code-us': '94105',
  /** Vietnamese postal code */
  'postal-code-vn': '700000',
  /** ISO 3166-1 alpha-2 country code */
  'country-code-2': 'VN',
  /** ISO 3166-1 alpha-3 country code */
  'country-code-3': 'VNM',
  /** ISO 3166-1 numeric country code */
  'country-code-numeric': '704',
  /** Latitude */
  latitude: 10.762622,
  /** Longitude */
  longitude: 106.660172,
  /** GeoJSON point [lng, lat] */
  'geo-point': [106.660172, 10.762622],

  // ─── Financial ────────────────────────────────────────────────
  /** Credit card number */
  creditcard: '4111111111111111',
  /** Credit card (Visa) */
  'creditcard-visa': '4111111111111111',
  /** Credit card (Mastercard) */
  'creditcard-mc': '5500000000000004',
  /** Credit card with spaces */
  'credit-card': '4242 4242 4242 4242',
  /** Card number */
  'card-number': '4242 4242 4242 4242',
  /** CVV / CVC */
  cvv: '123',
  /** IBAN */
  iban: 'DE89 3704 0044 0532 0130 00',
  /** SWIFT / BIC code */
  swift: 'DEUTDEFF',
  /** BIC code */
  bic: 'DEUTDEFF',
  /** Currency code (ISO 4217) */
  currency: 'USD',
  /** Bitcoin address */
  bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  /** Ethereum address */
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bE22',
  /** Tax ID (SSN) */
  'tax-id': '123-45-6789',
  /** VAT number */
  vat: 'DE123456789',

  // ─── Number: Financial ────────────────────────────────────────
  /** Money amount (formatted string) */
  money: '1,234.56',
  /** Decimal number (formatted string) */
  decimal: '1,234.56',
  /** Percentage */
  percentage: 75.5,

  // ─── Document ─────────────────────────────────────────────────
  /** ISBN */
  isbn: '978-3-16-148410-0',
  /** ISBN-10 */
  isbn10: '0-306-40615-2',
  /** ISBN-13 */
  isbn13: '978-0-306-40615-7',
  /** EAN barcode */
  ean: '5901234123457',
  /** Passport number */
  passport: 'AB1234567',
  /** National identity card */
  'identity-card': '001234567890',
  /** Driver license */
  'driver-license': 'D123-4567-8901',
  /** Social security number */
  ssn: '123-45-6789',

  // ─── Media & Encoding ────────────────────────────────────────
  /** Base64 encoded string */
  base64: 'dGVzdA==',
  /** Hexadecimal string */
  hex: '48656c6c6f',
  /** Binary placeholder */
  binary: '(binary)',
  /** Byte-encoded string */
  byte: 'dGVzdA==',
  /** JSON string */
  json: '{"key": "value"}',
  /** JWT token */
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
  /** MIME type */
  mime: 'image/png',
  /** URL slug */
  slug: 'my-example-slug',
  /** Password (masked) */
  password: '********',
  /** Strong password */
  strong: 'P@ssw0rd!2024',

  // ─── Code & Tech ──────────────────────────────────────────────
  /** Semantic version */
  semver: '1.0.0',
  /** Locale / language tag */
  locale: 'en-US',
  /** Alpha characters only */
  alpha: 'HelloWorld',
  /** Alphanumeric characters */
  alphanumeric: 'User123',
  /** Numeric string */
  numeric: '12345',
  /** Octal number */
  octal: '0o777',
  /** ASCII string */
  ascii: 'Hello World',
  /** Color code */
  color: '#FF5733',
  /** HTML color name */
  'color-name': 'tomato',
  /** CSS class name */
  'css-class': 'container-md',
  /** CSS selector */
  'css-selector': '.container > .row',
  /** Hex color */
  hexcolor: '#FF5733',
  /** RGB color */
  rgb: 'rgb(255, 87, 51)',
  /** HSL color */
  hsl: 'hsl(14, 100%, 60%)',
  /** File path */
  'file-path': '/var/log/app.log',
  /** Directory path */
  'dir-path': '/usr/local/bin',
  /** File extension */
  'file-ext': '.ts',
  /** MIME type */
  mimetype: 'application/json',
  /** Regular expression */
  regex: '^[a-zA-Z0-9]+$',
  /** Markdown text */
  markdown: '# Hello World\n\nThis is **bold**.',
  /** HTML snippet */
  html: '<p>Hello World</p>',
  /** XML snippet */
  xml: '<root><item>value</item></root>',

  // ─── Boolean ──────────────────────────────────────────────────
  /** Boolean flag */
  boolean: true,

  // ─── Number ───────────────────────────────────────────────────
  /** Float number */
  float: 3.14,
  /** Double precision float */
  double: 3.14159265,
  /** 32-bit integer */
  int32: 42,
  /** 64-bit integer */
  int64: 42,
  /** Positive integer */
  positive: 1,
  /** Negative integer */
  negative: -1,

  // ─── Array / Object ──────────────────────────────────────────
  /** String array */
  'string-array': ['item1', 'item2', 'item3'],
  /** Number array */
  'number-array': [1, 2, 3],
  /** Key-value map */
  'key-value': { key: 'value' },
};

/**
 * Get auto-generated example based on type and format.
 *
 * @param type - The OpenAPI type ('string', 'number', 'integer', 'boolean', 'array', 'object')
 * @param format - The format hint (e.g., 'email', 'uuid', 'money')
 * @returns The example value, or undefined if no match
 *
 * @example
 * ```typescript
 * getFormatExample('string', 'email');  // 'user@example.com'
 * getFormatExample('number', 'money');  // '1,234.56'
 * getFormatExample('integer', 'int32'); // 42
 * ```
 */
export function getFormatExample(
  type: string | undefined,
  format: string | undefined,
): unknown {
  if (!format) return undefined;

  const example = FORMAT_EXAMPLES[format];
  if (example !== undefined) return example;

  // Fallback based on type
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 0;
    case 'integer':
      return 0;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return undefined;
  }
}

/**
 * Format → TypeScript type mapping.
 * Used to enforce that format produces a value compatible with the property type.
 *
 * @internal
 */
export const FORMAT_TYPE_MAP: Record<
  string,
  'string' | 'number' | 'boolean' | 'unknown'
> = {
  // String formats
  uuid: 'string',
  'uuid-v1': 'string',
  'uuid-v4': 'string',
  mongo: 'string',
  ulid: 'string',
  'first-name': 'string',
  'last-name': 'string',
  'full-name': 'string',
  username: 'string',
  nickname: 'string',
  'job-title': 'string',
  company: 'string',
  department: 'string',
  email: 'string',
  'idn-email': 'string',
  phone: 'string',
  'phone-international': 'string',
  'phone-us': 'string',
  'phone-vn': 'string',
  fax: 'string',
  website: 'string',
  avatar: 'string',
  github: 'string',
  linkedin: 'string',
  twitter: 'string',
  url: 'string',
  uri: 'string',
  'uri-reference': 'string',
  hostname: 'string',
  'idn-hostname': 'string',
  ipv4: 'string',
  ipv6: 'string',
  ip: 'string',
  port: 'string',
  mac: 'string',
  'user-agent': 'string',
  'content-type': 'string',
  accept: 'string',
  'bearer-token': 'string',
  'api-key': 'string',
  date: 'string',
  'date-time': 'string',
  time: 'string',
  'time-24h': 'string',
  timestamp: 'string',
  duration: 'string',
  timezone: 'string',
  'address-line1': 'string',
  'address-line2': 'string',
  'address-city': 'string',
  'address-state': 'string',
  'address-country': 'string',
  address: 'string',
  'postal-code': 'string',
  'postal-code-us': 'string',
  'postal-code-vn': 'string',
  'country-code-2': 'string',
  'country-code-3': 'string',
  'country-code-numeric': 'string',
  creditcard: 'string',
  'creditcard-visa': 'string',
  'creditcard-mc': 'string',
  'credit-card': 'string',
  'card-number': 'string',
  cvv: 'string',
  iban: 'string',
  swift: 'string',
  bic: 'string',
  currency: 'string',
  bitcoin: 'string',
  ethereum: 'string',
  'tax-id': 'string',
  vat: 'string',
  isbn: 'string',
  isbn10: 'string',
  isbn13: 'string',
  ean: 'string',
  passport: 'string',
  'identity-card': 'string',
  'driver-license': 'string',
  ssn: 'string',
  base64: 'string',
  hex: 'string',
  binary: 'string',
  byte: 'string',
  json: 'string',
  jwt: 'string',
  mime: 'string',
  mimetype: 'string',
  slug: 'string',
  password: 'string',
  strong: 'string',
  semver: 'string',
  locale: 'string',
  alpha: 'string',
  alphanumeric: 'string',
  numeric: 'string',
  octal: 'string',
  ascii: 'string',
  color: 'string',
  'color-name': 'string',
  'css-class': 'string',
  'css-selector': 'string',
  hexcolor: 'string',
  rgb: 'string',
  hsl: 'string',
  'file-path': 'string',
  'dir-path': 'string',
  'file-ext': 'string',
  regex: 'string',
  markdown: 'string',
  html: 'string',
  xml: 'string',

  // Number formats
  float: 'number',
  double: 'number',
  int32: 'number',
  int64: 'number',
  positive: 'number',
  negative: 'number',

  // String that looks like number (formatted)
  money: 'string',
  decimal: 'string',
  percentage: 'number',

  // Boolean
  boolean: 'boolean',

  // Unknown type
  latitude: 'number',
  longitude: 'number',
  'geo-point': 'unknown',
  'string-array': 'unknown',
  'number-array': 'unknown',
  'key-value': 'unknown',
};

/**
 * Check if a format produces a string value.
 *
 * @param format - The format to check
 * @returns True if the format produces a string example
 */
export function isStringFormat(format: string): boolean {
  return FORMAT_TYPE_MAP[format] === 'string';
}

/**
 * Check if a format produces a number value.
 *
 * @param format - The format to check
 * @returns True if the format produces a number example
 */
export function isNumberFormat(format: string): boolean {
  return FORMAT_TYPE_MAP[format] === 'number';
}

/**
 * Check if a format produces a boolean value.
 *
 * @param format - The format to check
 * @returns True if the format produces a boolean example
 */
export function isBooleanFormat(format: string): boolean {
  return FORMAT_TYPE_MAP[format] === 'boolean';
}

/**
 * Get the expected type for a format.
 *
 * @param format - The format to check
 * @returns The expected TypeScript type, or 'unknown' if not mapped
 */
export function getFormatType(
  format: string,
): 'string' | 'number' | 'boolean' | 'unknown' {
  return FORMAT_TYPE_MAP[format] ?? 'unknown';
}
