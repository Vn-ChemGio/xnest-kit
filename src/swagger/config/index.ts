import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SwaggerOptions, SecuritySchemePreset } from '../types';
import { isPackageInstalled } from '../../utils';
import { buildDefaultError } from '../shared';

/** Default doc path when `options.path` is omitted. */
const DEFAULT_PATH = 'api/docs';

/**
 * Stored default responses from `configSwagger`.
 * Used by `ApiResponses` to merge defaults into individual endpoints.
 */
let storedDefaultResponses: number[] | undefined;

/**
 * HTTP methods that can have operations in an OpenAPI path item.
 */
const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
] as const;

/**
 * Well-known security scheme presets.
 *
 * Each preset provides sensible default `SecuritySchemeObject` fields
 * that can be overridden via `options`.
 *
 * - `'bearer'` — `{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }`
 * - `'basic'` — `{ type: 'http', scheme: 'basic' }`
 * - `'oauth2'` — `{ type: 'oauth2', flows: {} }`
 * - `'apikey'` — `{ type: 'apiKey', in: 'header' }`
 * - `'cookie'` — `{ type: 'apiKey', in: 'cookie' }`
 */
const PRESETS: Record<SecuritySchemePreset, SecuritySchemeObject> = {
  bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  basic: { type: 'http', scheme: 'basic' },
  oauth2: { type: 'oauth2', flows: {} },
  apikey: { type: 'apiKey', in: 'header' },
  cookie: { type: 'apiKey', in: 'cookie' },
};

/**
 * Normalize doc path: strip leading `/` to prevent double-slash issues.
 */
function normalizePath(p: string | undefined): string {
  return (p || DEFAULT_PATH).replace(/^\//, '');
}

/**
 * Get the stored default responses from `configSwagger`.
 * Used by `ApiResponses` to merge defaults into individual endpoints.
 *
 * @internal
 */
export function getDefaultResponses(): number[] | undefined {
  return storedDefaultResponses;
}

/**
 * Configure Swagger documentation for a NestJS application.
 *
 * Creates the OpenAPI document via `DocumentBuilder` and serves it:
 * - If `@scalar/nestjs-api-reference` is installed → Scalar API Reference
 * - Otherwise → Swagger UI
 *
 * @param app - NestJS application instance
 * @param options - Configuration options
 * @returns The generated OpenAPI document object
 *
 * @example
 * ```typescript
 * import { NestFactory } from '@nestjs/core';
 * import { configSwagger } from 'xnest-kit/swagger';
 * import { AppModule } from './app.module';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   configSwagger(app, {
 *     title: 'My API',
 *     version: '1.0.0',
 *     path: 'api/docs',
 *   });
 *   await app.listen(3000);
 * }
 * bootstrap();
 * ```
 */
export function configSwagger(
  app: INestApplication,
  options: SwaggerOptions = {},
): OpenAPIObject {
  const { title = 'API', description = '', version = '1.0.0' } = options;

  storedDefaultResponses = options.defaultResponses;

  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version);

  options.tags?.forEach((t) => builder.addTag(t.name, t.description));
  options.servers?.forEach((s) => builder.addServer(s.url, s.description));

  options.securities?.forEach((sec) => {
    const scheme = sec.preset
      ? { ...PRESETS[sec.preset], ...sec.options }
      : sec.options;
    builder.addSecurity(sec.name, scheme as SecuritySchemeObject);
  });

  const document = SwaggerModule.createDocument(app, builder.build());

  if (options.defaultResponses) {
    applyDefaultResponses(document, options.defaultResponses);
  }

  const path = normalizePath(options.path);

  if (isPackageInstalled('@scalar/nestjs-api-reference')) {
    serveScalar(app, document, path);
  } else {
    SwaggerModule.setup(path, app, document);
  }

  return document;
}

/**
 * Apply default responses to all operations in the OpenAPI document.
 */
function applyDefaultResponses(
  document: OpenAPIObject,
  statusCodes: number[],
): void {
  if (!document.paths) return;

  Object.values(document.paths).forEach((pathItem) => {
    if (!pathItem || typeof pathItem !== 'object') return;

    HTTP_METHODS.forEach((method) => {
      const operation = (pathItem as Record<string, unknown>)[method] as
        | {
            responses?: Record<string, Record<string, unknown>>;
          }
        | undefined;
      if (!operation || typeof operation !== 'object') return;

      if (!operation.responses) {
        operation.responses = {};
      }

      statusCodes.forEach((status) => {
        const key = String(status);
        const existing = operation.responses[key];
        const hasBody =
          existing && (existing.schema || existing.content || existing.type);
        if (hasBody) return;

        const generated = buildDefaultError(status);
        operation.responses[key] = {
          ...(existing ?? {}),
          ...generated,
          description: existing?.description ?? generated.description ?? '',
        };
      });
    });
  });
}

/**
 * Serve Scalar API Reference.
 */
function serveScalar(
  app: INestApplication,
  document: OpenAPIObject,
  path: string,
): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { apiReference } = require('@scalar/nestjs-api-reference') as {
    apiReference: (config: { content: OpenAPIObject }) => any;
  };
  app.use(`/${path}`, apiReference({ content: document }));
}
