/**
 * @module xnest-kit/openapi
 * @description OpenAPI / Swagger utilities for NestJS.
 * Provides quick configuration for Swagger and Scalar API documentation,
 * along with simplified decorators for API examples and parameter attributes.
 *
 * @example
 * ```typescript
 * import { configOpenApi } from 'xnest-kit/openapi';
 *
 * const app = await NestFactory.create(AppModule);
 * configOpenApi(app, { title: 'My API', version: '1.0.0' });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: OpenAPI module.
 * @description Will provide Swagger/Scalar configuration and decorators.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class OpenApiModule {
  constructor() {
    throw new Error(
      '[xnest-kit/openapi] OpenApiModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure OpenAPI (Swagger/Scalar) for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Configuration options for OpenAPI.
 * @throws {Error} Not yet implemented.
 */
export function configOpenApi(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/openapi] configOpenApi() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Swagger decorator for creating API examples.
 * @param _examples - Example values to attach to the API documentation.
 * @throws {Error} Not yet implemented.
 */
export function ApiExample(
  _examples?: Record<string, unknown>,
): PropertyDecorator & MethodDecorator {
  throw new Error(
    '[xnest-kit/openapi] ApiExample decorator is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Swagger decorator for simplifying API parameter configuration.
 * @param _paramName - The name of the parameter.
 * @param _options - Additional parameter options.
 * @throws {Error} Not yet implemented.
 */
export function ApiParamConfig(
  _paramName?: string,
  _options?: Record<string, unknown>,
): ParameterDecorator {
  throw new Error(
    '[xnest-kit/openapi] ApiParamConfig decorator is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
