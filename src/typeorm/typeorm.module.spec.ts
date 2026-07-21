jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn(() => ({ module: 'NestTypeOrmMock' })),
  },
}));

import { TypeOrmModule } from './typeorm.module';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockForRoot = jest.mocked(NestTypeOrmModule.forRoot);

describe('TypeOrmModule', () => {
  beforeEach(() => {
    mockForRoot.mockClear();
  });

  it('should be defined', () => {
    expect(TypeOrmModule).toBeDefined();
  });

  describe('forRoot', () => {
    it('should return a dynamic module', () => {
      const result = TypeOrmModule.forRoot({ type: 'postgres' });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('module');
    });

    it('should call NestTypeOrmModule.forRoot with configTypeOrm result', () => {
      TypeOrmModule.forRoot({ type: 'postgres', host: 'localhost' });
      expect(mockForRoot).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'postgres', host: 'localhost' }),
      );
    });

    it('should work with no options', () => {
      TypeOrmModule.forRoot();
      expect(mockForRoot).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should resolve DATABASE_URL from env', () => {
      process.env['DATABASE_URL'] = 'postgres://localhost:5432/test';
      TypeOrmModule.forRoot();
      expect(mockForRoot).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'postgres://localhost:5432/test' }),
      );
      delete process.env['DATABASE_URL'];
    });
  });
});
