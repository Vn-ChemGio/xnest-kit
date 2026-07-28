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

/**
 * Assert that a package is installed, throwing a clear error if not.
 *
 * @param packageName - The npm package name to check
 * @param context - Description of what requires the package (for error message)
 * @throws {Error} If the package is not installed
 *
 * @example
 * ```typescript
 * assertPackageInstalled('@sendgrid/mail', 'SendGridEmailProvider');
 * ```
 */
export function assertPackageInstalled(
  packageName: string,
  context: string,
): void {
  if (!isPackageInstalled(packageName)) {
    throw new Error(
      `[xnest-kit] ${context} requires "${packageName}" to be installed. ` +
        `Run: npm install ${packageName}`,
    );
  }
}

/**
 * Create a lazy-loaded import that defers the require until first use.
 *
 * Returns a function that, when called, returns the imported module.
 * Useful for providers that depend on optional peer packages.
 *
 * @param packageName - The npm package name to lazy-import
 * @param context - Description of what requires the package
 * @returns A function that returns the imported module on first call
 *
 * @example
 * ```typescript
 * const getSendGrid = lazyImport('@sendgrid/mail', 'SendGridEmailProvider');
 *
 * class SendGridEmailProvider {
 *   async send(input: EmailSendInput) {
 *     const sgMail = getSendGrid();
 *     await sgMail.send({ ... });
 *   }
 * }
 * ```
 */
export function lazyImport<T = unknown>(
  packageName: string,
  context: string,
): () => T {
  let cached: T | undefined;
  return (): T => {
    if (cached !== undefined) return cached;
    assertPackageInstalled(packageName, context);

    cached = localRequire(packageName) as T;
    return cached;
  };
}
