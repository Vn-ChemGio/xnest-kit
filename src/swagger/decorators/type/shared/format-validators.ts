import { isPackageInstalled } from '../../../../utils';

type ValidatorDecorator = PropertyDecorator;

interface ClassValidatorDecorators {
  IsEmail: (...args: any[]) => PropertyDecorator;
  IsUUID: (...args: any[]) => PropertyDecorator;
  IsUrl: (...args: any[]) => PropertyDecorator;
  IsPhoneNumber: (...args: any[]) => PropertyDecorator;
  IsIP: (...args: any[]) => PropertyDecorator;
  IsDateString: (...args: any[]) => PropertyDecorator;
  IsMilitaryTime: (...args: any[]) => PropertyDecorator;
  IsJSON: (...args: any[]) => PropertyDecorator;
  IsJWT: (...args: any[]) => PropertyDecorator;
  IsBase64: (...args: any[]) => PropertyDecorator;
  IsCreditCard: (...args: any[]) => PropertyDecorator;
  IsFQDN: (...args: any[]) => PropertyDecorator;
  IsMACAddress: (...args: any[]) => PropertyDecorator;
  IsISBN: (...args: any[]) => PropertyDecorator;
  IsEAN: (...args: any[]) => PropertyDecorator;
  IsHexadecimal: (...args: any[]) => PropertyDecorator;
  IsMongoId: (...args: any[]) => PropertyDecorator;
  IsPort: (...args: any[]) => PropertyDecorator;
  IsStrongPassword: (...args: any[]) => PropertyDecorator;
  IsCurrency: (...args: any[]) => PropertyDecorator;
  IsIBAN: (...args: any[]) => PropertyDecorator;
  IsBIC: (...args: any[]) => PropertyDecorator;
  IsMimeType: (...args: any[]) => PropertyDecorator;
  IsSemVer: (...args: any[]) => PropertyDecorator;
  IsLocale: (...args: any[]) => PropertyDecorator;
  IsAscii: (...args: any[]) => PropertyDecorator;
  IsAlpha: (...args: any[]) => PropertyDecorator;
  IsAlphanumeric: (...args: any[]) => PropertyDecorator;
  IsNumberString: (...args: any[]) => PropertyDecorator;
  IsOctal: (...args: any[]) => PropertyDecorator;
  IsPostalCode: (...args: any[]) => PropertyDecorator;
  IsRgbColor: (...args: any[]) => PropertyDecorator;
  IsHash: (...args: any[]) => PropertyDecorator;
  Matches: (...args: any[]) => PropertyDecorator;
  IsBooleanString: (...args: any[]) => PropertyDecorator;
  IsLatitude: (...args: any[]) => PropertyDecorator;
  IsLongitude: (...args: any[]) => PropertyDecorator;
  IsOptional: (...args: any[]) => PropertyDecorator;
}

/**
 * Map from our `format` to class-validator decorator.
 *
 * Only includes formats that have a direct mapping to a class-validator decorator.
 * Formats without a mapping (e.g., 'address', 'company') are skipped.
 */
const FORMAT_VALIDATOR_MAP: Record<
  string,
  (d: ClassValidatorDecorators) => ValidatorDecorator
> = {
  // ─── Identity ─────────────────────────────────────────────
  uuid: (d) => d.IsUUID(),
  'uuid-v1': (d) => d.IsUUID(1),
  'uuid-v4': (d) => d.IsUUID(4),
  mongo: (d) => d.IsMongoId(),

  // ─── Contact ──────────────────────────────────────────────
  email: (d) => d.IsEmail(),
  'idn-email': (d) => d.IsEmail(),
  phone: (d) => d.IsPhoneNumber(),
  'phone-international': (d) => d.IsPhoneNumber(),
  'phone-us': (d) => d.IsPhoneNumber('US'),
  'phone-vn': (d) => d.IsPhoneNumber('VN'),
  fax: (d) => d.IsPhoneNumber(),

  // ─── Network ──────────────────────────────────────────────
  url: (d) => d.IsUrl(),
  uri: (d) => d.IsUrl(),
  hostname: (d) => d.IsFQDN(),
  ipv4: (d) => d.IsIP(4),
  ipv6: (d) => d.IsIP(6),
  ip: (d) => d.IsIP(),
  port: (d) => d.IsPort(),
  mac: (d) => d.IsMACAddress(),

  // ─── Date & Time ──────────────────────────────────────────
  date: (d) => d.IsDateString(),
  'date-time': (d) => d.IsDateString(),
  time: (d) => d.IsMilitaryTime(),
  'time-24h': (d) => d.IsMilitaryTime(),

  // ─── Financial ────────────────────────────────────────────
  creditcard: (d) => d.IsCreditCard(),
  'creditcard-visa': (d) => d.IsCreditCard(),
  'creditcard-mc': (d) => d.IsCreditCard(),
  'credit-card': (d) => d.IsCreditCard(),
  'card-number': (d) => d.IsCreditCard(),
  iban: (d) => d.IsIBAN(),
  bic: (d) => d.IsBIC(),
  swift: (d) => d.IsBIC(),
  currency: (d) => d.IsCurrency(),

  // ─── Document ─────────────────────────────────────────────
  isbn: (d) => d.IsISBN(),
  isbn10: (d) => d.IsISBN(10),
  isbn13: (d) => d.IsISBN(13),
  ean: (d) => d.IsEAN(),

  // ─── Media & Encoding ─────────────────────────────────────
  json: (d) => d.IsJSON(),
  jwt: (d) => d.IsJWT(),
  base64: (d) => d.IsBase64(),
  hex: (d) => d.IsHexadecimal(),
  mime: (d) => d.IsMimeType(),
  mimetype: (d) => d.IsMimeType(),

  // ─── Code & Tech ──────────────────────────────────────────
  semver: (d) => d.IsSemVer(),
  locale: (d) => d.IsLocale(),
  alpha: (d) => d.IsAlpha(),
  alphanumeric: (d) => d.IsAlphanumeric(),
  numeric: (d) => d.IsNumberString(),
  octal: (d) => d.IsOctal(),
  ascii: (d) => d.IsAscii(),

  // ─── Color ────────────────────────────────────────────────
  hexcolor: (d) => d.IsRgbColor({ require_hex: true }),
  rgb: (d) => d.IsRgbColor(),

  // ─── Address ──────────────────────────────────────────────
  'postal-code': (d) => d.IsPostalCode('any'),
  'postal-code-us': (d) => d.IsPostalCode('US'),
  'postal-code-vn': (d) => d.IsPostalCode('VN'),

  // ─── Geo ──────────────────────────────────────────────────
  latitude: (d) => d.IsLatitude(),
  longitude: (d) => d.IsLongitude(),

  // ─── Boolean ──────────────────────────────────────────────
  boolean: (d) => d.IsBooleanString(),
};

let classValidator: ClassValidatorDecorators | null = null;

function getClassValidator(): ClassValidatorDecorators | null {
  if (classValidator) return classValidator;
  if (!isPackageInstalled('class-validator')) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    classValidator = require('class-validator') as ClassValidatorDecorators;
    return classValidator;
  } catch {
    return null;
  }
}

/**
 * Options for resolving class-validator decorators.
 */
export interface ValidatorOptions {
  /** The format string (e.g., 'email', 'uuid') */
  format?: string;
  /** Whether the field is required. When `false`, applies `@IsOptional()` */
  required?: boolean;
}

/**
 * Get class-validator decorators for the given options, if class-validator is installed.
 *
 * Returns an array of decorators based on:
 * - `format` → format-specific validator (e.g., `@IsEmail()`)
 * - `required: false` → `@IsOptional()`
 *
 * @param options - The property options
 * @returns Array of class-validator decorators, empty if package not installed
 *
 * @example
 * ```typescript
 * // format: 'email', required: true (default)
 * getValidatorDecorators({ format: 'email' })
 * // → [@IsEmail()]
 *
 * // format: 'email', required: false
 * getValidatorDecorators({ format: 'email', required: false })
 * // → [@IsEmail(), @IsOptional()]
 *
 * // no format, required: false
 * getValidatorDecorators({ required: false })
 * // → [@IsOptional()]
 * ```
 */
export function getValidatorDecorators(
  options: ValidatorOptions,
): ValidatorDecorator[] {
  const cv = getClassValidator();
  if (!cv) return [];

  const decos: ValidatorDecorator[] = [];

  if (options.format) {
    const factory = FORMAT_VALIDATOR_MAP[options.format];
    const deco = factory?.(cv);
    if (deco) decos.push(deco);
  }

  if (options.required === false && cv.IsOptional) {
    decos.push(cv.IsOptional());
  }

  return decos;
}
