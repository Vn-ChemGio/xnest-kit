/**
 * Hide a property from the generated Swagger/OpenAPI documentation.
 *
 * When using the NestJS Swagger plugin, this decorator marks the property
 * to be excluded from the generated API spec.
 *
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * import { ApiHideProperty } from 'xnest-kit/swagger';
 *
 * class User {
 *   @ApiProperty({ format: 'uuid' })
 *   id: string;
 *
 *   @ApiHideProperty()
 *   password: string;
 * }
 * ```
 */
export function ApiHideProperty(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata('swagger:hide', true, target, propertyKey);
  };
}
