import type { FindManyOptions, FindOptionsRelations } from 'typeorm';

/**
 * Generates dot-notation keys for nested entity fields.
 *
 * Allows both direct keys (`'name'`) and nested paths (`'profile.name'`).
 * The first segment must be a valid key of `T`; the rest is open-ended.
 *
 * @typeParam T - Entity type
 */
export type DotNotationKey<T> =
  (keyof T & string) | `${string & keyof T}.${string}`;

/**
 * Raw query parameters parsed from URL.
 *
 * @typeParam T - Entity type for type-safe field access
 *
 * @example
 * ```url
 * ?where[name]=John&where[profile.name]=Admin&where[age][gt]=18&take=10&skip=0&order[name]=ASC&select=id,name&relations=profile
 * ```
 */
export interface RawQueryParams<T = Record<string, unknown>> {
  /**
   * Filter conditions.
   * Supports direct keys (`name`) and dot notation (`profile.name`).
   */
  where?: Partial<Record<DotNotationKey<T>, unknown>>;
  /** Number of results to take (limit) */
  take?: string;
  /** Number of results to skip (offset) */
  skip?: string;
  /** Sort order — keys must be properties of the entity */
  order?: Partial<Record<keyof T, string>>;
  /** Comma-separated fields to select */
  select?: string;
  /**
   * Relations to load.
   * - `string` — comma-separated (e.g., `'profile,posts'`)
   * - `string[]` — array of relation names (e.g., `['profile', 'posts']`)
   * - `Record<string, boolean | Record<string, unknown>>` — nested relation config (e.g., `{ profile: true, posts: { comments: true } }`)
   */
  relations?:
    string | string[] | FindOptionsRelations<T> | Record<string, unknown>;
}

/**
 * Options for configuring buildQuery behavior.
 *
 * @typeParam T - Entity type for type-safe field names
 */
export interface BuildQueryOptions<T = Record<string, unknown>> {
  /**
   * Allowed searchable field names.
   * Supports dot notation for nested relations (e.g., `'profile.name'`).
   * - `undefined` → all fields allowed
   * - `[]` → no fields allowed
   */
  searchable?: DotNotationKey<T>[];
  /**
   * Fields that allow LIKE queries (auto-wraps value with `%`).
   * Only effective for fields that are also in `searchable`.
   * - `undefined` or `[]` → no LIKE allowed
   */
  like?: DotNotationKey<T>[];
  /**
   * Allowed relations for filtering and loading.
   * - `undefined` → all relations allowed
   * - `[]` → no relations allowed
   */
  relations?: string[];
  /** Maximum take limit. Default: 100 */
  maxTake?: number;
  /** Default take when not specified. Default: 20 */
  defaultTake?: number;
}

/**
 * Supported comparison operators in query params.
 */
export type QueryOperator =
  | 'eq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'between'
  | 'not'
  | 'isNull'
  | 'ilike';

/**
 * Result of buildQuery: a TypeORM FindManyOptions.
 */
export type BuildQueryResult<T> = FindManyOptions<T>;
