import { createRequire } from 'node:module';

const localRequire = createRequire(__filename);

/**
 * Check if a Node.js package is installed and resolvable.
 *
 * @param packageName - The npm package name to check
 * @returns true if the package can be resolved
 */
export function isPackageInstalled(packageName: string): boolean {
  try {
    localRequire.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}
