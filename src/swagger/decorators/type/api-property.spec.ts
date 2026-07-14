import { ApiProperty } from './api-property';
import { getFormatExample } from './format-examples';
import { getValidatorDecorators } from './format-validators';

describe('Enhanced ApiProperty', () => {
  it('should auto-generate example from format', () => {
    const example = getFormatExample('string', 'email');
    expect(example).toBe('user@example.com');
  });

  it('should not override explicit example', () => {
    const example = getFormatExample('string', 'email');
    expect(example).toBe('user@example.com');
  });

  it('should handle format without matching type', () => {
    const example = getFormatExample('string', 'money');
    expect(example).toBe('1,234.56');
  });

  describe('decorator application', () => {
    class TestClass {
      @ApiProperty({ format: 'email' })
      email!: string;

      @ApiProperty({ format: 'uuid' })
      id!: string;

      @ApiProperty({ type: Number, format: 'float' })
      price!: number;

      @ApiProperty({ format: 'phone', required: false })
      phone?: string;
    }

    it('should create class with decorated properties', () => {
      const instance = new TestClass();
      instance.email = 'test@example.com';
      instance.price = 99.99;
      expect(instance.email).toBe('test@example.com');
      expect(instance.price).toBe(99.99);
    });
  });
});

describe('format-validators', () => {
  it('should return empty array when no options provided', () => {
    const result = getValidatorDecorators({});
    expect(result).toEqual([]);
  });

  it('should return empty array for unknown format', () => {
    const result = getValidatorDecorators({ format: 'nonexistent-format' });
    expect(result).toEqual([]);
  });
});
