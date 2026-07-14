import type {
  SecuritySchemeObject,
  ServerObject,
  TagObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import type { ApiResponseOptions } from '@nestjs/swagger';

export type SecuritySchemePreset =
  'bearer' | 'basic' | 'oauth2' | 'apikey' | 'cookie';

export interface SwaggerSecurity {
  /** Key of the security scheme in the OpenAPI spec. */
  name: string;
  /**
   * Optional preset that fills default `SecuritySchemeObject` fields.
   * Fields provided in `options` override the preset defaults.
   */
  preset?: SecuritySchemePreset;
  /**
   * `SecuritySchemeObject` fields.
   * When a `preset` is set, these are merged on top of the defaults.
   */
  options?: Partial<SecuritySchemeObject>;
}

/**
 * Default API responses applied to all endpoints unless bypassed.
 *
 * @example
 * ```typescript
 * configSwagger(app, {
 *   defaultResponses: {
 *     409: true, // auto-generates { statusCode: 409, message: "Conflict", error: "Conflict" }
 *     500: true, // auto-generates { statusCode: 500, message: "Internal Server Error", error: "Internal Server Error" }
 *     auto401: true, // auto-add 401 when no @Public() decorator
 *   },
 * });
 * ```
 */
export interface DefaultResponses {
  /** HTTP status code → `true` for auto-generated body, or full `ApiResponseOptions` */
  [status: number]: ApiResponseOptions | boolean;
  /** Auto-add 401 when route is not marked as @Public() */
  auto401?: boolean;
}

export interface SwaggerOptions {
  /** API title */
  title?: string;
  /** API description */
  description?: string;
  /** API version */
  version?: string;
  /**
   * Path to serve docs (default: 'api/docs').
   * Must NOT start with `/`.
   */
  path?: string;
  /** API tags for grouping endpoints */
  tags?: TagObject[];
  /** Server URLs */
  servers?: ServerObject[];
  /**
   * Security schemes for the OpenAPI spec.
   *
   * @example
   * ```typescript
   * securities: [
   *   { name: 'bearer', preset: 'bearer' },
   *   { name: 'apiKey', preset: 'apikey', options: { name: 'X-API-Key' } },
   *   { name: 'custom', options: { type: 'openIdConnect', openIdConnectUrl: '...' } },
   * ]
   * ```
   */
  securities?: SwaggerSecurity[];
  /**
   * Default responses applied to all endpoints.
   * Individual endpoints can bypass via `@ApiResponses([], { bypassDefaults: true })`.
   *
   * @example
   * ```typescript
   * configSwagger(app, {
   *   defaultResponses: {
   *     409: true,
   *     500: true,
   *     auto401: true,
   *   },
   * });
   * ```
   */
  defaultResponses?: DefaultResponses;
}
