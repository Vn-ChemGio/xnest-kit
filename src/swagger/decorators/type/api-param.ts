import { ApiParam as NestApiParam } from '@nestjs/swagger';
import type { ApiParamOptions } from '@nestjs/swagger';
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
type StringFormatParamProps = ApiParamOptions & {
  type?: typeof String;
  format: StringFormat;
};

/**
 * Options when using a NumberFormat.
 * `type` is required and must be `Number`.
 */
type NumberFormatParamProps = ApiParamOptions & {
  type: typeof Number;
  format: NumberFormat;
};

/**
 * Options when using a BooleanFormat.
 * `type` is required and must be `Boolean`.
 */
type BooleanFormatParamProps = ApiParamOptions & {
  type: typeof Boolean;
  format: BooleanFormat;
};

/**
 * Options when no format is specified (any type allowed).
 */
type NoFormatParamProps = ApiParamOptions & {
  type?: string | ((...args: unknown[]) => unknown);
  format?: string;
};

/**
 * Resolve example from format when not explicitly provided.
 */
function resolveParamOptions(
  options: ApiParamOptions & { type?: unknown; format?: string },
): ApiParamOptions {
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
 * Enhanced ApiParam decorator.
 *
 * Wraps `@nestjs/swagger` `ApiParam` with:
 * - Auto-example generation based on `type` + `format`
 * - **Compile-time type checking** between `type` and `format`
 *
 * **Type rules:**
 * - `StringFormat` (uuid, email, ...) → `type?: String` (or omitted)
 * - `NumberFormat` (latitude, float, ...) → `type: Number` (required)
 * - `BooleanFormat` (boolean) → `type: Boolean` (required)
 * - No format → any type allowed
 *
 * Path params default to `required: false` (set `required: true` if needed).
 *
 * @param options - Param options with type-safe format
 * @returns MethodDecorator & ClassDecorator
 *
 * @example
 * ```typescript
 * import { ApiParam } from 'xnest-kit/swagger';
 *
 * @ApiParam({ name: 'id', format: 'uuid' })
 * findOne(id: string) {}
 *
 * @ApiParam({ name: 'lat', type: Number, format: 'latitude' })
 * findByLat(lat: number) {}
 * ```
 */
export function ApiParam(
  options: StringFormatParamProps,
): MethodDecorator & ClassDecorator;
export function ApiParam(
  options: NumberFormatParamProps,
): MethodDecorator & ClassDecorator;
export function ApiParam(
  options: BooleanFormatParamProps,
): MethodDecorator & ClassDecorator;
export function ApiParam(
  options: NoFormatParamProps,
): MethodDecorator & ClassDecorator;
export function ApiParam(
  options:
    | StringFormatParamProps
    | NumberFormatParamProps
    | BooleanFormatParamProps
    | NoFormatParamProps,
): MethodDecorator & ClassDecorator {
  return NestApiParam(
    resolveParamOptions({ ...options, required: options.required ?? false }),
  );
}
