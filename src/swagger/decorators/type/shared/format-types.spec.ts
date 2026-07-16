import type { StringFormat, NumberFormat, BooleanFormat } from './format-types';

describe('format-types', () => {
  it('should have StringFormat accept valid string formats', () => {
    const formats: StringFormat[] = [
      'uuid',
      'email',
      'url',
      'date',
      'phone',
      'ipv4',
      'hostname',
      'creditcard',
      'jwt',
      'base64',
      'json',
      'color',
      'slug',
      'password',
      'strong',
      'markdown',
      'html',
      'xml',
    ];
    expect(formats.length).toBeGreaterThan(0);
  });

  it('should have NumberFormat accept valid number formats', () => {
    const formats: NumberFormat[] = [
      'float',
      'double',
      'int32',
      'int64',
      'positive',
      'negative',
      'latitude',
      'longitude',
      'percentage',
    ];
    expect(formats.length).toBeGreaterThan(0);
  });

  it('should have BooleanFormat accept boolean', () => {
    const formats: BooleanFormat[] = ['boolean'];
    expect(formats).toEqual(['boolean']);
  });
});
