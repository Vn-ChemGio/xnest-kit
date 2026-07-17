import { ApiResponse } from '@nestjs/swagger';
import type { ApiResponseOptions } from '@nestjs/swagger';
import { getDefaultResponses } from '../../config';

/**
 * Apply multiple `@ApiResponse` decorators in a single call.
 *
 * @param responses - Array of `ApiResponseOptions` to apply
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
 * ```
 */
export function ApiResponses(
  responses: ApiResponseOptions[],
): MethodDecorator & ClassDecorator {
  const merged: ApiResponseOptions[] = [];

  const defaults = getDefaultResponses();
  if (defaults) {
    defaults.forEach((status) => {
      merged.push({ status });
    });
  }

  responses.forEach((r) => merged.push(r));

  // TS can't unify ClassDecorator (1 arg) and MethodDecorator (3 args)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return ((
    ...args: [
      target: object,
      propertyKey?: string | symbol,
      descriptor?: TypedPropertyDescriptor<unknown>,
    ]
  ) => {
    merged.forEach((r) => {
      const deco = ApiResponse(r, { overrideExisting: true });
      deco(...args);
    });
  }) as MethodDecorator & ClassDecorator;
}
