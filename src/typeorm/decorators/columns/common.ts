import { Column } from 'typeorm';
import type { ColumnOptions } from './options';

/**
 * UUID column.
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XUuid } from 'xnest-kit/typeorm';
 *
 * @XUuid()
 * trackingId: string;
 * ```
 */
export function XUuid(options?: ColumnOptions): PropertyDecorator {
  return Column('uuid', {
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * Email column (varchar 255).
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XEmail } from 'xnest-kit/typeorm';
 *
 * @XEmail()
 * email: string;
 * ```
 */
export function XEmail(options?: ColumnOptions): PropertyDecorator {
  return Column('varchar', {
    length: 255,
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * Phone number column (varchar 20).
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XPhone } from 'xnest-kit/typeorm';
 *
 * @XPhone({ nullable: true })
 * phone: string;
 * ```
 */
export function XPhone(options?: ColumnOptions): PropertyDecorator {
  return Column('varchar', {
    length: 20,
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * URL column (varchar 2048).
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XUrl } from 'xnest-kit/typeorm';
 *
 * @XUrl()
 * website: string;
 * ```
 */
export function XUrl(options?: ColumnOptions): PropertyDecorator {
  return Column('varchar', {
    length: 2048,
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * IP address column (varchar 45).
 * Supports both IPv4 and IPv6.
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XIp } from 'xnest-kit/typeorm';
 *
 * @XIp({ nullable: true })
 * ipAddress: string;
 * ```
 */
export function XIp(options?: ColumnOptions): PropertyDecorator {
  return Column('varchar', {
    length: 45,
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * JSONB column (Postgres) or JSON (MySQL/SQLite).
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XJson } from 'xnest-kit/typeorm';
 *
 * @XJson()
 * metadata: Record<string, unknown>;
 * ```
 */
export function XJson(options?: ColumnOptions): PropertyDecorator {
  return Column('jsonb', {
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * Money/decimal column.
 *
 * @param precision - Total digits. @default 10
 * @param scale - Digits after decimal. @default 2
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XMoney } from 'xnest-kit/typeorm';
 *
 * @XMoney()
 * price: number;
 *
 * @XMoney(12, 4)
 * preciseAmount: number;
 * ```
 */
export function XMoney(
  precision = 10,
  scale = 2,
  options?: ColumnOptions,
): PropertyDecorator {
  return Column('decimal', {
    precision,
    scale,
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * Boolean column.
 *
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XBoolean } from 'xnest-kit/typeorm';
 *
 * @XBoolean()
 * isActive: boolean;
 *
 * @XBoolean({ default: 'true' })
 * isVisible: boolean;
 * ```
 */
export function XBoolean(options?: ColumnOptions): PropertyDecorator {
  return Column('boolean', {
    nullable: options?.nullable,
    default: options?.default,
  });
}

/**
 * Enum column.
 *
 * @param enumValues - Array of valid enum values
 * @param options - Column options (nullable, default)
 *
 * @example
 * ```typescript
 * import { XEnum } from 'xnest-kit/typeorm';
 *
 * enum Role { ADMIN = 'admin', USER = 'user', GUEST = 'guest' }
 *
 * @XEnum(Role)
 * role: Role;
 * ```
 */
export function XEnum(
  enumValues: readonly string[],
  options?: ColumnOptions,
): PropertyDecorator {
  return Column('enum', {
    enum: enumValues,
    nullable: options?.nullable,
    default: options?.default,
  });
}
