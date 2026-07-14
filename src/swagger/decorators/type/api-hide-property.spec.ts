import 'reflect-metadata';
import { ApiHideProperty } from './api-hide-property';

describe('ApiHideProperty', () => {
  it('should set swagger:hide metadata on the property', () => {
    class TestUser {
      @ApiHideProperty()
      password!: string;
    }

    const hidden = Reflect.getMetadata(
      'swagger:hide',
      TestUser.prototype,
      'password',
    ) as boolean;
    expect(hidden).toBe(true);
  });

  it('should not affect other properties', () => {
    class TestUser {
      @ApiHideProperty()
      password!: string;

      email!: string;
    }

    const hidden = Reflect.getMetadata(
      'swagger:hide',
      TestUser.prototype,
      'email',
    ) as boolean | undefined;
    expect(hidden).toBeUndefined();
  });

  it('should return a function', () => {
    const deco = ApiHideProperty();
    expect(typeof deco).toBe('function');
  });
});
