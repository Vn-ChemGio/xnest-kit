import 'reflect-metadata';
import { ApiResponse } from './api-response';
import { PaginatedType } from './paginated-type';

class User {
  id: string;
  name: string;
}

class Product {
  id: string;
  title: string;
  price: number;
}

describe('PaginatedType', () => {
  it('should create class with correct name', () => {
    const PaginatedUser = PaginatedType(User);
    expect(PaginatedUser.name).toBe('PaginatedUser');
  });

  it('should create instance with data, total, page, limit', () => {
    const PaginatedUser = PaginatedType(User);
    const instance = new PaginatedUser();

    expect('data' in instance).toBe(true);
    expect('total' in instance).toBe(true);
    expect('page' in instance).toBe(true);
    expect('limit' in instance).toBe(true);
  });

  it('should work with different entity types', () => {
    const PaginatedProduct = PaginatedType(Product);
    expect(PaginatedProduct.name).toBe('PaginatedProduct');

    const instance = new PaginatedProduct();
    expect('data' in instance).toBe(true);
  });

  it('should return different classes for different entities', () => {
    const PaginatedUser = PaginatedType(User);
    const PaginatedProduct = PaginatedType(Product);
    expect(PaginatedUser).not.toBe(PaginatedProduct);
  });

  it('should work with ApiResponse decorator', () => {
    class TestController {
      @ApiResponse({ type: PaginatedType(User) })
      findAll() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.findAll).toBeDefined();
  });
});
