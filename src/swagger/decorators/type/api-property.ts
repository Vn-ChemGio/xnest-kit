import { ApiProperty as NestApiProperty } from '@nestjs/swagger';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { getFormatExample } from './shared/format-examples';
import { getValidatorDecorators } from './shared/format-validators';
import type {
  StringFormat,
  NumberFormat,
  BooleanFormat,
} from './shared/format-types';

/**
 * Base options shared by all overloads.
 * Overrides `required` to only accept `boolean | undefined` (not `string[]`).
 */
type BaseProps = Omit<ApiPropertyOptions, 'type' | 'format' | 'required'> & {
  required?: boolean;
};

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
  if (!options.format) return options as ApiPropertyOptions;
  const autoExample =
    options.example === undefined
      ? getFormatExample(
          typeof options.type === 'string' ? options.type : undefined,
          options.format,
        )
      : undefined;
  return {
    ...options,
    ...(autoExample !== undefined ? { example: autoExample } : {}),
  } as ApiPropertyOptions;
}

/**
 * Create a combined decorator that applies both swagger and class-validator.
 */
function createEnhancedDecorator(
  options: { type?: unknown; format?: string; required?: boolean } & BaseProps,
): PropertyDecorator {
  const opts = { ...options, required: options.required ?? false };
  const swaggerOpts = resolveOptions(opts);
  const swaggerDeco = NestApiProperty(swaggerOpts);
  const validatorDecos = getValidatorDecorators({
    format: opts.format,
    required: opts.required,
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
 * Use `required: true` to mark the field as required in the API schema.
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
