// Error types
export type ErrorType = 'network' | 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'unknown';

export interface ApiError {
  type: ErrorType;
  message: string;
  status?: number;
  details?: unknown;
}

// Parse RTK Query errors
export function parseApiError(error: unknown): ApiError {
  // RTK Query error
  if (error && typeof error === 'object' && 'status' in error) {
    const rtkError = error as { status: number | string; data?: { message?: string; error?: string } };
    
    if (typeof rtkError.status === 'number') {
      switch (rtkError.status) {
        case 401:
          return {
            type: 'authentication',
            message: 'Please log in to continue',
            status: 401,
          };
        case 403:
          return {
            type: 'authorization',
            message: 'You do not have permission to perform this action',
            status: 403,
          };
        case 404:
          return {
            type: 'not_found',
            message: 'The requested resource was not found',
            status: 404,
          };
        case 422:
          return {
            type: 'validation',
            message: rtkError.data?.message || 'Validation error',
            status: 422,
            details: rtkError.data,
          };
        case 500:
        case 502:
        case 503:
          return {
            type: 'server',
            message: 'Server error. Please try again later',
            status: rtkError.status,
          };
        default:
          return {
            type: 'unknown',
            message: rtkError.data?.message || rtkError.data?.error || 'An error occurred',
            status: rtkError.status,
            details: rtkError.data,
          };
      }
    }
    
    if (rtkError.status === 'FETCH_ERROR') {
      return {
        type: 'network',
        message: 'Network error. Please check your connection',
      };
    }
    
    if (rtkError.status === 'PARSING_ERROR') {
      return {
        type: 'validation',
        message: 'Invalid response from server',
      };
    }
  }
  
  // Standard Error
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message,
    };
  }
  
  // Unknown error
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    details: error,
  };
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: ApiError): string {
  // Use custom message if available
  if (error.message && error.type !== 'unknown') {
    return error.message;
  }
  
  // Fallback messages
  switch (error.type) {
    case 'network':
      return 'Unable to connect. Please check your internet connection.';
    case 'authentication':
      return 'Your session has expired. Please log in again.';
    case 'authorization':
      return 'You do not have permission to perform this action.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'not_found':
      return 'The requested item could not be found.';
    case 'server':
      return 'Server error. Our team has been notified.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// Log error for debugging
export function logError(error: ApiError, context?: string): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    ...error,
  };
  
  console.error('[Error]', errorLog);
  
  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   // Sentry.captureException(error);
  // }
}

// Check if error should trigger logout
export function shouldLogout(error: ApiError): boolean {
  return error.type === 'authentication' && error.status === 401;
}
