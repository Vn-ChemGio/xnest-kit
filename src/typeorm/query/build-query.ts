import {
  Between,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ILike,
} from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import type {
  BuildQueryOptions,
  BuildQueryResult,
  QueryOperator,
  RawQueryParams,
} from './types';

/**
 * Safely convert a value to string, handling objects and primitives.
 *
 * @param value - The value to convert
 * @returns String representation
 *
 * @internal
 */
function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value);
}

/**
 * Parse a string value to the appropriate type based on context.
 *
 * @param value - The raw string value
 * @returns Parsed value (number if numeric, string otherwise)
 *
 * @internal
 */
function coerceValue(value: string): unknown {
  if (value === '' || value === undefined || value === null) return value;
  const num = Number(value);
  return Number.isNaN(num) ? value : num;
}

/**
 * Check if a value is an operator map (e.g., `{ gt: '18' }`).
 *
 * @param value - The value to check
 * @returns Whether the value is an operator map
 *
 * @internal
 */
function isOperatorMap(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const operators: string[] = [
    'eq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'between',
    'not',
    'isNull',
  ];
  return Object.keys(value).some((k) => operators.includes(k));
}

/**
 * Apply a single operator to a value.
 *
 * @param value - The raw value to apply the operator to
 * @param operator - The operator name
 * @param isLikeField - Whether the field allows LIKE queries
 * @returns TypeORM condition value
 *
 * @internal
 */
function applyOperator(
  value: unknown,
  operator: QueryOperator,
  isLikeField: boolean,
): unknown {
  const strValue = safeStringify(value);

  switch (operator) {
    case 'gt':
      return MoreThan(coerceValue(strValue));
    case 'gte':
      return MoreThanOrEqual(coerceValue(strValue));
    case 'lt':
      return LessThan(coerceValue(strValue));
    case 'lte':
      return LessThanOrEqual(coerceValue(strValue));
    case 'like':
      if (!isLikeField) return coerceValue(strValue);
      return Like(`%${strValue}%`);
    case 'ilike':
      if (!isLikeField) return coerceValue(strValue);
      return ILike(`%${strValue}%`);
    case 'in':
      return In(strValue.split(',').map((v) => coerceValue(v.trim())));
    case 'between': {
      const parts = strValue.split(',').map((v) => coerceValue(v.trim()));
      if (parts.length >= 2) return Between(parts[0], parts[1]);
      return coerceValue(strValue);
    }
    case 'not':
      return Not(coerceValue(strValue));
    case 'isNull':
      return strValue === 'true' || strValue === '1' ? IsNull() : null;
    case 'eq':
    default:
      return coerceValue(strValue);
  }
}

/**
 * Check if a field is allowed for searching.
 *
 * @param field - The field name to check
 * @param searchable - Allowed field names (undefined = all allowed)
 * @returns Whether the field is allowed
 *
 * @internal
 */
function isFieldAllowed(field: string, searchable?: string[]): boolean {
  if (!searchable) return true;
  return searchable.includes(field);
}

/**
 * Check if a field allows LIKE queries.
 *
 * @param field - The field name to check
 * @param likeFields - Fields that allow LIKE (undefined = none)
 * @returns Whether LIKE is allowed
 *
 * @internal
 */
function isLikeField(field: string, likeFields?: string[]): boolean {
  if (!likeFields || likeFields.length === 0) return false;
  return likeFields.includes(field);
}

/**
 * Build a TypeORM FindOptionsWhere from a raw where clause.
 *
 * @param whereClause - Raw where clause from query params
 * @param searchable - Allowed field names (undefined = all)
 * @param likeFields - Fields that allow LIKE (undefined = none)
 * @returns TypeORM FindOptionsWhere
 *
 * @internal
 */
function buildWhereClause<T>(
  whereClause: Record<string, unknown>,
  searchable?: string[],
  likeFields?: string[],
): FindOptionsWhere<T> {
  const result: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(whereClause)) {
    // Check if field is allowed
    if (!isFieldAllowed(key, searchable)) continue;

    // Operator map: { gt: 18 }, { like: 'test' }, etc.
    if (isOperatorMap(rawValue)) {
      const opEntries = Object.entries(rawValue);
      if (opEntries.length === 1) {
        const [op, val] = opEntries[0];
        result[key] = applyOperator(
          val,
          op as QueryOperator,
          isLikeField(key, likeFields),
        );
      } else {
        // Multiple operators on same field: use eq if available
        const eqValue = rawValue['eq'];
        result[key] =
          eqValue !== undefined
            ? coerceValue(safeStringify(eqValue))
            : undefined;
      }
      continue;
    }

    // Nested object (relation): { profile: { name: 'John' } }
    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      // Dot notation already handled by TypeORM, skip nested objects
      // unless it's an operator map (already handled above)
      result[key] = rawValue;
      continue;
    }

    // Simple value: { name: 'John' }
    // Auto-apply LIKE if field is in like list
    if (isLikeField(key, likeFields)) {
      result[key] = Like(`%${safeStringify(rawValue)}%`);
    } else {
      result[key] = coerceValue(safeStringify(rawValue));
    }
  }

  return result as FindOptionsWhere<T>;
}

/**
 * Build TypeORM options from raw query parameters.
 *
 * Converts URL query parameters to TypeORM `FindManyOptions` or `FindOneOptions`.
 * Only whitelisted fields are applied, preventing SQL injection through arbitrary column names.
 *
 * **Supported operators:**
 * - `eq` — Equal (default)
 * - `gt` — Greater than → `MoreThan()`
 * - `gte` — Greater than or equal → `MoreThanOrEqual()`
 * - `lt` — Less than → `LessThan()`
 * - `lte` — Less than or equal → `LessThanOrEqual()`
 * - `like` — LIKE → `Like('%value%')` (requires field in `like` array)
 * - `ilike` — Case-insensitive LIKE → `ILike('%value%')` (requires field in `like` array)
 * - `in` — IN → `In([...])`
 * - `between` — BETWEEN → `Between(a, b)`
 * - `not` — NOT → `Not(value)`
 * - `isNull` — IS NULL → `IsNull()`
 *
 * **Nested relations (dot notation):**
 * ```url
 * ?where[profile.name]=John → where: { 'profile.name': 'John' }
 * ```
 *
 * @typeParam T - Entity type for type-safe field access
 * @param query - Raw query parameters from `@Query()`
 * @param options - Build configuration
 * @returns TypeORM FindManyOptions or FindOneOptions
 *
 * @example
 * ```typescript
 * // Basic usage — filter by name, paginated, sorted
 * // URL: ?where[name]=John&take=10&skip=0&order[createdAt]=DESC
 * const options = buildQuery<User>(req.query, {
 *   searchable: ['name', 'email', 'age'],
 *   like: ['name', 'email'],
 *   relations: ['profile'],
 *   maxTake: 100,
 *   defaultTake: 20,
 * });
 * const users = await userRepository.find(options);
 * ```
 *
 * @example
 * ```typescript
 * // Operators — greater than, between, IN
 * // URL: ?where[age][gte]=18&where[age][lte]=65&where[status][in]=active,pending
 * const options = buildQuery<User>(req.query, {
 *   searchable: ['age', 'status'],
 * });
 * // Result: {
 * //   where: { age: MoreThanOrEqual(18), status: In(['active', 'pending']) },
 * //   take: 20,
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Dot notation for nested relations
 * // URL: ?where[profile.name]=Admin
 * const options = buildQuery<User>(req.query, {
 *   searchable: ['name', 'profile.name', 'profile.bio'],
 *   like: ['name', 'profile.name'],
 *   relations: ['profile'],
 * });
 * // Result: { where: { 'profile.name': Like('%Admin%') } }
 * ```
 *
 * @example
 * ```typescript
 * // Select specific fields
 * // URL: ?select=id,name,email&take=5
 * const options = buildQuery<User>(req.query);
 * // Result: { select: ['id', 'name', 'email'], take: 5 }
 * ```
 *
 * @example
 * ```typescript
 * // Multiple relations
 * // URL: ?relations=profile,posts&where[posts.title][like]=hello
 * const options = buildQuery<User>(req.query, {
 *   searchable: ['name', 'posts.title'],
 *   like: ['posts.title'],
 *   relations: ['profile', 'posts'],
 * });
 * // Result: { relations: ['profile', 'posts'], where: { 'posts.title': Like('%hello%') } }
 * ```
 */
export function buildQuery<T>(
  query: RawQueryParams<T>,
  options: BuildQueryOptions<T> = {},
): BuildQueryResult<T> {
  const {
    searchable,
    like: likeFields,
    relations,
    maxTake = 100,
    defaultTake = 20,
  } = options;

  const result: Record<string, unknown> = {};

  // Parse where
  if (query.where && typeof query.where === 'object') {
    const where = buildWhereClause<T>(query.where, searchable, likeFields);
    if (Object.keys(where).length > 0) {
      result.where = where;
    }
  }

  // Parse take (limit)
  if (query.take !== undefined) {
    const parsed = parseInt(String(query.take), 10);
    const take = Number.isNaN(parsed) ? defaultTake : Math.max(1, parsed);
    result.take = Math.min(take, maxTake);
  } else {
    result.take = defaultTake;
  }

  // Parse skip (offset)
  if (query.skip !== undefined) {
    const skip = Math.max(0, parseInt(String(query.skip), 10) || 0);
    result.skip = skip;
  }

  // Parse order
  if (query.order && typeof query.order === 'object') {
    const order: Record<string, 'ASC' | 'DESC'> = {};
    for (const [key, direction] of Object.entries(query.order)) {
      if (!isFieldAllowed(key, searchable)) continue;
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const dir = String(direction).toUpperCase();
      if (dir === 'ASC' || dir === 'DESC') {
        order[key] = dir;
      }
    }
    if (Object.keys(order).length > 0) {
      result.order = order;
    }
  }

  // Parse select
  if (query.select && typeof query.select === 'string') {
    const select = query.select
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (select.length > 0) {
      result.select = select;
    }
  }

  // Parse relations
  if (query.relations) {
    let relationNames: string[];

    if (typeof query.relations === 'string') {
      relationNames = query.relations
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    } else if (Array.isArray(query.relations)) {
      relationNames = query.relations.filter(Boolean);
    } else {
      // FindOptionsRelations<T> — extract top-level relation keys
      relationNames = Object.keys(query.relations).filter(
        (k) => k !== 'toString',
      );
    }

    if (relations !== undefined) {
      const allowed = new Set(relations);
      result.relations = relationNames.filter((r) => allowed.has(r));
    } else {
      result.relations = relationNames;
    }
  }

  return result;
}

const VALID_OPERATORS = new Set<string>([
  'eq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'in',
  'between',
  'not',
  'isNull',
]);

/**
 * Validate raw query parameters against the build options.
 *
 * Returns an array of human-readable error strings describing any issues
 * found in the query. Useful for debugging before the query hits the database.
 *
 * **Validation checks:**
 * - `take` must be a positive integer (or absent)
 * - `skip` must be a non-negative integer (or absent)
 * - `where` keys must be in the `searchable` list (when configured)
 * - `order` keys must be in the `searchable` list (when configured)
 * - `order` direction must be `ASC` or `DESC`
 * - Operator values must be valid for their operator type
 * - `relations` must be in the allowed list (when configured)
 *
 * @param query - Raw query parameters to validate
 * @param options - Build configuration for whitelist rules
 * @returns Array of error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateQuery(
 *   { take: '-1', where: { secret: 'hack' } },
 *   { searchable: ['name', 'email'], maxTake: 100 },
 * );
 * // errors: [
 * //   "take: must be a positive integer, got '-1'",
 * //   "where.secret: field not in searchable list ['name', 'email']",
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Validate order direction
 * const errors = validateQuery(
 *   { order: { name: 'UP' } },
 *   { searchable: ['name'] },
 * );
 * // errors: ["order.name: invalid direction 'UP', must be 'ASC' or 'DESC'"]
 * ```
 *
 * @example
 * ```typescript
 * // Validate operator values
 * const errors = validateQuery(
 *   { where: { age: { between: '18' } } },
 *   { searchable: ['age'] },
 * );
 * // errors: ["where.age.between: 'between' requires two comma-separated values, e.g. '18,65'"]
 * ```
 */
export function validateQuery<T>(
  query: RawQueryParams<T>,
  options: BuildQueryOptions<T> = {},
): string[] {
  const errors: string[] = [];
  const {
    searchable,
    like: likeFields,
    relations: allowedRelations,
    maxTake = 100,
  } = options;

  // Cast to string[] for runtime checks (DotNotationKey<T> is structurally string[])
  const searchableFields = searchable as string[] | undefined;
  const likeFieldNames = likeFields as string[] | undefined;

  // Validate take
  if (query.take !== undefined) {
    const parsed = parseInt(String(query.take), 10);
    if (Number.isNaN(parsed)) {
      errors.push(
        `take: must be a positive integer, got '${String(query.take)}'`,
      );
    } else if (parsed < 1) {
      errors.push(`take: must be >= 1, got ${parsed}`);
    } else if (parsed > maxTake) {
      errors.push(`take: must be <= ${maxTake} (maxTake), got ${parsed}`);
    }
  }

  // Validate skip
  if (query.skip !== undefined) {
    const parsed = parseInt(String(query.skip), 10);
    if (Number.isNaN(parsed)) {
      errors.push(
        `skip: must be a non-negative integer, got '${String(query.skip)}'`,
      );
    } else if (parsed < 0) {
      errors.push(`skip: must be >= 0, got ${parsed}`);
    }
  }

  // Validate where keys
  if (query.where && typeof query.where === 'object') {
    for (const [key, value] of Object.entries(query.where)) {
      if (searchableFields && !searchableFields.includes(key)) {
        errors.push(
          `where.${key}: field not in searchable list [${searchableFields.map((s) => `'${s}'`).join(', ')}]`,
        );
        continue;
      }

      // Validate operator map values
      if (isOperatorMap(value)) {
        const opEntries = Object.entries(value);
        for (const [op, val] of opEntries) {
          if (!VALID_OPERATORS.has(op)) {
            errors.push(
              `where.${key}: unknown operator '${op}', valid operators: ${[...VALID_OPERATORS].join(', ')}`,
            );
            continue;
          }

          const isLike = likeFieldNames?.includes(key) ?? false;

          switch (op) {
            case 'between': {
              const strVal = safeStringify(val);
              const parts = strVal.split(',').map((v) => v.trim());
              if (parts.length < 2 || parts.some((p) => p === '')) {
                errors.push(
                  `where.${key}.${op}: 'between' requires two comma-separated values, e.g. '18,65'`,
                );
              }
              break;
            }
            case 'in': {
              const strVal = safeStringify(val);
              const parts = strVal.split(',').map((v) => v.trim());
              if (parts.length < 1 || parts.some((p) => p === '')) {
                errors.push(
                  `where.${key}.${op}: 'in' requires comma-separated values, e.g. 'active,pending'`,
                );
              }
              break;
            }
            case 'like':
            case 'ilike':
              if (!isLike) {
                errors.push(
                  `where.${key}.${op}: field '${key}' is not in the 'like' list, ${op} queries are not allowed`,
                );
              }
              break;
            case 'isNull': {
              const strVal = safeStringify(val);
              if (strVal !== 'true' && strVal !== '1') {
                errors.push(
                  `where.${key}.${op}: isNull value must be 'true' or '1', got '${strVal}'`,
                );
              }
              break;
            }
          }
        }
      }
    }
  }

  // Validate order
  if (query.order && typeof query.order === 'object') {
    for (const [key, direction] of Object.entries(query.order)) {
      if (searchableFields && !searchableFields.includes(key)) {
        errors.push(
          `order.${key}: field not in searchable list [${searchableFields.map((s) => `'${s}'`).join(', ')}]`,
        );
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const dir = String(direction).toUpperCase();
      if (dir !== 'ASC' && dir !== 'DESC') {
        errors.push(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `order.${key}: invalid direction '${String(direction)}', must be 'ASC' or 'DESC'`,
        );
      }
    }
  }

  // Validate relations
  if (query.relations) {
    let relationNames: string[];
    if (typeof query.relations === 'string') {
      relationNames = query.relations
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    } else if (Array.isArray(query.relations)) {
      relationNames = query.relations.filter(Boolean);
    } else {
      relationNames = Object.keys(query.relations).filter(
        (k) => k !== 'toString',
      );
    }

    if (allowedRelations) {
      for (const rel of relationNames) {
        if (!allowedRelations.includes(rel)) {
          errors.push(
            `relations.${rel}: relation not in allowed list [${allowedRelations.map((r) => `'${r}'`).join(', ')}]`,
          );
        }
      }
    }
  }

  return errors;
}
