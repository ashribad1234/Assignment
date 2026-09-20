/**
 * Custom Error Class for Media SDK operations
 */

export type ErrorKind =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN';

export class MediaError extends Error {
  public readonly kind: ErrorKind;
  public readonly statusCode?: number;
  public readonly rawError?: unknown;

  constructor(
    message: string,
    kind: ErrorKind,
    statusCode?: number,
    rawError?: unknown
  ) {
    super(message);
    this.name = 'MediaError';
    this.kind = kind;
    this.statusCode = statusCode;
    this.rawError = rawError;

    // Restore prototype chain for ES5 / custom Error inheritance
    Object.setPrototypeOf(this, MediaError.prototype);
  }

  public static fromHttpResponse(status: number, message?: string): MediaError {
    switch (status) {
      case 401:
      case 403:
        return new MediaError(
          message || 'Unauthorized or invalid API key.',
          'UNAUTHORIZED',
          status
        );
      case 404:
        return new MediaError(
          message || 'Requested media resource not found.',
          'NOT_FOUND',
          status
        );
      case 429:
        return new MediaError(
          message || 'Pexels API rate limit exceeded.',
          'RATE_LIMITED',
          status
        );
      default:
        if (status >= 500) {
          return new MediaError(
            message || 'Pexels server error.',
            'SERVER_ERROR',
            status
          );
        }
        return new MediaError(
          message || `HTTP Request failed with status ${status}`,
          'UNKNOWN',
          status
        );
    }
  }

  public static network(error: unknown): MediaError {
    const msg = error instanceof Error ? error.message : 'Network request failed';
    return new MediaError(msg, 'NETWORK_ERROR', undefined, error);
  }

  public static parse(error: unknown): MediaError {
    const msg = error instanceof Error ? error.message : 'Failed to parse response payload';
    return new MediaError(msg, 'PARSE_ERROR', undefined, error);
  }
}
