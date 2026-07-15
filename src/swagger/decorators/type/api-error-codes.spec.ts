import 'reflect-metadata';
import { ApiErrorCodes } from './api-error-codes';

const RESPONSE_KEY = 'swagger/apiResponse';

describe('ApiErrorCodes', () => {
  it('should apply error responses to controller class', () => {
    @ApiErrorCodes([409, 500])
    class TestController {
      create() {}
      update() {}
    }

    const meta: unknown = Reflect.getMetadata(RESPONSE_KEY, TestController);
    expect(meta).toBeDefined();
  });

  it('should work with empty array', () => {
    @ApiErrorCodes([])
    class TestController {
      find() {}
    }

    const meta: unknown = Reflect.getMetadata(RESPONSE_KEY, TestController);
    expect(meta).toBeUndefined();
  });

  it('should work with single status code', () => {
    @ApiErrorCodes([500])
    class TestController {
      find() {}
    }

    const meta: unknown = Reflect.getMetadata(RESPONSE_KEY, TestController);
    expect(meta).toBeDefined();
  });
});
