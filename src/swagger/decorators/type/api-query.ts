import { ApiQuery as NestApiQuery } from '@nestjs/swagger';
import type { ApiQueryOptions } from '@nestjs/swagger';
import { getFormatExample } from './shared/format-examples';
import type {
  StringFormat,
  NumberFormat,
  BooleanFormat,
} from './shared/format-types';

// ─── Typed options for overloads ─────────────────────────────────

/**
 * Options when using a StringFormat.
 * `type` defaults to `String`; if provided, must be `String`.
 */
type StringFormatQueryProps = ApiQueryOptions & {
  type?: typeof String;
  format: StringFormat;
};

/**
 * Options when using a NumberFormat.
 * `type` is required and must be `Number`.
 */
type NumberFormatQueryProps = ApiQueryOptions & {
  type: typeof Number;
  format: NumberFormat;
};

/**
 * Options when using a BooleanFormat.
 * `type` is required and must be `Boolean`.
 */
type BooleanFormatQueryProps = ApiQueryOptions & {
  type: typeof Boolean;
  format: BooleanFormat;
};

/**
 * Options when no format is specified (any type allowed).
 */
type NoFormatQueryProps = ApiQueryOptions & {
  type?: string | ((...args: unknown[]) => unknown);
  format?: string;
};

/**
 * Resolve example from format when not explicitly provided.
 */
function resolveQueryOptions(
  options: ApiQueryOptions & { type?: unknown; format?: string },
): ApiQueryOptions {
  if (!options.format) return options;
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
  };
}

// ─── Public API with overloads ───────────────────────────────────

/**
 * Enhanced ApiQuery decorator.
 *
 * Wraps `@nestjs/swagger` `ApiQuery` with:
 * - Auto-example generation based on `type` + `format`
 * - **Compile-time type checking** between `type` and `format`
 *
 * **Type rules:**
 * - `StringFormat` (uuid, email, ...) → `type?: String` (or omitted)
 * - `NumberFormat` (latitude, float, ...) → `type: Number` (required)
 * - `BooleanFormat` (boolean) → `type: Boolean` (required)
 * - No format → any type allowed
 *
 * Query params default to `required: false`.
 *
 * @param options - Query options with type-safe format
 * @returns MethodDecorator & ClassDecorator
 *
 * @example
 * ```typescript
 * import { ApiQuery } from 'xnest-kit/swagger';
 *
 * @ApiQuery({ name: 'email', format: 'email' })
 * findByEmail(email: string) {}
 *
 * @ApiQuery({ name: 'page', type: Number, format: 'int32' })
 * findAll(page: number) {}
 *
 * @ApiQuery({ name: 'ids', type: Number, format: 'int32', isArray: true })
 * findByIds(ids: number[]) {}
 * ```
 */
export function ApiQuery(
  options: StringFormatQueryProps,
): MethodDecorator & ClassDecorator;
export function ApiQuery(
  options: NumberFormatQueryProps,
): MethodDecorator & ClassDecorator;
export function ApiQuery(
  options: BooleanFormatQueryProps,
): MethodDecorator & ClassDecorator;
export function ApiQuery(
  options: NoFormatQueryProps,
): MethodDecorator & ClassDecorator;
export function ApiQuery(
  options:
    | StringFormatQueryProps
    | NumberFormatQueryProps
    | BooleanFormatQueryProps
    | NoFormatQueryProps,
): MethodDecorator & ClassDecorator {
  return NestApiQuery(
    resolveQueryOptions({ ...options, required: options.required ?? false }),
  );
}
