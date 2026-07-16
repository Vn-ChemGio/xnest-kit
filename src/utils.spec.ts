import { isPackageInstalled } from './utils';

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
