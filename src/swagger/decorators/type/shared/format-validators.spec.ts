import { getValidatorDecorators } from './format-validators';

describe('getValidatorDecorators', () => {
  it('should return empty array when no options', () => {
    expect(getValidatorDecorators({})).toEqual([]);
  });

  it('should return empty array for unknown format', () => {
    expect(getValidatorDecorators({ format: 'unknown' })).toEqual([]);
  });

  it('should return IsEmail for email format', () => {
    const decos = getValidatorDecorators({ format: 'email' });
    expect(decos.length).toBe(1);
  });

  it('should return IsUUID for uuid format', () => {
    const decos = getValidatorDecorators({ format: 'uuid' });
    expect(decos.length).toBe(1);
  });

  it('should return IsUUID(4) for uuid-v4 format', () => {
    const decos = getValidatorDecorators({ format: 'uuid-v4' });
    expect(decos.length).toBe(1);
  });

  it('should return IsUrl for url format', () => {
    const decos = getValidatorDecorators({ format: 'url' });
    expect(decos.length).toBe(1);
  });

  it('should return IsIP(4) for ipv4 format', () => {
    const decos = getValidatorDecorators({ format: 'ipv4' });
    expect(decos.length).toBe(1);
  });

  it('should return IsIP(6) for ipv6 format', () => {
    const decos = getValidatorDecorators({ format: 'ipv6' });
    expect(decos.length).toBe(1);
  });

  it('should return IsIP() for ip format', () => {
    const decos = getValidatorDecorators({ format: 'ip' });
    expect(decos.length).toBe(1);
  });

  it('should return IsPort for port format', () => {
    const decos = getValidatorDecorators({ format: 'port' });
    expect(decos.length).toBe(1);
  });

  it('should return IsMACAddress for mac format', () => {
    const decos = getValidatorDecorators({ format: 'mac' });
    expect(decos.length).toBe(1);
  });

  it('should return IsDateString for date format', () => {
    const decos = getValidatorDecorators({ format: 'date' });
    expect(decos.length).toBe(1);
  });

  it('should return IsMilitaryTime for time format', () => {
    const decos = getValidatorDecorators({ format: 'time' });
    expect(decos.length).toBe(1);
  });

  it('should return IsCreditCard for creditcard format', () => {
    const decos = getValidatorDecorators({ format: 'creditcard' });
    expect(decos.length).toBe(1);
  });

  it('should return IsIBAN for iban format', () => {
    const decos = getValidatorDecorators({ format: 'iban' });
    expect(decos.length).toBe(1);
  });

  it('should return IsBIC for swift format', () => {
    const decos = getValidatorDecorators({ format: 'swift' });
    expect(decos.length).toBe(1);
  });

  it('should return IsISBN for isbn format', () => {
    const decos = getValidatorDecorators({ format: 'isbn' });
    expect(decos.length).toBe(1);
  });

  it('should return IsISBN(10) for isbn10 format', () => {
    const decos = getValidatorDecorators({ format: 'isbn10' });
    expect(decos.length).toBe(1);
  });

  it('should return IsEAN for ean format', () => {
    const decos = getValidatorDecorators({ format: 'ean' });
    expect(decos.length).toBe(1);
  });

  it('should return IsJSON for json format', () => {
    const decos = getValidatorDecorators({ format: 'json' });
    expect(decos.length).toBe(1);
  });

  it('should return IsJWT for jwt format', () => {
    const decos = getValidatorDecorators({ format: 'jwt' });
    expect(decos.length).toBe(1);
  });

  it('should return IsBase64 for base64 format', () => {
    const decos = getValidatorDecorators({ format: 'base64' });
    expect(decos.length).toBe(1);
  });

  it('should return IsHexadecimal for hex format', () => {
    const decos = getValidatorDecorators({ format: 'hex' });
    expect(decos.length).toBe(1);
  });

  it('should return IsMimeType for mime format', () => {
    const decos = getValidatorDecorators({ format: 'mime' });
    expect(decos.length).toBe(1);
  });

  it('should return IsSemVer for semver format', () => {
    const decos = getValidatorDecorators({ format: 'semver' });
    expect(decos.length).toBe(1);
  });

  it('should return IsAlpha for alpha format', () => {
    const decos = getValidatorDecorators({ format: 'alpha' });
    expect(decos.length).toBe(1);
  });

  it('should return IsAlphanumeric for alphanumeric format', () => {
    const decos = getValidatorDecorators({ format: 'alphanumeric' });
    expect(decos.length).toBe(1);
  });

  it('should return IsAscii for ascii format', () => {
    const decos = getValidatorDecorators({ format: 'ascii' });
    expect(decos.length).toBe(1);
  });

  it('should return IsLatitude for latitude format', () => {
    const decos = getValidatorDecorators({ format: 'latitude' });
    expect(decos.length).toBe(1);
  });

  it('should return IsLongitude for longitude format', () => {
    const decos = getValidatorDecorators({ format: 'longitude' });
    expect(decos.length).toBe(1);
  });

  it('should return IsBooleanString for boolean format', () => {
    const decos = getValidatorDecorators({ format: 'boolean' });
    expect(decos.length).toBe(1);
  });

  it('should return IsRgbColor for rgb format', () => {
    const decos = getValidatorDecorators({ format: 'rgb' });
    expect(decos.length).toBe(1);
  });

  it('should return IsRgbColor for hexcolor format', () => {
    const decos = getValidatorDecorators({ format: 'hexcolor' });
    expect(decos.length).toBe(1);
  });

  it('should return IsPostalCode for postal-code format', () => {
    const decos = getValidatorDecorators({ format: 'postal-code' });
    expect(decos.length).toBe(1);
  });

  it('should return IsPhoneNumber for phone format', () => {
    const decos = getValidatorDecorators({ format: 'phone' });
    expect(decos.length).toBe(1);
  });

  it('should return IsPhoneNumber(VN) for phone-vn format', () => {
    const decos = getValidatorDecorators({ format: 'phone-vn' });
    expect(decos.length).toBe(1);
  });

  it('should return IsPhoneNumber(US) for phone-us format', () => {
    const decos = getValidatorDecorators({ format: 'phone-us' });
    expect(decos.length).toBe(1);
  });

  it('should return IsFQDN for hostname format', () => {
    const decos = getValidatorDecorators({ format: 'hostname' });
    expect(decos.length).toBe(1);
  });

  it('should return IsCurrency for currency format', () => {
    const decos = getValidatorDecorators({ format: 'currency' });
    expect(decos.length).toBe(1);
  });

  it('should return IsMongoId for mongo format', () => {
    const decos = getValidatorDecorators({ format: 'mongo' });
    expect(decos.length).toBe(1);
  });

  it('should return IsLocale for locale format', () => {
    const decos = getValidatorDecorators({ format: 'locale' });
    expect(decos.length).toBe(1);
  });

  it('should return IsOctal for octal format', () => {
    const decos = getValidatorDecorators({ format: 'octal' });
    expect(decos.length).toBe(1);
  });

  it('should return IsNumberString for numeric format', () => {
    const decos = getValidatorDecorators({ format: 'numeric' });
    expect(decos.length).toBe(1);
  });

  it('should return IsMimeType for mimetype format', () => {
    const decos = getValidatorDecorators({ format: 'mimetype' });
    expect(decos.length).toBe(1);
  });

  it('should return IsBIC for bic format', () => {
    const decos = getValidatorDecorators({ format: 'bic' });
    expect(decos.length).toBe(1);
  });

  it('should return IsISBN(13) for isbn13 format', () => {
    const decos = getValidatorDecorators({ format: 'isbn13' });
    expect(decos.length).toBe(1);
  });
});

describe('getValidatorDecorators with required', () => {
  it('should add IsOptional when required: false', () => {
    const decos = getValidatorDecorators({ format: 'email', required: false });
    expect(decos.length).toBe(2);
  });

  it('should not add IsOptional when required: true', () => {
    const decos = getValidatorDecorators({ format: 'email', required: true });
    expect(decos.length).toBe(1);
  });

  it('should not add IsOptional when required is omitted', () => {
    const decos = getValidatorDecorators({ format: 'email' });
    expect(decos.length).toBe(1);
  });

  it('should add IsOptional without format when required: false', () => {
    const decos = getValidatorDecorators({ required: false });
    expect(decos.length).toBe(1);
  });
});

describe('format-validators coverage', () => {
  it('should handle all formats in FORMAT_VALIDATOR_MAP', () => {
    const formats = [
      'uuid',
      'uuid-v1',
      'uuid-v4',
      'mongo',
      'email',
      'idn-email',
      'phone',
      'phone-international',
      'phone-us',
      'phone-vn',
      'fax',
      'url',
      'uri',
      'hostname',
      'ipv4',
      'ipv6',
      'ip',
      'port',
      'mac',
      'date',
      'date-time',
      'time',
      'time-24h',
      'creditcard',
      'creditcard-visa',
      'creditcard-mc',
      'credit-card',
      'card-number',
      'iban',
      'bic',
      'swift',
      'currency',
      'isbn',
      'isbn10',
      'isbn13',
      'ean',
      'json',
      'jwt',
      'base64',
      'hex',
      'mime',
      'mimetype',
      'semver',
      'locale',
      'alpha',
      'alphanumeric',
      'numeric',
      'octal',
      'ascii',
      'hexcolor',
      'rgb',
      'postal-code',
      'postal-code-us',
      'postal-code-vn',
      'latitude',
      'longitude',
      'boolean',
    ];

    formats.forEach((format) => {
      const decos = getValidatorDecorators({ format });
      expect(decos.length).toBeGreaterThanOrEqual(1);
    });
  });
});
