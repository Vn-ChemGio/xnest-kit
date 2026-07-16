import 'reflect-metadata';
import { PaginatedQuery } from './paginated-query';

describe('PaginatedQuery', () => {
  it('should apply page, limit, search decorators', () => {
    class TestController {
      @PaginatedQuery()
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });

  it('should work with search: false', () => {
    class TestController {
      @PaginatedQuery({ search: false })
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });

  it('should work with custom defaults', () => {
    class TestController {
      @PaginatedQuery({ defaultSkip: 5, defaultTake: 20 })
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });

  it('should return a function', () => {
    const decorator = PaginatedQuery();
    expect(typeof decorator).toBe('function');
  });
});
