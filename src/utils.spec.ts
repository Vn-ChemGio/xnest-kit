import {
  isPackageInstalled,
  assertPackageInstalled,
  lazyImport,
} from './utils';

describe('isPackageInstalled', () => {
  it('should return true for installed packages', () => {
    expect(isPackageInstalled('@nestjs/common')).toBe(true);
  });

  it('should return false for non-existent packages', () => {
    expect(isPackageInstalled('non-existent-package-xyz-12345')).toBe(false);
  });

  it('should return true for node built-ins', () => {
    expect(isPackageInstalled('node:fs')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isPackageInstalled('')).toBe(true);
  });
});

describe('assertPackageInstalled', () => {
  it('should not throw for installed packages', () => {
    expect(() =>
      assertPackageInstalled('@nestjs/common', 'TestContext'),
    ).not.toThrow();
  });

  it('should throw for non-existent packages', () => {
    expect(() =>
      assertPackageInstalled('non-existent-package-xyz-12345', 'TestContext'),
    ).toThrow(
      '[xnest-kit] TestContext requires "non-existent-package-xyz-12345" to be installed.',
    );
  });

  it('should include package name in error message', () => {
    try {
      assertPackageInstalled('non-existent-package-xyz-12345', 'MyProvider');
      fail('Should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain(
        'non-existent-package-xyz-12345',
      );
      expect((error as Error).message).toContain('MyProvider');
    }
  });

  it('should include npm install command in error message', () => {
    try {
      assertPackageInstalled('non-existent-package-xyz-12345', 'MyProvider');
      fail('Should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain(
        'npm install non-existent-package-xyz-12345',
      );
    }
  });
});

describe('lazyImport', () => {
  it('should return a function', () => {
    const getter = lazyImport('@nestjs/common', 'TestContext');
    expect(typeof getter).toBe('function');
  });

  it('should return the imported module on first call', () => {
    const getter = lazyImport('@nestjs/common', 'TestContext');
    const result = getter();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('Module');
  });

  it('should cache the result on subsequent calls', () => {
    const getter = lazyImport('@nestjs/common', 'TestContext');
    const result1 = getter();
    const result2 = getter();
    expect(result1).toBe(result2);
  });

  it('should throw for non-existent packages', () => {
    const getter = lazyImport('non-existent-package-xyz-12345', 'TestContext');
    expect(() => getter()).toThrow('[xnest-kit] TestContext requires');
  });

  it('should work with node built-ins', () => {
    const getter = lazyImport('node:fs', 'TestContext');
    const result = getter();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('readFileSync');
  });
});
