import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { IsNull, Like, MoreThanOrEqual, Not } from 'typeorm';
import { Filterable, ParsedQuery } from './filterable.decorator';
import type { BuildQueryOptions } from '../query/types';

const FILTERABLE_KEY = 'xnest-kit:filterable';

interface TestUser {
  id: number;
  name: string;
  email: string;
  age: number;
  status: string;
  profile: { name: string; bio: string };
}

interface FilterableMetadata {
  options: BuildQueryOptions<TestUser>;
}

function getMetadata(
  controller: object,
  methodName: string,
): FilterableMetadata | undefined {
  return Reflect.getMetadata(FILTERABLE_KEY, controller, methodName) as
    FilterableMetadata | undefined;
}

function extractFactory(
  classConstructor: object,
  methodName: string,
): (data: unknown, ctx: unknown) => unknown {
  const meta = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    classConstructor,
    methodName,
  ) as
    | Record<string, { factory: (data: unknown, ctx: unknown) => unknown }>
    | undefined;
  if (!meta) throw new Error('No route args metadata found');
  const keys = Object.keys(meta);
  return meta[keys[0]].factory;
}

class MockController {
  findAll() {}
  findOne() {}
}

describe('Filterable decorator', () => {
  it('should store metadata on the method', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name', 'email'],
        like: ['name'],
        relations: ['profile'],
        maxTake: 100,
        defaultTake: 20,
      })
      findAll() {
        return [];
      }
    }

    const metadata = getMetadata(new TestController(), 'findAll');

    expect(metadata).toBeDefined();
    expect(metadata?.options).toEqual({
      searchable: ['name', 'email'],
      like: ['name'],
      relations: ['profile'],
      maxTake: 100,
      defaultTake: 20,
    });
  });

  it('should store empty options when none provided', () => {
    class TestController {
      @Filterable()
      findAll() {
        return [];
      }
    }

    const metadata = getMetadata(new TestController(), 'findAll');

    expect(metadata).toBeDefined();
    expect(metadata?.options).toEqual({});
  });

  it('should store metadata independently per method', () => {
    class TestController {
      @Filterable<TestUser>({ searchable: ['name'] })
      findAll() {
        return [];
      }

      @Filterable<TestUser>({ searchable: ['email'] })
      findOne() {
        return {};
      }
    }

    const controller = new TestController();
    const findAllMeta = getMetadata(controller, 'findAll');
    const findOneMeta = getMetadata(controller, 'findOne');

    expect(findAllMeta?.options.searchable).toEqual(['name']);
    expect(findOneMeta?.options.searchable).toEqual(['email']);
  });

  it('should support dot notation in searchable', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name', 'profile.name', 'profile.bio'],
        like: ['name', 'profile.name'],
      })
      findAll() {
        return [];
      }
    }

    const metadata = getMetadata(new TestController(), 'findAll');

    expect(metadata?.options.searchable).toEqual([
      'name',
      'profile.name',
      'profile.bio',
    ]);
    expect(metadata?.options.like).toEqual(['name', 'profile.name']);
  });
});

describe('ParsedQuery decorator', () => {
  it('should be a function', () => {
    expect(typeof ParsedQuery).toBe('function');
  });

  type AnyClass = new (...args: any[]) => any;

  function createMockExecutionContext(
    query: Record<string, unknown>,
    handlerName = 'findAll',
    classRef: AnyClass = MockController,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const handler = classRef.prototype[handlerName] as () => void;
    return {
      switchToHttp: () => ({
        getRequest: () => ({ query }),
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    };
  }

  it('should parse query params using @Filterable metadata', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name', 'age'],
        like: ['name'],
        relations: ['profile'],
      })
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const ctx = createMockExecutionContext(
      {
        where: { name: 'John', age: { gte: '18' } },
        take: '10',
        skip: '5',
        order: { name: 'ASC' },
        relations: 'profile',
      },
      'findAll',
      TestController,
    );

    const result = factory(undefined, ctx) as Record<string, unknown>;

    expect(result.where).toEqual({
      name: Like('%John%'),
      age: MoreThanOrEqual(18),
    });
    expect(result.take).toBe(10);
    expect(result.skip).toBe(5);
    expect(result.order).toEqual({ name: 'ASC' });
    expect(result.relations).toEqual(['profile']);
  });

  it('should parse query params without @Filterable (empty options)', () => {
    class TestController {
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const ctx = createMockExecutionContext(
      { where: { name: 'John' }, take: '5' },
      'findAll',
      TestController,
    );

    const result = factory(undefined, ctx) as Record<string, unknown>;

    expect(result.where).toEqual({ name: 'John' });
    expect(result.take).toBe(5);
  });

  it('should handle missing query object', () => {
    class TestController {
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const handler = (): void => {};
    Object.defineProperty(handler, 'name', { value: 'findAll' });
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => handler,
      getClass: () => TestController,
    };

    const result = factory(undefined, ctx) as Record<string, unknown>;

    expect(result).toEqual({ take: 20 });
  });

  it('should throw BadRequestException when validation errors exist', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name'],
      })
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const ctx = createMockExecutionContext(
      {
        take: 'abc',
        where: { secret: 'hack' },
      },
      'findAll',
      TestController,
    );

    try {
      factory(undefined, ctx);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      expect(response).toHaveProperty('statusCode', 400);
      expect(response).toHaveProperty('message');
      expect((response as { message: string[] }).message).toEqual(
        expect.arrayContaining([expect.stringContaining('secret')]),
      );
    }
  });

  it('should throw BadRequestException for non-searchable where field', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name'],
      })
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const ctx = createMockExecutionContext(
      { where: { email: 'test@test.com' } },
      'findAll',
      TestController,
    );

    expect(() => factory(undefined, ctx)).toThrow(BadRequestException);
  });

  it('should not throw when all query params are valid', () => {
    class TestController {
      @Filterable<TestUser>({
        searchable: ['name', 'email'],
        like: ['name'],
        relations: ['profile'],
        maxTake: 50,
      })
      findAll(_query?: unknown) {}
    }

    ParsedQuery()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');
    const ctx = createMockExecutionContext(
      {
        where: { name: 'John' },
        take: '10',
        skip: '0',
        order: { name: 'ASC' },
        relations: 'profile',
      },
      'findAll',
      TestController,
    );

    expect(() => factory(undefined, ctx)).not.toThrow();
  });

  describe('bracket notation parsing (Fastify compatibility)', () => {
    it('should parse flat bracket-notation where clause into nested objects', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['name'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        { 'where[name]': 'John' },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({ name: 'John' });
    });

    it('should parse nested bracket-notation operators', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['age'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        { 'where[age][gte]': '18' },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({ age: MoreThanOrEqual(18) });
    });

    it('should parse mixed bracket and non-bracket keys', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['name', 'age'],
          like: ['name'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        { 'where[name]': 'John', take: '10' },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({ name: Like('%John%') });
      expect(result.take).toBe(10);
    });

    it('should parse isNull false via bracket notation', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['email'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        { 'where[email][isNull]': 'false' },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({ email: Not(IsNull()) });
    });

    it('should parse deeply nested bracket notation with shared intermediate', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['profile'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        {
          'where[profile][name]': 'John',
          'where[profile][bio]': 'Cool',
        },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({
        profile: { name: 'John', bio: 'Cool' },
      });
    });

    it('should handle multiple bracket keys with same root key', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['name', 'age'],
          like: ['name'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        {
          'where[name]': 'John',
          'where[age][gte]': '18',
        },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({
        name: Like('%John%'),
        age: MoreThanOrEqual(18),
      });
    });

    it('should pass through already-nested objects unchanged', () => {
      class TestController {
        @Filterable<TestUser>({
          searchable: ['name'],
        })
        findAll(_query?: unknown) {}
      }

      ParsedQuery()(TestController.prototype, 'findAll', 0);

      const factory = extractFactory(TestController, 'findAll');
      const ctx = createMockExecutionContext(
        { where: { name: 'John' }, take: '10' },
        'findAll',
        TestController,
      );

      const result = factory(undefined, ctx) as Record<string, unknown>;

      expect(result.where).toEqual({ name: 'John' });
      expect(result.take).toBe(10);
    });
  });
});
