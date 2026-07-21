import type { DatabaseType } from 'typeorm';

export type { DatabaseType };

/**
 * Options for configTypeOrm().
 *
 * @example
 * ```typescript
 * import { configTypeOrm } from 'xnest-kit/typeorm';
 *
 * const config = configTypeOrm({
 *   type: 'postgres',
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'pass',
 * });
 * ```
 */
export interface ConfigTypeOrmOptions {
  /**
   * Database type.
   * @default auto-detect from DATABASE_URL protocol, or 'postgres'
   */
  type?: DatabaseType;
  /** Database host. @default 'localhost' */
  host?: string;
  /** Database port. @default 5432 for postgres, 3306 for mysql/mariadb */
  port?: number;
  /** Database name. @default 'postgres' */
  database?: string;
  /** Database username. @default '' */
  username?: string;
  /** Database password. @default '' */
  password?: string;
  /**
   * Full connection URL.
   * Overrides host, port, database, username, password.
   * Falls back to DATABASE_URL env variable.
   *
   * @example 'postgres://user:pass@localhost:5432/mydb'
   */
  url?: string;
  /**
   * Entity directories, classes, or glob patterns.
   * Defaults to entity files in dist/ folder.
   */
  entities?: any[];
  /** Auto-create/update schema on startup. @default false */
  synchronize?: boolean;
  /** Enable query logging. @default false */
  logging?: boolean;
  /** SSL configuration. @default false */
  ssl?: boolean | object;
  /** Connection pool size. @default 10 */
  poolSize?: number;
  /** Register as global module. @default true */
  isGlobal?: boolean;
  /** Extra driver-specific options passed to the underlying client. */
  extra?: Record<string, unknown>;
}

/**
 * Internal resolved config returned by configTypeOrm().
 */
export interface TypeOrmConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  entities: any[];
  synchronize: boolean;
  logging: boolean;
  ssl: boolean | object | undefined;
  poolSize: number;
  isGlobal: boolean;
  extra: Record<string, unknown> | undefined;
}
