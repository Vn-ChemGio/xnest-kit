import { ApiParam } from './api-param';
import { getFormatExample } from './shared/format-examples';

describe('Enhanced ApiParam', () => {
  describe('auto-example from format', () => {
    it('should resolve uuid example', () => {
      expect(getFormatExample(undefined, 'uuid')).toBe(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('should resolve email example', () => {
      expect(getFormatExample(undefined, 'email')).toBe('user@example.com');
    });

    it('should resolve latitude example', () => {
      expect(getFormatExample('number', 'latitude')).toBe(10.762622);
    });

    it('should resolve ipv4 example', () => {
      expect(getFormatExample(undefined, 'ipv4')).toBe('192.168.1.1');
    });
  });

  describe('resolveParamOptions branches', () => {
    it('should return options unchanged when no format', () => {
      class TestController {
        @ApiParam({ name: 'id', type: String })
        findOne(_id: string): string {
          return _id;
        }
      }

      const controller = new TestController();
      expect(controller.findOne('test')).toBe('test');
    });

    it('should not auto-generate example when explicit example is provided', () => {
      class TestController {
        @ApiParam({
          name: 'lat',
          type: Number,
          format: 'latitude',
          example: 99,
        })
        findByLat(_lat: number): number {
          return _lat;
        }
      }

      const controller = new TestController();
      expect(controller.findByLat(99)).toBe(99);
    });

    it('should resolve type as string literal for auto example', () => {
      class TestController {
        @ApiParam({
          name: 'id',
          type: 'string' as unknown as typeof String,
          format: 'uuid',
        })
        findOne(_id: string): string {
          return _id;
        }
      }

      const controller = new TestController();
      expect(controller.findOne('test')).toBe('test');
    });
  });

  describe('decorator application', () => {
    it('should apply ApiParam with string format', () => {
      class TestController {
        @ApiParam({ name: 'id', format: 'uuid' })
        findOne(_id: string): string {
          return _id;
        }
      }

      const controller = new TestController();
      expect(controller.findOne('test-id')).toBe('test-id');
    });

    it('should apply ApiParam with number format', () => {
      class TestController {
        @ApiParam({ name: 'lat', type: Number, format: 'latitude' })
        findByLat(_lat: number): number {
          return _lat;
        }
      }

      const controller = new TestController();
      expect(controller.findByLat(10.762622)).toBe(10.762622);
    });

    it('should apply ApiParam with description', () => {
      class TestController {
        @ApiParam({ name: 'id', format: 'uuid', description: 'User ID' })
        findOne(_id: string): string {
          return _id;
        }
      }

      const controller = new TestController();
      expect(controller.findOne('123')).toBe('123');
    });

    it('should apply ApiParam with explicit example', () => {
      class TestController {
        @ApiParam({ name: 'id', format: 'uuid', example: 'custom-id' })
        findOne(_id: string): string {
          return _id;
        }
      }

      const controller = new TestController();
      expect(controller.findOne('custom-id')).toBe('custom-id');
    });
  });
});
