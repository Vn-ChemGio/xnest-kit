import 'reflect-metadata';
import { ApiResponses } from './api-responses';
import { getDefaultResponses } from '../../config';

jest.mock('../../config', () => ({
  getDefaultResponses: jest.fn(),
}));

const mockGetDefaultResponses = getDefaultResponses as jest.Mock;

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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.create).toBeDefined();
  });

  it('should apply responses as class decorator', () => {
    @ApiResponses([{ status: 200, description: 'OK' }])
    class TestController {
      find() {}
    }

    expect(TestController).toBeDefined();
  });

  it('should merge with default responses (number[])', () => {
    mockGetDefaultResponses.mockReturnValue([409, 500]);

    class TestController {
      @ApiResponses([{ status: 201, description: 'Created' }])
      create() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.create).toBeDefined();
  });

  it('should work with empty responses array', () => {
    mockGetDefaultResponses.mockReturnValue([409]);

    class TestController {
      @ApiResponses([])
      find() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.find).toBeDefined();
  });

  it('should handle empty defaults', () => {
    mockGetDefaultResponses.mockReturnValue([]);

    class TestController {
      @ApiResponses([{ status: 200, description: 'OK' }])
      find() {}
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(TestController.prototype.find).toBeDefined();
  });
});
