import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Minimal shape for checking if connection info is already provided.
 * TypeOrmModuleOptions is a discriminated union; not all variants have
 * `url`, `replication`, or `host` — so we narrow via this internal type.
 */
interface ConnectionCheck {
  url?: string;
  replication?: unknown;
  type?: string;
  host?: string;
}

/**
 * Resolve TypeORM configuration from options or environment variables.
 *
 * Priority:
 * 1. Explicit options with connection info (url, replication, or type+host)
 * 2. DATABASE_URLS env → master/slave replication (pipe-separated, first = master)
 * 3. DATABASE_URL env → single connection
 * 4. Options passed through as-is
 *
 * @param options - Config options (TypeOrmModuleOptions)
 * @returns Resolved TypeOrmModuleOptions for TypeOrmModule.forRoot()
 *
 * @example
 * ```typescript
 * // Explicit options
 * configTypeOrm({ type: 'postgres', host: 'localhost', port: 5432 })
 * ```
 *
 * @example
 * ```typescript
 * // DATABASE_URL env → single connection
 * configTypeOrm()
 * ```
 *
 * @example
 * ```typescript
 * // DATABASE_URLS env → master/slave replication
 * configTypeOrm()
 * ```
 */
export function configTypeOrm(
  options: TypeOrmModuleOptions = {},
): TypeOrmModuleOptions {
  const check = options as ConnectionCheck;

  if (check.url || check.replication || (check.type && check.host)) {
    return options;
  }

  const databaseUrls = process.env['DATABASE_URLS'];
  if (databaseUrls) {
    return mergeOptions(options, parseDatabaseUrls(databaseUrls));
  }

  const databaseUrl = process.env['DATABASE_URL'];
  if (databaseUrl) {
    return mergeOptions(options, { url: databaseUrl });
  }

  return options;
}

/**
 * Parse DATABASE_URLS into replication config.
 *
 * Format: "url1|url2|url3" — first is master, rest are slaves.
 * All URLs must use the same protocol (database type).
 *
 * @param raw - The raw DATABASE_URLS env value
 * @returns Partial options with replication or url set
 */
function parseDatabaseUrls(raw: string): Partial<TypeOrmModuleOptions> {
  const urls = raw
    .split('|')
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 0) return {};

  const firstProtocol = new URL(urls[0]).protocol;

  for (const url of urls) {
    if (new URL(url).protocol !== firstProtocol) {
      throw new Error(
        `[xnest-kit/typeorm] DATABASE_URLS: all URLs must use the same protocol. Found "${new URL(url).protocol}" and "${firstProtocol}"`,
      );
    }
  }

  if (urls.length === 1) return {};

  const [masterUrl, ...slaveUrls] = urls;

  return {
    replication: {
      master: { url: masterUrl },
      slaves: slaveUrls.map((url) => ({ url })),
      defaultMode: 'slave',
    },
  };
}

/**
 * Merge base options with extra fields.
 * The extra fields override base — controlled spread for env var resolution.
 */
function mergeOptions(
  base: TypeOrmModuleOptions,
  extra: Partial<TypeOrmModuleOptions>,
): TypeOrmModuleOptions {
  return { ...base, ...extra } as TypeOrmModuleOptions;
}
