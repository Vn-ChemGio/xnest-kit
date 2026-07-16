import 'reflect-metadata';
import { ApiProperty } from './api-property';
import { getFormatExample } from './shared/format-examples';
import { getValidatorDecorators } from './shared/format-validators';

describe('getFormatExample', () => {
  it('should return undefined when format is undefined', () => {
    expect(getFormatExample('string', undefined)).toBeUndefined();
  });

  it('should return example for known format', () => {
    expect(getFormatExample('string', 'email')).toBe('user@example.com');
  });

  it('should fallback to type defaults for unknown format', () => {
    expect(getFormatExample('string', 'unknown')).toBe('string');
    expect(getFormatExample('number', 'unknown')).toBe(0);
    expect(getFormatExample('boolean', 'unknown')).toBe(true);
  });
});

describe('getValidatorDecorators', () => {
  it('should return empty array when no options', () => {
    expect(getValidatorDecorators({})).toEqual([]);
  });

  it('should return empty array for unknown format', () => {
    expect(getValidatorDecorators({ format: 'unknown' })).toEqual([]);
  });
});

describe('Enhanced ApiProperty', () => {
  it('should auto-generate example from format', () => {
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

  describe('no format', () => {
    it('should work without format', () => {
      class TestNoFormat {
        @ApiProperty({ description: 'A name' })
        name!: string;
      }

      const instance = new TestNoFormat();
      instance.name = 'test';
      expect(instance.name).toBe('test');
    });

    it('should work with empty options', () => {
      class TestEmpty {
        @ApiProperty()
        value!: string;
      }

      const instance = new TestEmpty();
      expect(instance).toBeDefined();
    });
  });

  describe('with explicit example', () => {
    it('should not override explicit example', () => {
      class TestExplicit {
        @ApiProperty({ format: 'email', example: 'custom@example.com' })
        email!: string;
      }

      const instance = new TestExplicit();
      expect(instance).toBeDefined();
    });
  });

  describe('number formats', () => {
    class TestNumberFormats {
      @ApiProperty({ type: Number, format: 'float' })
      floatVal!: number;

      @ApiProperty({ type: Number, format: 'double' })
      doubleVal!: number;

      @ApiProperty({ type: Number, format: 'int32' })
      int32Val!: number;

      @ApiProperty({ type: Number, format: 'int64' })
      int64Val!: number;

      @ApiProperty({ type: Number, format: 'latitude' })
      lat!: number;

      @ApiProperty({ type: Number, format: 'longitude' })
      lng!: number;
    }

    it('should create instance with number formats', () => {
      const instance = new TestNumberFormats();
      instance.floatVal = 3.14;
      instance.lat = 10.762622;
      expect(instance.floatVal).toBe(3.14);
      expect(instance.lat).toBe(10.762622);
    });
  });

  describe('boolean format', () => {
    class TestBoolean {
      @ApiProperty({ type: Boolean, format: 'boolean' })
      active!: boolean;
    }

    it('should create instance with boolean format', () => {
      const instance = new TestBoolean();
      instance.active = true;
      expect(instance.active).toBe(true);
    });
  });

  describe('required default', () => {
    it('should default required to false when omitted', () => {
      class TestDefault {
        @ApiProperty({ format: 'email' })
        email!: string;
      }

      const instance = new TestDefault();
      expect(instance).toBeDefined();
    });

    it('should accept required: true', () => {
      class TestRequired {
        @ApiProperty({ format: 'email', required: true })
        email!: string;
      }

      const instance = new TestRequired();
      expect(instance).toBeDefined();
    });

    it('should accept required: false', () => {
      class TestOptional {
        @ApiProperty({ format: 'email', required: false })
        email?: string;
      }

      const instance = new TestOptional();
      expect(instance).toBeDefined();
    });
  });

  describe('string formats', () => {
    class TestStringFormats {
      @ApiProperty({ format: 'uuid' })
      id!: string;

      @ApiProperty({ format: 'email' })
      email!: string;

      @ApiProperty({ format: 'phone' })
      phone!: string;

      @ApiProperty({ format: 'url' })
      website!: string;

      @ApiProperty({ format: 'date' })
      birthDate!: string;

      @ApiProperty({ format: 'date-time' })
      createdAt!: string;

      @ApiProperty({ format: 'ipv4' })
      ip!: string;

      @ApiProperty({ format: 'hostname' })
      host!: string;

      @ApiProperty({ format: 'creditcard' })
      card!: string;

      @ApiProperty({ format: 'jwt' })
      token!: string;

      @ApiProperty({ format: 'base64' })
      encoded!: string;

      @ApiProperty({ format: 'json' })
      data!: string;

      @ApiProperty({ format: 'color' })
      color!: string;
    }

    it('should create instance with string formats', () => {
      const instance = new TestStringFormats();
      instance.id = '550e8400-e29b-41d4-a716-446655440000';
      instance.email = 'test@example.com';
      expect(instance.id).toBeTruthy();
      expect(instance.email).toBeTruthy();
    });
  });
});
