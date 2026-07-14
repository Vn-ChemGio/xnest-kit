import {
  FORMAT_EXAMPLES,
  FORMAT_TYPE_MAP,
  getFormatExample,
  isStringFormat,
  isNumberFormat,
  isBooleanFormat,
  getFormatType,
} from './format-examples';

describe('FORMAT_EXAMPLES', () => {
  it('should have uuid example', () => {
    expect(FORMAT_EXAMPLES.uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should have email example', () => {
    expect(FORMAT_EXAMPLES.email).toBe('user@example.com');
  });

  it('should have latitude as number', () => {
    expect(typeof FORMAT_EXAMPLES.latitude).toBe('number');
    expect(FORMAT_EXAMPLES.latitude).toBe(10.762622);
  });

  it('should have boolean example', () => {
    expect(FORMAT_EXAMPLES.boolean).toBe(true);
  });

  it('should have geo-point as array', () => {
    expect(Array.isArray(FORMAT_EXAMPLES['geo-point'])).toBe(true);
  });
});

describe('getFormatExample', () => {
  it('should return undefined when format is undefined', () => {
    expect(getFormatExample('string', undefined)).toBeUndefined();
  });

  it('should return undefined for unknown format', () => {
    expect(getFormatExample('string', 'nonexistent')).toBe('string');
  });

  it('should return example from FORMAT_EXAMPLES', () => {
    expect(getFormatExample(undefined, 'email')).toBe('user@example.com');
  });

  it('should fallback to type-based defaults', () => {
    expect(getFormatExample('string', 'unknown-format')).toBe('string');
    expect(getFormatExample('number', 'unknown-format')).toBe(0);
    expect(getFormatExample('integer', 'unknown-format')).toBe(0);
    expect(getFormatExample('boolean', 'unknown-format')).toBe(true);
    expect(getFormatExample('array', 'unknown-format')).toEqual([]);
    expect(getFormatExample('object', 'unknown-format')).toEqual({});
  });

  it('should return undefined for unknown type and unknown format', () => {
    expect(getFormatExample('something', 'unknown')).toBeUndefined();
  });

  it('should handle null type', () => {
    expect(getFormatExample(null, 'unknown')).toBeUndefined();
  });
});

describe('FORMAT_TYPE_MAP', () => {
  it('should map string formats', () => {
    expect(FORMAT_TYPE_MAP.uuid).toBe('string');
    expect(FORMAT_TYPE_MAP.email).toBe('string');
    expect(FORMAT_TYPE_MAP.url).toBe('string');
    expect(FORMAT_TYPE_MAP.date).toBe('string');
  });

  it('should map number formats', () => {
    expect(FORMAT_TYPE_MAP.float).toBe('number');
    expect(FORMAT_TYPE_MAP.int32).toBe('number');
    expect(FORMAT_TYPE_MAP.latitude).toBe('number');
    expect(FORMAT_TYPE_MAP.percentage).toBe('number');
  });

  it('should map boolean format', () => {
    expect(FORMAT_TYPE_MAP.boolean).toBe('boolean');
  });

  it('should map formatted strings as string', () => {
    expect(FORMAT_TYPE_MAP.money).toBe('string');
    expect(FORMAT_TYPE_MAP.decimal).toBe('string');
  });

  it('should map unknown formats as unknown', () => {
    expect(FORMAT_TYPE_MAP['geo-point']).toBe('unknown');
    expect(FORMAT_TYPE_MAP['string-array']).toBe('unknown');
  });
});

describe('isStringFormat', () => {
  it('should return true for string formats', () => {
    expect(isStringFormat('uuid')).toBe(true);
    expect(isStringFormat('email')).toBe(true);
    expect(isStringFormat('money')).toBe(true);
  });

  it('should return false for number formats', () => {
    expect(isStringFormat('float')).toBe(false);
    expect(isStringFormat('int32')).toBe(false);
  });

  it('should return false for unknown format', () => {
    expect(isStringFormat('unknown')).toBe(false);
  });
});

describe('isNumberFormat', () => {
  it('should return true for number formats', () => {
    expect(isNumberFormat('float')).toBe(true);
    expect(isNumberFormat('latitude')).toBe(true);
    expect(isNumberFormat('percentage')).toBe(true);
  });

  it('should return false for string formats', () => {
    expect(isNumberFormat('uuid')).toBe(false);
    expect(isNumberFormat('email')).toBe(false);
  });
});

describe('isBooleanFormat', () => {
  it('should return true for boolean format', () => {
    expect(isBooleanFormat('boolean')).toBe(true);
  });

  it('should return false for other formats', () => {
    expect(isBooleanFormat('uuid')).toBe(false);
    expect(isBooleanFormat('float')).toBe(false);
  });
});

describe('getFormatType', () => {
  it('should return correct types', () => {
    expect(getFormatType('uuid')).toBe('string');
    expect(getFormatType('float')).toBe('number');
    expect(getFormatType('boolean')).toBe('boolean');
    expect(getFormatType('geo-point')).toBe('unknown');
  });

  it('should return unknown for unmapped format', () => {
    expect(getFormatType('nonexistent')).toBe('unknown');
  });
});
