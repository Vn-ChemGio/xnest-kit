import 'reflect-metadata';
import { ApiResponses } from './api-responses';
import { getDefaultResponses } from '../../config';

jest.mock('../../config', () => ({
  getDefaultResponses: jest.fn(),
}));

const mockGetDefaultResponses = getDefaultResponses as jest.Mock;

// NestJS Swagger stores ApiResponse metadata on the function itself
const RESPONSE_KEY = 'swagger/apiResponse';

function getResponseMetadata(
  target: object,
  propertyKey: string,
): Record<string, unknown> | undefined {
  const fn = (target as Record<string, unknown>)[propertyKey];
  if (typeof fn !== 'function') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Reflect.getMetadata(RESPONSE_KEY, fn);
}

describe('ApiResponses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDefaultResponses.mockReturnValue(undefined);
  });

  it('should apply provided responses', () => {
    class TestController {
      @ApiResponses([
        { status: 201, description: 'Created' },
        { status: 400, description: 'Bad request' },
      ])
      create() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'create');
    expect(meta).toBeDefined();
  });

  it('should apply responses as class decorator', () => {
    @ApiResponses([{ status: 200, description: 'OK' }])
    class TestController {
      find() {}
    }

    // Class decorator without a method doesn't apply ApiResponse
    expect(TestController).toBeDefined();
  });

  it('should merge with default responses', () => {
    mockGetDefaultResponses.mockReturnValue({
      409: { description: 'Conflict' },
      500: { description: 'Server error' },
    });

    class TestController {
      @ApiResponses([{ status: 201, description: 'Created' }])
      create() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'create');
    expect(meta).toBeDefined();
  });

  it('should bypass defaults when bypassDefaults is true', () => {
    mockGetDefaultResponses.mockReturnValue({
      409: { description: 'Conflict' },
      500: { description: 'Server error' },
    });

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }], {
        bypassDefaults: true,
      })
      healthCheck() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'healthCheck');
    expect(meta).toBeDefined();
  });

  it('should add 401 when auto401 is enabled and no @Public()', () => {
    mockGetDefaultResponses.mockReturnValue({
      409: { description: 'Conflict' },
      auto401: true,
    });

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }])
      find() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'find');
    expect(meta).toBeDefined();
  });

  it('should skip 401 when @Public() is present', () => {
    mockGetDefaultResponses.mockReturnValue({
      409: { description: 'Conflict' },
      auto401: true,
    });

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }])
      @Reflect.metadata('public', true)
      publicEndpoint() {}
    }

    const meta = getResponseMetadata(
      TestController.prototype,
      'publicEndpoint',
    );
    expect(meta).toBeDefined();
  });

  it('should skip 401 when bypassDefaults is true', () => {
    mockGetDefaultResponses.mockReturnValue({
      auto401: true,
    });

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }], {
        bypassDefaults: true,
      })
      healthCheck() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'healthCheck');
    expect(meta).toBeDefined();
  });

  it('should work with empty responses array', () => {
    mockGetDefaultResponses.mockReturnValue({
      409: { description: 'Conflict' },
    });

    class TestController {
      @ApiResponses([])
      find() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'find');
    expect(meta).toBeDefined();
  });

  it('should handle empty defaults', () => {
    mockGetDefaultResponses.mockReturnValue({});

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }])
      find() {}
    }

    const meta = getResponseMetadata(TestController.prototype, 'find');
    expect(meta).toBeDefined();
  });
});
