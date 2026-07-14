import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SwaggerOptions, SecuritySchemePreset } from '../types';
import { isPackageInstalled } from '../../utils';

/** Default doc path when `options.path` is omitted. */
const DEFAULT_PATH = 'api/docs';

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
  const path = normalizePath(options.path);

  if (isPackageInstalled('@scalar/nestjs-api-reference')) {
    serveScalar(app, document, path);
  } else {
    SwaggerModule.setup(path, app, document);
  }

  return document;
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
