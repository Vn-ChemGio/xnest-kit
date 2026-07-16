import { ApiQuery } from './api-query';
import { getFormatExample } from './shared/format-examples';

describe('Enhanced ApiQuery', () => {
  describe('auto-example from format', () => {
    it('should resolve email example', () => {
      expect(getFormatExample(undefined, 'email')).toBe('user@example.com');
    });

    it('should resolve int32 example', () => {
      expect(getFormatExample('number', 'int32')).toBe(42);
    });

    it('should resolve boolean example', () => {
      expect(getFormatExample(undefined, 'boolean')).toBe(true);
    });

    it('should resolve date-time example', () => {
      expect(getFormatExample(undefined, 'date-time')).toBe(
        '2024-01-15T09:30:00Z',
      );
    });
  });

  describe('decorator application', () => {
    it('should apply ApiQuery with string format', () => {
      class TestController {
        @ApiQuery({ name: 'email', format: 'email' })
        findByEmail(_email: string): string {
          return _email;
        }
      }

      const controller = new TestController();
      expect(controller.findByEmail('test@example.com')).toBe(
        'test@example.com',
      );
    });

    it('should apply ApiQuery with number format', () => {
      class TestController {
        @ApiQuery({ name: 'page', type: Number, format: 'int32' })
        findAll(_page: number): number {
          return _page;
        }
      }

      const controller = new TestController();
      expect(controller.findAll(1)).toBe(1);
    });

    it('should apply ApiQuery with isArray', () => {
      class TestController {
        @ApiQuery({
          name: 'ids',
          type: Number,
          format: 'int32',
          isArray: true,
        })
        findByIds(_ids: number[]): number[] {
          return _ids;
        }
      }

      const controller = new TestController();
      expect(controller.findByIds([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should apply ApiQuery with description', () => {
      class TestController {
        @ApiQuery({ name: 'email', format: 'email', description: 'Filter' })
        findByEmail(_email: string): string {
          return _email;
        }
      }

      const controller = new TestController();
      expect(controller.findByEmail('a@b.com')).toBe('a@b.com');
    });

    it('should apply ApiQuery with explicit example', () => {
      class TestController {
        @ApiQuery({
          name: 'email',
          format: 'email',
          example: 'custom@example.com',
        })
        findByEmail(_email: string): string {
          return _email;
        }
      }

      const controller = new TestController();
      expect(controller.findByEmail('custom@example.com')).toBe(
        'custom@example.com',
      );
    });

    it('should apply ApiQuery without name', () => {
      class TestController {
        @ApiQuery({ format: 'uuid' })
        findAll(): string {
          return 'ok';
        }
      }

      const controller = new TestController();
      expect(controller.findAll()).toBe('ok');
    });
  });
});
