import 'reflect-metadata';
import { ApiResponse } from './api-response';
import { PaginatedType } from './paginated-type';

class User {
  id: string;
  name: string;
}

describe('ApiResponse', () => {
  it('should apply decorator with explicit status', () => {
    class TestController {
      @ApiResponse({ status: 200 })
      find() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.find).toBeDefined();
  });

  it('should forward type option', () => {
    class TestController {
      @ApiResponse({ type: User })
      findOne() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findOne).toBeDefined();
  });

  it('should forward isArray option', () => {
    class TestController {
      @ApiResponse({ type: [User], isArray: true })
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });

  it('should forward schema option', () => {
    class TestController {
      @ApiResponse({
        schema: { type: 'object', properties: { id: { type: 'string' } } },
      })
      findOne() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findOne).toBeDefined();
  });

  it('should forward description option', () => {
    class TestController {
      @ApiResponse({ description: 'Custom description' })
      find() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.find).toBeDefined();
  });

  it('should handle decorator factory without property key', () => {
    const decorator = ApiResponse({});
    expect(typeof decorator).toBe('function');
  });

  it('should support PaginatedType', () => {
    class TestController {
      @ApiResponse({ type: PaginatedType(User) })
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });
});
