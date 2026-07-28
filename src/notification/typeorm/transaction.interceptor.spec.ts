import { TransactionInterceptor } from './transaction.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

const mockStartTransaction = jest.fn().mockResolvedValue(undefined);
const mockCommitTransaction = jest.fn().mockResolvedValue(undefined);
const mockRollbackTransaction = jest.fn().mockResolvedValue(undefined);
const mockRelease = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);

const mockQueryRunner = {
  connect: mockConnect,
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  rollbackTransaction: mockRollbackTransaction,
  release: mockRelease,
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

const mockExecutionContext = {} as ExecutionContext;

describe('TransactionInterceptor', () => {
  let interceptor: TransactionInterceptor;

  beforeEach(() => {
    jest.clearAllMocks();
    interceptor = new TransactionInterceptor(mockDataSource as never);
  });

  it('should start transaction, commit, and release on success', async () => {
    const mockResult = { success: true };
    const callHandler: CallHandler = {
      handle: () => of(mockResult),
    };

    const observable = await interceptor.intercept(
      mockExecutionContext,
      callHandler,
    );
    const result = await observable.toPromise();

    expect(mockConnect).toHaveBeenCalled();
    expect(mockStartTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).toHaveBeenCalled();
    expect(mockRollbackTransaction).not.toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should rollback and release on error', async () => {
    const error = new Error('DB error');
    const callHandler: CallHandler = {
      handle: () => throwError(() => error),
    };

    await expect(
      interceptor.intercept(mockExecutionContext, callHandler),
    ).rejects.toThrow('DB error');

    expect(mockRollbackTransaction).toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalled();
    expect(mockCommitTransaction).not.toHaveBeenCalled();
  });

  it('should always release query runner even on error', async () => {
    const callHandler: CallHandler = {
      handle: () => throwError(() => new Error('fail')),
    };

    try {
      await interceptor.intercept(mockExecutionContext, callHandler);
    } catch {
      // expected
    }

    expect(mockRelease).toHaveBeenCalled();
  });
});
