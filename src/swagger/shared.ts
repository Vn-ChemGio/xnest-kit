/**
 * Build a standard NestJS error response object for OpenAPI 3.0.
 *
 * @param status - HTTP status code
 * @param message - Error message
 * @returns OpenAPI response object with `description` and `content.application/json.schema`
 *
 * @internal
 */
export function buildNestErrorResponse(
  status: number,
  message: string,
): { description: string; content: Record<string, unknown> } {
  return {
    description: message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: status },
            message: { type: 'string', example: message },
            error: { type: 'string', example: message },
          },
        },
      },
    },
  };
}

/**
 * HTTP status text map for common error codes.
 */
export const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

/**
 * Get default description for any HTTP status code.
 *
 * @param status - HTTP status code
 * @returns Human-readable status text
 *
 * @internal
 */
export function getDefaultMessage(status: number): string {
  return HTTP_STATUS_TEXT[status] ?? `Error ${status}`;
}

/**
 * Build a default error response for any HTTP status code.
 *
 * @param status - HTTP status code
 * @returns OpenAPI response object with `description` and `content.application/json.schema`
 *
 * @internal
 */
export function buildDefaultError(status: number): {
  description: string;
  content: Record<string, unknown>;
} {
  const message = getDefaultMessage(status);
  return buildNestErrorResponse(status, message);
}
