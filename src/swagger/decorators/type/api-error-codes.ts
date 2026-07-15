import { ApiResponse } from '@nestjs/swagger';
import { buildDefaultError } from '../../shared';

/**
 * Apply default error responses to all methods in a controller.
 *
 * @param statusCodes - Array of HTTP status codes to apply
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * import { ApiErrorCodes } from 'xnest-kit/swagger';
 *
 * @ApiErrorCodes([409, 500])
 * @Controller('users')
 * export class UsersController {}
 * ```
 */
export function ApiErrorCodes(statusCodes: number[]): ClassDecorator {
  return (target) => {
    statusCodes.forEach((status) => {
      const { description, content } = buildDefaultError(status);
      ApiResponse({ status, description, content })(
        target as never,
        '',
        undefined,
      );
    });
  };
}
