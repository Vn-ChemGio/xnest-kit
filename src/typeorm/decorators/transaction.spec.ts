/* eslint-disable @typescript-eslint/unbound-method */
import 'reflect-metadata';
import { type ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { DataSource, type QueryRunner, type EntityManager } from 'typeorm';
import {
  UseTransaction,
  GetManager,
  TRANSACTION_OPTIONS_KEY,
  TRANSACTION_MANAGER_KEY,
} from './transaction.decorator';
import { TransactionInterceptor } from './transaction.interceptor';
import { of, throwError, lastValueFrom } from 'rxjs';

const MOCK_EM = { save: jest.fn() } as unknown as EntityManager;

function createMockQueryRunner(overrides?: Partial<QueryRunner>): QueryRunner {
  return {
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: MOCK_EM,
    ...overrides,
  } as unknown as QueryRunner;
}

type AnyClass = new (...args: unknown[]) => unknown;

function createMockContext(
  handler?: () => void,
  request?: Record<string, unknown>,
  classRef?: AnyClass,
): ExecutionContext {
  const fn = handler ?? (() => {});
  return {
    switchToHttp: () => ({
      getRequest: () => request ?? {},
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => fn,
    getClass: () => classRef ?? class {},
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({
      getContext: () => ({}),
      getRpcContext: () => ({}),
      getData: () => ({}),
    }),
    switchToWs: () => ({
      getData: () => ({}),
      getClient: () => ({}),
      getPattern: () => '',
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
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

const getHandler = (c: object, m: string) =>
  (c as Record<string, () => void>)[m];

describe('UseTransaction decorator', () => {
  it('should store empty options when none provided', () => {
    class TestController {
      @UseTransaction()
      findAll() {}
    }

    const meta = Reflect.getMetadata(
      TRANSACTION_OPTIONS_KEY,
      TestController.prototype,
      'findAll',
    ) as Record<string, unknown>;

    expect(meta).toEqual({});
  });

  it('should store isolation level options', () => {
    class TestController {
      @UseTransaction({ isolation: 'SERIALIZABLE' })
      findAll() {}
    }

    const meta = Reflect.getMetadata(
      TRANSACTION_OPTIONS_KEY,
      TestController.prototype,
      'findAll',
    ) as Record<string, unknown>;

    expect(meta).toEqual({ isolation: 'SERIALIZABLE' });
  });

  it('should not store metadata on methods without the decorator', () => {
    class TestController {
      findAll() {}
    }

    const meta = Reflect.getMetadata(
      TRANSACTION_OPTIONS_KEY,
      TestController.prototype,
      'findAll',
    ) as Record<string, unknown> | undefined;

    expect(meta).toBeUndefined();
  });
});

describe('GetManager param decorator', () => {
  it('should return the transactional EntityManager from request', () => {
    class TestController {
      findAll(_em?: unknown) {}
    }

    GetManager()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');

    const em = {};
    const ctx = createMockContext(
      getHandler(TestController.prototype, 'findAll'),
      {
        [TRANSACTION_MANAGER_KEY]: em,
      },
    );

    expect(factory(undefined, ctx)).toBe(em);
  });

  it('should return undefined when no transaction is active', () => {
    class TestController {
      findAll(_em?: unknown) {}
    }

    GetManager()(TestController.prototype, 'findAll', 0);

    const factory = extractFactory(TestController, 'findAll');

    const ctx = createMockContext(
      getHandler(TestController.prototype, 'findAll'),
      {},
    );

    expect(factory(undefined, ctx)).toBeUndefined();
  });
});

describe('TransactionInterceptor', () => {
  let createQueryRunnerSpy: jest.Mock;
  let dataSource: DataSource;

  beforeEach(() => {
    createQueryRunnerSpy = jest.fn();
    dataSource = {
      createQueryRunner: createQueryRunnerSpy,
    } as unknown as DataSource;
  });

  function createControllerWithTransaction(
    options?: Parameters<typeof UseTransaction>[0],
  ) {
    class Controller {
      @UseTransaction(options)
      findAll() {}
    }
    return Controller;
  }

  it('should pass through when no @UseTransaction metadata is present', async () => {
    class PlainController {
      findAll() {}
    }
    void PlainController;

    const interceptor = new TransactionInterceptor(dataSource);
    const handler = { handle: jest.fn().mockReturnValue(of('result')) };
    const ctx = createMockContext();

    const result = await lastValueFrom(
      interceptor.intercept(ctx, handler as never),
    );

    expect(result).toBe('result');
    expect(createQueryRunnerSpy).not.toHaveBeenCalled();
  });

  it('should start transaction and commit on success', async () => {
    const qr = createMockQueryRunner();
    createQueryRunnerSpy.mockReturnValue(qr);

    const Controller = createControllerWithTransaction();
    const interceptor = new TransactionInterceptor(dataSource);
    const handler = { handle: jest.fn().mockReturnValue(of('result')) };
    const request = {};
    const ctx = createMockContext(
      getHandler(Controller.prototype, 'findAll'),
      request,
      Controller,
    );

    const result = await lastValueFrom(
      interceptor.intercept(ctx, handler as never),
    );

    expect(result).toBe('result');
    expect(qr.startTransaction).toHaveBeenCalledWith(undefined);
    expect(qr.commitTransaction).toHaveBeenCalled();
    expect(qr.rollbackTransaction).not.toHaveBeenCalled();
    expect(qr.release).toHaveBeenCalled();
    expect(request[TRANSACTION_MANAGER_KEY]).toBe(qr.manager);
  });

  it('should start transaction with isolation level', async () => {
    const qr = createMockQueryRunner();
    createQueryRunnerSpy.mockReturnValue(qr);

    const Controller = createControllerWithTransaction({
      isolation: 'SERIALIZABLE',
    });
    const interceptor = new TransactionInterceptor(dataSource);
    const handler = { handle: jest.fn().mockReturnValue(of('result')) };
    const ctx = createMockContext(
      getHandler(Controller.prototype, 'findAll'),
      undefined,
      Controller,
    );

    await lastValueFrom(interceptor.intercept(ctx, handler as never));

    expect(qr.startTransaction).toHaveBeenCalledWith('SERIALIZABLE');
  });

  it('should rollback on error and re-throw', async () => {
    const qr = createMockQueryRunner();
    createQueryRunnerSpy.mockReturnValue(qr);

    const Controller = createControllerWithTransaction();
    const error = new Error('DB error');
    const interceptor = new TransactionInterceptor(dataSource);
    const handler = {
      handle: jest.fn().mockReturnValue(throwError(() => error)),
    };
    const ctx = createMockContext(
      getHandler(Controller.prototype, 'findAll'),
      undefined,
      Controller,
    );

    await expect(
      lastValueFrom(interceptor.intercept(ctx, handler as never)),
    ).rejects.toThrow('DB error');

    expect(qr.rollbackTransaction).toHaveBeenCalled();
    expect(qr.commitTransaction).not.toHaveBeenCalled();
    expect(qr.release).toHaveBeenCalled();
  });

  it('should always release query runner even on error', async () => {
    const qr = createMockQueryRunner({
      rollbackTransaction: jest
        .fn()
        .mockRejectedValue(new Error('rollback failed')),
    });
    createQueryRunnerSpy.mockReturnValue(qr);

    const Controller = createControllerWithTransaction();
    const interceptor = new TransactionInterceptor(dataSource);
    const handler = {
      handle: jest
        .fn()
        .mockReturnValue(throwError(() => new Error('DB error'))),
    };
    const ctx = createMockContext(
      getHandler(Controller.prototype, 'findAll'),
      undefined,
      Controller,
    );

    await expect(
      lastValueFrom(interceptor.intercept(ctx, handler as never)),
    ).rejects.toThrow();

    expect(qr.release).toHaveBeenCalled();
  });

  it('should attach manager to request for @GetManager() to read', async () => {
    const qr = createMockQueryRunner();
    createQueryRunnerSpy.mockReturnValue(qr);

    const Controller = createControllerWithTransaction();
    const interceptor = new TransactionInterceptor(dataSource);
    const handler = { handle: jest.fn().mockReturnValue(of('result')) };
    const request: Record<string, unknown> = {};
    const ctx = createMockContext(
      getHandler(Controller.prototype, 'findAll'),
      request,
      Controller,
    );

    await lastValueFrom(interceptor.intercept(ctx, handler as never));

    expect(request[TRANSACTION_MANAGER_KEY]).toBe(qr.manager);
  });
});
