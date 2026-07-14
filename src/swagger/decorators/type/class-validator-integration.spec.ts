import { ApiProperty } from './api-property';
import { validate } from 'class-validator';

describe('class-validator integration', () => {
  it('should apply @IsEmail() when format is email', async () => {
    class TestUser {
      @ApiProperty({ format: 'email' })
      email!: string;
    }

    const instance = new TestUser();
    instance.email = 'not-an-email';
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
  });

  it('should apply @IsUUID() when format is uuid', async () => {
    class TestItem {
      @ApiProperty({ format: 'uuid' })
      id!: string;
    }

    const instance = new TestItem();
    instance.id = 'not-a-uuid';
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
  });

  it('should apply @IsUrl() when format is url', async () => {
    class TestLink {
      @ApiProperty({ format: 'url' })
      website!: string;
    }

    const instance = new TestLink();
    instance.website = 'not-a-url';
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
  });

  it('should apply @IsOptional() when required: false', async () => {
    class TestOptional {
      @ApiProperty({ format: 'email', required: false })
      email?: string;
    }

    const instance = new TestOptional();
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it('should apply both @IsEmail() and @IsOptional() when format: email, required: false', async () => {
    class TestBoth {
      @ApiProperty({ format: 'email', required: false })
      email?: string;
    }

    // undefined is valid (IsOptional)
    const errors1 = await validate(new TestBoth());
    expect(errors1.length).toBe(0);

    // valid email is valid
    const valid = new TestBoth();
    valid.email = 'test@example.com';
    const errors2 = await validate(valid);
    expect(errors2.length).toBe(0);

    // invalid email should fail (IsEmail)
    const invalid = new TestBoth();
    invalid.email = 'not-an-email';
    const errors3 = await validate(invalid);
    expect(errors3.length).toBe(1);
  });

  it('should NOT apply @IsOptional() when required is omitted', async () => {
    class TestRequired {
      @ApiProperty({ format: 'email' })
      email!: string;
    }

    // undefined should fail (required by default)
    const instance = new TestRequired();
    const errors = await validate(instance);
    expect(errors.length).toBe(1);
  });

  it('should handle address formats', () => {
    class TestAddress {
      @ApiProperty({ format: 'address-line1' })
      line1!: string;

      @ApiProperty({ format: 'address-city' })
      city!: string;

      @ApiProperty({ format: 'postal-code-us' })
      zip!: string;

      @ApiProperty({ format: 'country-code-2' })
      country!: string;
    }

    const instance = new TestAddress();
    instance.line1 = '123 Main St';
    instance.city = 'San Francisco';
    instance.zip = '94105';
    instance.country = 'US';

    expect(instance.line1).toBe('123 Main St');
    expect(instance.city).toBe('San Francisco');
    expect(instance.zip).toBe('94105');
    expect(instance.country).toBe('US');
  });
});
