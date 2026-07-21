import { configTypeOrm } from './config-typeorm';

describe('configTypeOrm', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['DATABASE_URL'];
    delete process.env['DATABASE_URLS'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('explicit options', () => {
    it('should return options when url is provided', () => {
      const options = { url: 'postgres://localhost:5432/test' };
      expect(configTypeOrm(options)).toBe(options);
    });

    it('should return options when replication is provided', () => {
      const options = {
        replication: {
          master: { url: 'postgres://master:5432/test' },
          slaves: [{ url: 'postgres://slave:5432/test' }],
        },
      };
      expect(configTypeOrm(options)).toBe(options);
    });

    it('should return options when type and host are provided', () => {
      const options = { type: 'postgres' as const, host: 'localhost' };
      expect(configTypeOrm(options)).toBe(options);
    });
  });

  describe('DATABASE_URL', () => {
    it('should resolve single connection from DATABASE_URL', () => {
      process.env['DATABASE_URL'] = 'postgres://localhost:5432/test';
      const result = configTypeOrm();
      expect(result).toEqual({ url: 'postgres://localhost:5432/test' });
    });

    it('should merge with base options', () => {
      process.env['DATABASE_URL'] = 'postgres://localhost:5432/test';
      const result = configTypeOrm({ synchronize: true });
      expect(result).toEqual({
        synchronize: true,
        url: 'postgres://localhost:5432/test',
      });
    });
  });

  describe('DATABASE_URLS', () => {
    it('should return empty when all urls are empty', () => {
      process.env['DATABASE_URLS'] = '|||';
      const result = configTypeOrm();
      expect(result).toEqual({});
    });

    it('should return empty for single url (no replication needed)', () => {
      process.env['DATABASE_URLS'] = 'postgres://localhost:5432/test';
      const result = configTypeOrm();
      expect(result).toEqual({});
    });

    it('should create replication config for multiple urls', () => {
      process.env['DATABASE_URLS'] =
        'postgres://master:5432/test|postgres://slave1:5432/test|postgres://slave2:5432/test';
      const result = configTypeOrm();
      expect(result).toEqual({
        replication: {
          master: { url: 'postgres://master:5432/test' },
          slaves: [
            { url: 'postgres://slave1:5432/test' },
            { url: 'postgres://slave2:5432/test' },
          ],
          defaultMode: 'slave',
        },
      });
    });

    it('should trim whitespace from urls', () => {
      process.env['DATABASE_URLS'] =
        ' postgres://master:5432/test | postgres://slave:5432/test ';
      const result = configTypeOrm();
      expect(result).toEqual({
        replication: {
          master: { url: 'postgres://master:5432/test' },
          slaves: [{ url: 'postgres://slave:5432/test' }],
          defaultMode: 'slave',
        },
      });
    });

    it('should throw when urls have different protocols', () => {
      process.env['DATABASE_URLS'] =
        'postgres://master:5432/test|mysql://slave:3306/test';
      expect(() => configTypeOrm()).toThrow(
        /DATABASE_URLS: all URLs must use the same protocol/,
      );
    });

    it('should merge with base options', () => {
      process.env['DATABASE_URLS'] =
        'postgres://master:5432/test|postgres://slave:5432/test';
      const result = configTypeOrm({ synchronize: true });
      expect(result).toEqual({
        synchronize: true,
        replication: {
          master: { url: 'postgres://master:5432/test' },
          slaves: [{ url: 'postgres://slave:5432/test' }],
          defaultMode: 'slave',
        },
      });
    });
  });

  describe('DATABASE_URLS takes priority over DATABASE_URL', () => {
    it('should use DATABASE_URLS when both are set', () => {
      process.env['DATABASE_URL'] = 'postgres://from-url:5432/test';
      process.env['DATABASE_URLS'] =
        'postgres://master:5432/test|postgres://slave:5432/test';
      const result = configTypeOrm();
      expect(result).toHaveProperty('replication');
      expect(result).not.toHaveProperty('url');
    });
  });

  describe('fallback', () => {
    it('should return empty object when no env and no options', () => {
      const result = configTypeOrm();
      expect(result).toEqual({});
    });

    it('should return provided options when no env', () => {
      const options = { synchronize: true };
      const result = configTypeOrm(options);
      expect(result).toEqual({ synchronize: true });
    });
  });
});
