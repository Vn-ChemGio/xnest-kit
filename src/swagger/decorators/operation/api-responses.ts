import { ApiResponse } from '@nestjs/swagger';
import type { ApiResponseOptions } from '@nestjs/swagger';
import { getDefaultResponses } from '../../config';

/**
 * Options for the `ApiResponses` decorator.
 */
export interface ApiResponsesOptions {
  /**
   * Bypass default responses from `configSwagger`.
   * When `true`, only the provided responses are applied.
   */
  bypassDefaults?: boolean;
}

/**
 * Apply multiple `@ApiResponse` decorators in a single call.
 *
 * Merges with default responses from `configSwagger` unless `bypassDefaults` is set.
 * If `auto401` is enabled in defaults, automatically adds a 401 response
 * unless the method has `@Public()` decorator or is marked with `bypassDefaults`.
 *
 * @param responses - Array of `ApiResponseOptions` to apply
 * @param options - Optional configuration
 * @returns Combined method/class decorator
 *
 * @example
 * ```typescript
 * import { ApiResponses } from 'xnest-kit/swagger';
 *
 * @ApiResponses([
 *   { status: 201, description: 'Created' },
 *   { status: 400, description: 'Bad request' },
 * ])
 * createUser() {}
 *
 * @ApiResponses([], { bypassDefaults: true })
 * healthCheck() {}
 * ```
 */
export function ApiResponses(
  responses: ApiResponseOptions[],
  options?: ApiResponsesOptions,
): MethodDecorator & ClassDecorator {
  const merged: ApiResponseOptions[] = [];

  if (!options?.bypassDefaults) {
    const defaults = getDefaultResponses();
    if (defaults) {
      Object.entries(defaults).forEach(([key, value]) => {
        if (key === 'auto401') return;
        const status = Number(key);
        merged.push({ status, ...(value as ApiResponseOptions) });
      });

      if (defaults.auto401) {
        merged.push({ status: 401, description: 'Unauthorized' });
      }
    }
  }

  responses.forEach((r) => merged.push(r));

  return (...args: any[]) => {
    const target = args[0] as object;
    const propertyKey = args[1] as string | symbol | undefined;
    const descriptor = args[2] as PropertyDescriptor | undefined;

    let toApply = merged;
    if (
      propertyKey &&
      getDefaultResponses()?.auto401 &&
      !options?.bypassDefaults
    ) {
      const hasPublic = Reflect.hasMetadata('public', target, propertyKey);
      if (hasPublic) {
        toApply = merged.filter((r) => r.status !== 401);
      }
    }

    toApply.forEach((r) => {
      const deco = ApiResponse(r, { overrideExisting: true });
      deco(target, propertyKey, descriptor);
    });
  };
}
