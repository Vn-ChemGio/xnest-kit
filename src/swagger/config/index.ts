import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type {
  SwaggerOptions,
  SecuritySchemePreset,
  DefaultResponses,
} from '../types';
import { isPackageInstalled } from '../../utils';

/** Default doc path when `options.path` is omitted. */
const DEFAULT_PATH = 'api/docs';

/**
 * Stored default responses from `configSwagger`.
 * Used by `ApiResponses` to merge defaults into individual endpoints.
 */
let storedDefaultResponses: DefaultResponses | undefined;

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
 * Pre-built OpenAPI response schemas for common NestJS error statuses.
 * Used when `defaultResponses: { 500: true }` — no manual schema needed.
 *
 * Format follows OpenAPI 3.0: schema inside `content.application/json`.
 */
function buildNestErrorResponse(
  status: number,
  message: string,
): { description: string; content: Record<string, unknown> } {
  return {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: status },
            message: { type: 'string', example: message },
            error: { type: 'string', example: message },
          },
        },
      },
    },
  };
}

/**
 * HTTP status text for codes not in the standard set.
 * Used as fallback when `true` is passed for an unknown status.
 */
const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

/**
 * Get default description for any HTTP status code.
 */
function getDefaultMessage(status: number): string {
  return HTTP_STATUS_TEXT[status] ?? `Error ${status}`;
}

/**
 * Build a default error response for any status code.
 */
function buildDefaultError(status: number): {
  description: string;
  content: Record<string, unknown>;
} {
  const message = getDefaultMessage(status);
  return buildNestErrorResponse(status, message);
}

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
export function getDefaultResponses(): DefaultResponses | undefined {
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
  defaults: DefaultResponses,
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

      Object.entries(defaults).forEach(([key, value]) => {
        if (key === 'auto401') return;
        const status = Number(key);
        const existing = operation.responses[String(status)];
        const hasBody =
          existing && (existing.schema || existing.content || existing.type);
        if (hasBody) return;

        const fallback = value === true ? buildDefaultError(status) : undefined;
        const resolved =
          value === true
            ? (fallback ?? { description: '' })
            : { ...(value as Record<string, unknown>) };

        operation.responses[String(status)] = {
          ...(existing ?? {}),
          ...resolved,
          description: existing?.description ?? resolved.description ?? '',
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
