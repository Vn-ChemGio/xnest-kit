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
import { buildQuery, validateQuery } from './build-query';
import type { BuildQueryOptions, RawQueryParams } from './types';

interface TestEntity {
  id: number;
  name: string;
  email: string;
  age: number;
  status: string;
  createdAt: Date;
  deletedAt: Date | null;
  profile: { name: string; bio: string };
}

const defaultOptions: BuildQueryOptions<TestEntity> = {
  searchable: [
    'name',
    'email',
    'age',
    'status',
    'createdAt',
    'deletedAt',
    'profile.name',
  ],
  like: ['name', 'email'],
  relations: ['profile'],
};

// ─── buildQuery ────────────────────────────────────────────────────────────────

describe('buildQuery', () => {
  describe('empty query', () => {
    it('should return default take', () => {
      const result = buildQuery<TestEntity>({});
      expect(result).toEqual({ take: 20 });
    });

    it('should respect custom defaultTake', () => {
      const result = buildQuery<TestEntity>({}, { defaultTake: 50 });
      expect(result).toEqual({ take: 50 });
    });
  });

  describe('take and skip', () => {
    it('should parse take', () => {
      const result = buildQuery<TestEntity>({ take: '10' });
      expect(result.take).toBe(10);
    });

    it('should parse skip', () => {
      const result = buildQuery<TestEntity>({ skip: '5' });
      expect(result.skip).toBe(5);
    });

    it('should cap take at maxTake', () => {
      const result = buildQuery<TestEntity>({ take: '999' }, { maxTake: 100 });
      expect(result.take).toBe(100);
    });

    it('should enforce minimum take of 1', () => {
      const result = buildQuery<TestEntity>({ take: '0' });
      expect(result.take).toBe(1);
    });

    it('should handle negative skip as 0', () => {
      const result = buildQuery<TestEntity>({ skip: '-5' });
      expect(result.skip).toBe(0);
    });

    it('should default take when invalid', () => {
      const result = buildQuery<TestEntity>({ take: 'abc' });
      expect(result.take).toBe(20);
    });

    it('should default skip to 0 when invalid', () => {
      const result = buildQuery<TestEntity>({ skip: 'abc' });
      expect(result.skip).toBe(0);
    });

    it('should handle very large take', () => {
      const result = buildQuery<TestEntity>(
        { take: '999999' },
        { maxTake: 1000 },
      );
      expect(result.take).toBe(1000);
    });

    it('should handle zero take as 1', () => {
      const result = buildQuery<TestEntity>({ take: '0' });
      expect(result.take).toBe(1);
    });
  });

  describe('order', () => {
    it('should parse ASC order', () => {
      const result = buildQuery<TestEntity>(
        { order: { name: 'ASC' } },
        defaultOptions,
      );
      expect(result.order).toEqual({ name: 'ASC' });
    });

    it('should parse DESC order', () => {
      const result = buildQuery<TestEntity>(
        { order: { createdAt: 'DESC' } },
        defaultOptions,
      );
      expect(result.order).toEqual({ createdAt: 'DESC' });
    });

    it('should ignore non-whitelisted fields', () => {
      const result = buildQuery<TestEntity>(
        { order: { name: 'ASC', status: 'DESC' } },
        { searchable: ['name'] },
      );
      expect(result.order).toEqual({ name: 'ASC' });
    });

    it('should allow all fields when searchable is undefined', () => {
      const result = buildQuery<TestEntity>({
        order: { name: 'ASC', status: 'DESC' },
      });
      expect(result.order).toEqual({ name: 'ASC', status: 'DESC' });
    });

    it('should handle lowercase direction', () => {
      const result = buildQuery<TestEntity>(
        { order: { name: 'asc' } },
        defaultOptions,
      );
      expect(result.order).toEqual({ name: 'ASC' });
    });

    it('should ignore invalid direction', () => {
      const result = buildQuery<TestEntity>(
        { order: { name: 'INVALID' } },
        defaultOptions,
      );
      expect(result.order).toBeUndefined();
    });

    it('should handle mixed valid/invalid directions', () => {
      const result = buildQuery<TestEntity>(
        { order: { name: 'ASC', age: 'UP' } },
        defaultOptions,
      );
      expect(result.order).toEqual({ name: 'ASC' });
    });
  });

  describe('select', () => {
    it('should parse comma-separated select', () => {
      const result = buildQuery<TestEntity>({ select: 'id,name,email' });
      expect(result.select).toEqual(['id', 'name', 'email']);
    });

    it('should trim whitespace', () => {
      const result = buildQuery<TestEntity>({ select: ' id , name ' });
      expect(result.select).toEqual(['id', 'name']);
    });

    it('should ignore empty values', () => {
      const result = buildQuery<TestEntity>({ select: 'id,,name,' });
      expect(result.select).toEqual(['id', 'name']);
    });

    it('should handle single field', () => {
      const result = buildQuery<TestEntity>({ select: 'name' });
      expect(result.select).toEqual(['name']);
    });
  });

  describe('relations', () => {
    it('should parse comma-separated relations', () => {
      const result = buildQuery<TestEntity>({ relations: 'profile' });
      expect(result.relations).toEqual(['profile']);
    });

    it('should parse string array relations', () => {
      const result = buildQuery<TestEntity>({
        relations: ['profile', 'posts'],
      });
      expect(result.relations).toEqual(['profile', 'posts']);
    });

    it('should parse FindOptionsRelations object', () => {
      const result = buildQuery<TestEntity>({
        relations: { profile: true },
      });
      expect(result.relations).toEqual(['profile']);
    });

    it('should filter FindOptionsRelations by allowed list', () => {
      const result = buildQuery<TestEntity>(
        {
          relations: { profile: true },
        },
        { relations: ['profile'] },
      );
      expect(result.relations).toEqual(['profile']);
    });

    it('should filter string array by allowed relations', () => {
      const result = buildQuery<TestEntity>(
        { relations: ['profile', 'status'] },
        { relations: ['profile'] },
      );
      expect(result.relations).toEqual(['profile']);
    });

    it('should filter by allowed relations', () => {
      const result = buildQuery<TestEntity>(
        { relations: 'profile,status' },
        { relations: ['profile'] },
      );
      expect(result.relations).toEqual(['profile']);
    });

    it('should allow all relations when no whitelist', () => {
      const result = buildQuery<TestEntity>({ relations: 'profile,status' });
      expect(result.relations).toEqual(['profile', 'status']);
    });

    it('should return empty when no relations allowed', () => {
      const result = buildQuery<TestEntity>(
        { relations: 'profile,status' },
        { relations: [] },
      );
      expect(result.relations).toEqual([]);
    });
  });

  describe('where - equality', () => {
    it('should filter string equality', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John' } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should auto-apply LIKE for like-listed fields with equality', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John' } },
        defaultOptions,
      );
      expect(result.where).toEqual({ name: Like('%John%') });
    });

    it('should filter number equality', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: '25' } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: 25 });
    });

    it('should ignore non-whitelisted fields', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John', status: 'active' } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should allow all fields when searchable is undefined', () => {
      const result = buildQuery<TestEntity>({
        where: { name: 'John', status: 'active' },
      });
      expect(result.where).toEqual({ name: 'John', status: 'active' });
    });

    it('should handle dot notation for nested relations', () => {
      const result = buildQuery<TestEntity>(
        { where: { 'profile.name': 'John' } },
        defaultOptions,
      );
      expect(result.where).toEqual({ 'profile.name': 'John' });
    });
  });

  describe('where - operators', () => {
    it('should apply gt operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { gt: '18' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: MoreThan(18) });
    });

    it('should apply gte operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { gte: '18' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: MoreThanOrEqual(18) });
    });

    it('should apply lt operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { lt: '65' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: LessThan(65) });
    });

    it('should apply lte operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { lte: '65' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: LessThanOrEqual(65) });
    });

    it('should apply like operator when field is in like list', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { like: 'John' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ name: Like('%John%') });
    });

    it('should fallback to simple value when like not allowed', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { like: 'John' } } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should apply ilike operator when field is in like list', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { ilike: 'John' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ name: ILike('%John%') });
    });

    it('should fallback to simple value when ilike not allowed', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { ilike: 'John' } } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should apply in operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { status: { in: 'active,inactive' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ status: In(['active', 'inactive']) });
    });

    it('should apply between operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { between: '18,65' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: Between(18, 65) });
    });

    it('should fallback when between has single value', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { between: '18' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: 18 });
    });

    it('should apply not operator', () => {
      const result = buildQuery<TestEntity>(
        { where: { status: { not: 'deleted' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ status: Not('deleted') });
    });

    it('should apply isNull operator with "true"', () => {
      const result = buildQuery<TestEntity>(
        { where: { deletedAt: { isNull: 'true' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ deletedAt: IsNull() });
    });

    it('should apply isNull operator with "1"', () => {
      const result = buildQuery<TestEntity>(
        { where: { deletedAt: { isNull: '1' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ deletedAt: IsNull() });
    });

    it('should return null for isNull with falsy value', () => {
      const result = buildQuery<TestEntity>(
        { where: { deletedAt: { isNull: 'false' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ deletedAt: null });
    });

    it('should apply eq operator explicitly', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { eq: 'John' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should ignore operators on non-whitelisted fields', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { gt: '100' } } },
        { searchable: ['name'] },
      );
      expect(result.where).toBeUndefined();
    });

    it('should handle multi-operator map with eq key', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { gt: '18', eq: '25' } } },
        { searchable: ['age'] },
      );
      expect(result.where).toEqual({ age: 25 });
    });

    it('should handle multi-operator map without eq key', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { gt: '18', lt: '65' } } },
        { searchable: ['age'] },
      );
      expect(result.where).toEqual({ age: undefined });
    });
  });

  describe('where - nested objects and safeStringify branches', () => {
    it('should pass through nested object as-is (non-operator, non-array)', () => {
      const result = buildQuery<TestEntity>({
        where: { profile: { name: 'John' } },
      });
      expect(result.where).toEqual({ profile: { name: 'John' } });
    });

    it('should not pass through nested object when field is not allowed', () => {
      const result = buildQuery<TestEntity>(
        { where: { profile: { name: 'John' } } },
        { searchable: ['name'] },
      );
      expect(result.where).toBeUndefined();
    });

    it('should coerce boolean values in operator maps via safeStringify', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { eq: true } } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'true' });
    });

    it('should coerce Date values in operator maps via safeStringify', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = buildQuery<TestEntity>(
        { where: { name: { like: date } } },
        { searchable: ['name'], like: ['name'] },
      );
      expect(result.where).toEqual({
        name: Like('%2024-01-01T00:00:00.000Z%'),
      });
    });

    it('should coerce object values in operator maps via safeStringify', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { in: { nested: 'val' } } } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: In(['{"nested":"val"}']) });
    });

    it('should handle boolean value in like field via safeStringify', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: true } },
        { searchable: ['name'], like: ['name'] },
      );
      expect(result.where).toEqual({ name: Like('%true%') });
    });

    it('should coerce Date values in where as-is (object branch)', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = buildQuery<TestEntity>(
        { where: { createdAt: date } },
        { searchable: ['createdAt'] },
      );
      expect(result.where).toEqual({ createdAt: date });
    });

    it('should pass through nested object values as-is', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: { nested: 'val' } } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: { nested: 'val' } });
    });

    it('should coerce null values in where', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: null } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: '' });
    });

    it('should handle between operator with more than 2 parts', () => {
      const result = buildQuery<TestEntity>(
        { where: { age: { between: '18,65,100' } } },
        defaultOptions,
      );
      expect(result.where).toEqual({ age: Between(18, 65) });
    });
  });

  describe('where - auto LIKE', () => {
    it('should auto-apply LIKE when field is in like list (no operator)', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John' } },
        defaultOptions,
      );
      expect(result.where).toEqual({ name: Like('%John%') });
    });

    it('should not auto-apply LIKE when field is not in like list', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John' } },
        { searchable: ['name'] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });

    it('should auto-apply LIKE with empty like array', () => {
      const result = buildQuery<TestEntity>(
        { where: { name: 'John' } },
        { searchable: ['name'], like: [] },
      );
      expect(result.where).toEqual({ name: 'John' });
    });
  });

  describe('where - multiple fields', () => {
    it('should combine multiple where conditions', () => {
      const result = buildQuery<TestEntity>(
        {
          where: {
            name: 'John',
            age: { gte: '18' },
            status: { in: 'active,pending' },
          },
        },
        {
          searchable: ['name', 'age', 'status'],
        },
      );
      expect(result.where).toEqual({
        name: 'John',
        age: MoreThanOrEqual(18),
        status: In(['active', 'pending']),
      });
    });

    it('should combine conditions with like fields', () => {
      const result = buildQuery<TestEntity>(
        {
          where: {
            name: 'John',
            age: { gte: '18' },
            status: { in: 'active,pending' },
          },
        },
        defaultOptions,
      );
      expect(result.where).toEqual({
        name: Like('%John%'),
        age: MoreThanOrEqual(18),
        status: In(['active', 'pending']),
      });
    });
  });

  describe('full query', () => {
    it('should build complete FindManyOptions', () => {
      const result = buildQuery<TestEntity>(
        {
          where: { name: 'John', age: { gte: '18' } },
          take: '10',
          skip: '5',
          order: { name: 'ASC' },
          select: 'id,name,email',
          relations: 'profile',
        },
        {
          searchable: ['name', 'age'],
          relations: ['profile'],
        },
      );
      expect(result).toEqual({
        where: { name: 'John', age: MoreThanOrEqual(18) },
        take: 10,
        skip: 5,
        order: { name: 'ASC' },
        select: ['id', 'name', 'email'],
        relations: ['profile'],
      });
    });

    it('should build complete FindManyOptions with like fields', () => {
      const result = buildQuery<TestEntity>(
        {
          where: { name: 'John', age: { gte: '18' } },
          take: '10',
          skip: '5',
          order: { name: 'ASC' },
          select: 'id,name,email',
          relations: 'profile',
        },
        defaultOptions,
      );
      expect(result).toEqual({
        where: { name: Like('%John%'), age: MoreThanOrEqual(18) },
        take: 10,
        skip: 5,
        order: { name: 'ASC' },
        select: ['id', 'name', 'email'],
        relations: ['profile'],
      });
    });
  });

  describe('type safety', () => {
    it('should accept typed options', () => {
      const options: BuildQueryOptions<TestEntity> = {
        searchable: ['name', 'email', 'age', 'status'],
        like: ['name', 'email'],
        relations: ['profile'],
      };
      const result = buildQuery<TestEntity>(
        { where: { name: 'test' } },
        options,
      );
      expect(result.where).toEqual({ name: Like('%test%') });
    });

    it('should accept typed raw query', () => {
      const query: RawQueryParams<TestEntity> = {
        where: { name: 'John', age: '25' },
        order: { name: 'ASC' },
        take: '10',
      };
      const result = buildQuery<TestEntity>(query, {
        searchable: ['name', 'age'],
      });
      expect(result.where).toEqual({ name: 'John', age: 25 });
    });
  });
});

// ─── validateQuery ─────────────────────────────────────────────────────────────

describe('validateQuery', () => {
  describe('take validation', () => {
    it('should return no errors for valid take', () => {
      const errors = validateQuery<TestEntity>({ take: '10' });
      expect(errors).toEqual([]);
    });

    it('should error on non-numeric take', () => {
      const errors = validateQuery<TestEntity>({ take: 'abc' });
      expect(errors).toEqual(["take: must be a positive integer, got 'abc'"]);
    });

    it('should error on zero take', () => {
      const errors = validateQuery<TestEntity>({ take: '0' });
      expect(errors).toEqual(['take: must be >= 1, got 0']);
    });

    it('should error on negative take', () => {
      const errors = validateQuery<TestEntity>({ take: '-5' });
      expect(errors).toEqual(['take: must be >= 1, got -5']);
    });

    it('should error on take exceeding maxTake', () => {
      const errors = validateQuery<TestEntity>(
        { take: '200' },
        { maxTake: 100 },
      );
      expect(errors).toEqual(['take: must be <= 100 (maxTake), got 200']);
    });

    it('should not error when take is absent', () => {
      const errors = validateQuery<TestEntity>({});
      expect(errors).toEqual([]);
    });
  });

  describe('skip validation', () => {
    it('should return no errors for valid skip', () => {
      const errors = validateQuery<TestEntity>({ skip: '10' });
      expect(errors).toEqual([]);
    });

    it('should error on non-numeric skip', () => {
      const errors = validateQuery<TestEntity>({ skip: 'abc' });
      expect(errors).toEqual([
        "skip: must be a non-negative integer, got 'abc'",
      ]);
    });

    it('should error on negative skip', () => {
      const errors = validateQuery<TestEntity>({ skip: '-5' });
      expect(errors).toEqual(['skip: must be >= 0, got -5']);
    });

    it('should not error when skip is absent', () => {
      const errors = validateQuery<TestEntity>({});
      expect(errors).toEqual([]);
    });
  });

  describe('where validation', () => {
    it('should error on non-searchable field', () => {
      const errors = validateQuery<TestEntity>(
        { where: { secret: 'hack' } } as RawQueryParams<TestEntity>,
        { searchable: ['name', 'email'] },
      );
      expect(errors).toEqual([
        "where.secret: field not in searchable list ['name', 'email']",
      ]);
    });

    it('should not error when searchable is undefined', () => {
      const errors = validateQuery<TestEntity>({
        where: { anything: 'value' },
      } as RawQueryParams<TestEntity>);
      expect(errors).toEqual([]);
    });

    it('should error on unknown operator', () => {
      const errors = validateQuery<TestEntity>(
        { where: { name: { badop: 'test', gt: '18' } } },
        { searchable: ['name'] },
      );
      expect(errors).toEqual([
        "where.name: unknown operator 'badop', valid operators: eq, gt, gte, lt, lte, like, ilike, in, between, not, isNull",
      ]);
    });

    it('should error on between with single value', () => {
      const errors = validateQuery<TestEntity>(
        { where: { age: { between: '18' } } },
        { searchable: ['age'] },
      );
      expect(errors).toEqual([
        "where.age.between: 'between' requires two comma-separated values, e.g. '18,65'",
      ]);
    });

    it('should error on between with empty second value', () => {
      const errors = validateQuery<TestEntity>(
        { where: { age: { between: '18,' } } },
        { searchable: ['age'] },
      );
      expect(errors).toEqual([
        "where.age.between: 'between' requires two comma-separated values, e.g. '18,65'",
      ]);
    });

    it('should not error on valid between', () => {
      const errors = validateQuery<TestEntity>(
        { where: { age: { between: '18,65' } } },
        { searchable: ['age'] },
      );
      expect(errors).toEqual([]);
    });

    it('should error on like for non-like field', () => {
      const errors = validateQuery<TestEntity>(
        { where: { age: { like: '18' } } },
        { searchable: ['age'] },
      );
      expect(errors).toEqual([
        "where.age.like: field 'age' is not in the 'like' list, like queries are not allowed",
      ]);
    });

    it('should not error on like for like field', () => {
      const errors = validateQuery<TestEntity>(
        { where: { name: { like: 'John' } } },
        { searchable: ['name'], like: ['name'] },
      );
      expect(errors).toEqual([]);
    });

    it('should error on ilike for non-like field', () => {
      const errors = validateQuery<TestEntity>(
        { where: { age: { ilike: '18' } } },
        { searchable: ['age'] },
      );
      expect(errors).toEqual([
        "where.age.ilike: field 'age' is not in the 'like' list, ilike queries are not allowed",
      ]);
    });

    it('should error on isNull with invalid value', () => {
      const errors = validateQuery<TestEntity>(
        { where: { deletedAt: { isNull: 'no' } } },
        { searchable: ['deletedAt'] },
      );
      expect(errors).toEqual([
        "where.deletedAt.isNull: isNull value must be 'true' or '1', got 'no'",
      ]);
    });

    it('should not error on valid isNull with "1"', () => {
      const errors = validateQuery<TestEntity>(
        { where: { deletedAt: { isNull: '1' } } },
        { searchable: ['deletedAt'] },
      );
      expect(errors).toEqual([]);
    });

    it('should not error on valid isNull', () => {
      const errors = validateQuery<TestEntity>(
        { where: { deletedAt: { isNull: 'true' } } },
        { searchable: ['deletedAt'] },
      );
      expect(errors).toEqual([]);
    });

    it('should error on in with empty parts', () => {
      const errors = validateQuery<TestEntity>(
        { where: { status: { in: '' } } },
        { searchable: ['status'] },
      );
      expect(errors).toEqual([
        "where.status.in: 'in' requires comma-separated values, e.g. 'active,pending'",
      ]);
    });

    it('should not error on valid in', () => {
      const errors = validateQuery<TestEntity>(
        { where: { status: { in: 'active,pending' } } },
        { searchable: ['status'] },
      );
      expect(errors).toEqual([]);
    });

    it('should not error when operator map is not an object', () => {
      const errors = validateQuery<TestEntity>(
        { where: { name: 'test' } },
        { searchable: ['name'] },
      );
      expect(errors).toEqual([]);
    });

    it('should not error when operator map is an array', () => {
      const errors = validateQuery<TestEntity>({
        where: { name: ['a', 'b'] },
      });
      expect(errors).toEqual([]);
    });
  });

  describe('order validation', () => {
    it('should error on non-searchable order field', () => {
      const errors = validateQuery<TestEntity>(
        { order: { secret: 'ASC' } } as RawQueryParams<TestEntity>,
        { searchable: ['name'] },
      );
      expect(errors).toEqual([
        "order.secret: field not in searchable list ['name']",
      ]);
    });

    it('should error on invalid direction', () => {
      const errors = validateQuery<TestEntity>(
        { order: { name: 'UP' } },
        { searchable: ['name'] },
      );
      expect(errors).toEqual([
        "order.name: invalid direction 'UP', must be 'ASC' or 'DESC'",
      ]);
    });

    it('should not error on valid order', () => {
      const errors = validateQuery<TestEntity>(
        { order: { name: 'ASC' } },
        { searchable: ['name'] },
      );
      expect(errors).toEqual([]);
    });
  });

  describe('relations validation', () => {
    it('should error on non-allowed relation (string)', () => {
      const errors = validateQuery<TestEntity>(
        { relations: 'profile,secret' },
        { relations: ['profile'] },
      );
      expect(errors).toEqual([
        "relations.secret: relation not in allowed list ['profile']",
      ]);
    });

    it('should error on non-allowed relation (array)', () => {
      const errors = validateQuery<TestEntity>(
        { relations: ['profile', 'secret'] },
        { relations: ['profile'] },
      );
      expect(errors).toEqual([
        "relations.secret: relation not in allowed list ['profile']",
      ]);
    });

    it('should error on non-allowed relation (FindOptionsRelations object)', () => {
      const errors = validateQuery<TestEntity>(
        { relations: { profile: true, secret: true } },
        { relations: ['profile'] },
      );
      expect(errors).toEqual([
        "relations.secret: relation not in allowed list ['profile']",
      ]);
    });

    it('should not error when no relations whitelist (string)', () => {
      const errors = validateQuery<TestEntity>({
        relations: 'profile,anything',
      });
      expect(errors).toEqual([]);
    });

    it('should not error when no relations whitelist (array)', () => {
      const errors = validateQuery<TestEntity>({
        relations: ['profile', 'anything'],
      });
      expect(errors).toEqual([]);
    });

    it('should not error on valid relation', () => {
      const errors = validateQuery<TestEntity>(
        { relations: 'profile' },
        { relations: ['profile'] },
      );
      expect(errors).toEqual([]);
    });

    it('should not error on valid relation (array)', () => {
      const errors = validateQuery<TestEntity>(
        { relations: ['profile'] },
        { relations: ['profile'] },
      );
      expect(errors).toEqual([]);
    });
  });

  describe('multiple errors', () => {
    it('should collect all errors at once', () => {
      const errors = validateQuery<TestEntity>(
        {
          take: 'abc',
          skip: '-5',
          where: { secret: 'hack' },
          order: { name: 'UP' },
          relations: 'profile,secret',
        } as RawQueryParams<TestEntity>,
        {
          searchable: ['name'],
          like: ['name'],
          relations: ['profile'],
          maxTake: 100,
        },
      );
      expect(errors.length).toBeGreaterThanOrEqual(4);
      expect(errors).toEqual(
        expect.arrayContaining([
          "take: must be a positive integer, got 'abc'",
          'skip: must be >= 0, got -5',
          "where.secret: field not in searchable list ['name']",
          "order.name: invalid direction 'UP', must be 'ASC' or 'DESC'",
          "relations.secret: relation not in allowed list ['profile']",
        ]),
      );
    });
  });

  describe('clean query', () => {
    it('should return no errors for valid query', () => {
      const errors = validateQuery<TestEntity>(
        {
          where: { name: 'John', age: { gte: '18' } },
          take: '10',
          skip: '0',
          order: { name: 'ASC' },
          select: 'id,name',
          relations: 'profile',
        },
        defaultOptions,
      );
      expect(errors).toEqual([]);
    });
  });
});
