import type { INestApplication } from '@nestjs/common';
import { configSwagger } from './index';
import { isPackageInstalled } from '../../utils';

jest.mock('../../utils');
jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: jest.fn().mockReturnValue('<scalar-doc/>'),
}));
jest.mock('@nestjs/swagger', () => {
  const builder = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    addServer: jest.fn().mockReturnThis(),
    addSecurity: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({ openapi: '3.0.0', info: {}, paths: {} }),
  };

  const doc = {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
    paths: {} as Record<string, unknown>,
  };

  return {
    DocumentBuilder: jest.fn(() => builder),
    SwaggerModule: {
      createDocument: jest.fn(() => doc),
      setup: jest.fn(),
    },
    __doc: doc,
  };
});

const mockUse = jest.fn();
const mockApp = {
  use: mockUse,
} as unknown as INestApplication;

/**
 * Access the mock's internal document object.
 * Since `configSwagger` mutates `paths` on the returned doc,
 * this gives us direct access to the same object.
 */
function getDoc() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@nestjs/swagger') as {
    __doc: {
      paths: Record<
        string,
        Record<string, { responses?: Record<string, unknown> }>
      >;
    };
  };
  return mod.__doc;
}

function getSwaggerModule() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@nestjs/swagger') as Record<string, unknown>;
  return mod.SwaggerModule as { createDocument: jest.Mock; setup: jest.Mock };
}

function getBuilder() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DocumentBuilder } = require('@nestjs/swagger') as {
    DocumentBuilder: jest.Mock;
  };
  return DocumentBuilder.mock.results[0].value as {
    setTitle: jest.Mock;
    setDescription: jest.Mock;
    setVersion: jest.Mock;
    addTag: jest.Mock;
    addServer: jest.Mock;
    addSecurity: jest.Mock;
    build: jest.Mock;
  };
}

describe('configSwagger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isPackageInstalled as jest.Mock).mockReturnValue(false);
    getDoc().paths = {};
  });

  it('should use default options', () => {
    configSwagger(mockApp);

    const builder = getBuilder();
    expect(builder.setTitle).toHaveBeenCalledWith('API');
    expect(builder.setDescription).toHaveBeenCalledWith('');
    expect(builder.setVersion).toHaveBeenCalledWith('1.0.0');
  });

  it('should use custom title, description, version', () => {
    configSwagger(mockApp, {
      title: 'My API',
      description: 'My description',
      version: '2.0.0',
    });

    const builder = getBuilder();
    expect(builder.setTitle).toHaveBeenCalledWith('My API');
    expect(builder.setDescription).toHaveBeenCalledWith('My description');
    expect(builder.setVersion).toHaveBeenCalledWith('2.0.0');
  });

  it('should add tags', () => {
    configSwagger(mockApp, {
      tags: [
        { name: 'Users', description: 'User endpoints' },
        { name: 'Auth', description: 'Auth endpoints' },
      ],
    });

    const builder = getBuilder();
    expect(builder.addTag).toHaveBeenCalledTimes(2);
    expect(builder.addTag).toHaveBeenCalledWith('Users', 'User endpoints');
    expect(builder.addTag).toHaveBeenCalledWith('Auth', 'Auth endpoints');
  });

  it('should add servers', () => {
    configSwagger(mockApp, {
      servers: [
        { url: 'http://localhost:3000', description: 'Local' },
        { url: 'https://api.example.com', description: 'Production' },
      ],
    });

    const builder = getBuilder();
    expect(builder.addServer).toHaveBeenCalledTimes(2);
    expect(builder.addServer).toHaveBeenCalledWith(
      'http://localhost:3000',
      'Local',
    );
    expect(builder.addServer).toHaveBeenCalledWith(
      'https://api.example.com',
      'Production',
    );
  });

  it('should add security with bearer preset', () => {
    configSwagger(mockApp, {
      securities: [{ name: 'bearer', preset: 'bearer' }],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('bearer', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  });

  it('should add security with basic preset', () => {
    configSwagger(mockApp, {
      securities: [{ name: 'basic', preset: 'basic' }],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('basic', {
      type: 'http',
      scheme: 'basic',
    });
  });

  it('should add security with oauth2 preset', () => {
    configSwagger(mockApp, {
      securities: [{ name: 'oauth2', preset: 'oauth2' }],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('oauth2', {
      type: 'oauth2',
      flows: {},
    });
  });

  it('should add security with apikey preset', () => {
    configSwagger(mockApp, {
      securities: [{ name: 'apiKey', preset: 'apikey' }],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('apiKey', {
      type: 'apiKey',
      in: 'header',
    });
  });

  it('should add security with cookie preset', () => {
    configSwagger(mockApp, {
      securities: [{ name: 'cookie', preset: 'cookie' }],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('cookie', {
      type: 'apiKey',
      in: 'cookie',
    });
  });

  it('should merge preset with custom options', () => {
    configSwagger(mockApp, {
      securities: [
        {
          name: 'bearer',
          preset: 'bearer',
          options: { description: 'Custom bearer' },
        },
      ],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('bearer', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Custom bearer',
    });
  });

  it('should use raw options when no preset', () => {
    configSwagger(mockApp, {
      securities: [
        {
          name: 'custom',
          options: {
            type: 'openIdConnect',
            openIdConnectUrl:
              'https://example.com/.well-known/openid-configuration',
          },
        },
      ],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledWith('custom', {
      type: 'openIdConnect',
      openIdConnectUrl: 'https://example.com/.well-known/openid-configuration',
    });
  });

  it('should use default path when not provided', () => {
    configSwagger(mockApp);

    const swagger = getSwaggerModule();
    expect(swagger.setup).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      expect.anything(),
    );
  });

  it('should strip leading slash from path', () => {
    configSwagger(mockApp, { path: '/custom/path' });

    const swagger = getSwaggerModule();
    expect(swagger.setup).toHaveBeenCalledWith(
      'custom/path',
      mockApp,
      expect.anything(),
    );
  });

  it('should use custom path', () => {
    configSwagger(mockApp, { path: 'docs' });

    const swagger = getSwaggerModule();
    expect(swagger.setup).toHaveBeenCalledWith(
      'docs',
      mockApp,
      expect.anything(),
    );
  });

  it('should use Scalar when package is installed', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(true);

    configSwagger(mockApp);

    const swagger = getSwaggerModule();
    expect(swagger.setup).not.toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith('/api/docs', '<scalar-doc/>');
  });

  it('should use Swagger UI when Scalar is not installed', () => {
    (isPackageInstalled as jest.Mock).mockReturnValue(false);

    configSwagger(mockApp);

    const swagger = getSwaggerModule();
    expect(swagger.setup).toHaveBeenCalled();
    expect(mockUse).not.toHaveBeenCalled();
  });

  it('should handle empty securities array', () => {
    configSwagger(mockApp, { securities: [] });

    const builder = getBuilder();
    expect(builder.addSecurity).not.toHaveBeenCalled();
  });

  it('should handle multiple securities', () => {
    configSwagger(mockApp, {
      securities: [
        { name: 'bearer', preset: 'bearer' },
        { name: 'apiKey', preset: 'apikey' },
      ],
    });

    const builder = getBuilder();
    expect(builder.addSecurity).toHaveBeenCalledTimes(2);
  });

  it('should return OpenAPI document', () => {
    const doc = configSwagger(mockApp);

    expect(doc).toBeDefined();
    expect(doc.openapi).toBe('3.0.0');
    expect(doc.info).toBeDefined();
    expect(doc.paths).toBeDefined();
  });

  describe('defaultResponses', () => {
    it('should apply default responses with full options', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: { responses: {} },
        post: { responses: {} },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          409: {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number', example: 409 },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    statusCode: { type: 'number', example: 500 },
                  },
                },
              },
            },
          },
        },
      });

      expect(doc.paths['/users'].get.responses).toEqual({
        '409': {
          description: 'Conflict',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { statusCode: { type: 'number', example: 409 } },
              },
            },
          },
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { statusCode: { type: 'number', example: 500 } },
              },
            },
          },
        },
      });
    });

    it('should auto-generate body when value is true', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: { responses: {} },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          500: true,
        },
      });

      expect(doc.paths['/users'].get.responses).toEqual({
        '500': {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  statusCode: { type: 'number', example: 500 },
                  message: { type: 'string', example: 'Internal Server Error' },
                  error: { type: 'string', example: 'Internal Server Error' },
                },
              },
            },
          },
        },
      });
    });

    it('should auto-generate body for known statuses with true', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: { responses: {} },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          409: true,
          500: true,
        },
      });

      expect(doc.paths['/users'].get.responses['409']).toEqual({
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 409 },
                message: { type: 'string', example: 'Conflict' },
                error: { type: 'string', example: 'Conflict' },
              },
            },
          },
        },
      });
    });

    it('should not overwrite existing responses with body', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: {
          responses: {
            '409': {
              description: 'Already set',
              content: {
                'application/json': {
                  schema: { type: 'string', example: 'custom' },
                },
              },
            },
          },
        },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          409: true,
          500: true,
        },
      });

      expect(doc.paths['/users'].get.responses['409']).toEqual({
        description: 'Already set',
        content: {
          'application/json': {
            schema: { type: 'string', example: 'custom' },
          },
        },
      });
      expect(doc.paths['/users'].get.responses['500']).toEqual({
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: 'Internal Server Error' },
                error: { type: 'string', example: 'Internal Server Error' },
              },
            },
          },
        },
      });
    });

    it('should merge auto-generated body into existing response without body', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: {
          responses: {
            '500': { description: 'Internal Server Error' },
          },
        },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          500: true,
        },
      });

      expect(doc.paths['/users'].get.responses).toEqual({
        '500': {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  statusCode: { type: 'number', example: 500 },
                  message: { type: 'string', example: 'Internal Server Error' },
                  error: { type: 'string', example: 'Internal Server Error' },
                },
              },
            },
          },
        },
      });
    });

    it('should not apply auto401 as a response', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: { responses: {} },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          401: true,
          auto401: true,
        },
      });

      expect(doc.paths['/users'].get.responses['401']).toEqual({
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
              },
            },
          },
        },
      });
    });

    it('should generate body for unknown status with true', () => {
      const doc = getDoc();
      doc.paths['/users'] = {
        get: { responses: {} },
      };

      configSwagger(mockApp, {
        defaultResponses: {
          999: true,
        },
      });

      expect(doc.paths['/users'].get.responses).toEqual({
        '999': {
          description: 'Error 999',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  statusCode: { type: 'number', example: 999 },
                  message: { type: 'string', example: 'Error 999' },
                  error: { type: 'string', example: 'Error 999' },
                },
              },
            },
          },
        },
      });
    });

    it('should not apply when no paths exist', () => {
      configSwagger(mockApp, {
        defaultResponses: {
          500: true,
        },
      });

      const doc = getDoc();
      expect(doc.paths).toEqual({});
    });
  });
});
