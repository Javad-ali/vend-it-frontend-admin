import { parseApiError, getUserFriendlyMessage, shouldLogout } from '@/lib/errorHandler';

describe('errorHandler', () => {
  describe('parseApiError', () => {
    it('should parse 401 authentication error', () => {
      const error = { status: 401, data: { message: 'Unauthorized' } };
      const result = parseApiError(error);
      
      expect(result.type).toBe('authentication');
      expect(result.status).toBe(401);
      expect(result.message).toBe('Please log in to continue');
    });

    it('should parse 403 authorization error', () => {
      const error = { status: 403 };
      const result = parseApiError(error);
      
      expect(result.type).toBe('authorization');
      expect(result.status).toBe(403);
    });

    it('should parse 404 not found error', () => {
      const error = { status: 404 };
      const result = parseApiError(error);
      
      expect(result.type).toBe('not_found');
      expect(result.status).toBe(404);
    });

    it('should parse 422 validation error with message', () => {
      const error = { status: 422, data: { message: 'Invalid email format' } };
      const result = parseApiError(error);
      
      expect(result.type).toBe('validation');
      expect(result.message).toBe('Invalid email format');
      expect(result.status).toBe(422);
    });

    it('should parse 500 server error', () => {
      const error = { status: 500 };
      const result = parseApiError(error);
      
      expect(result.type).toBe('server');
      expect(result.status).toBe(500);
    });

    it('should parse FETCH_ERROR as network error', () => {
      const error = { status: 'FETCH_ERROR' };
      const result = parseApiError(error);
      
      expect(result.type).toBe('network');
      expect(result.message).toBe('Network error. Please check your connection');
    });

    it('should parse PARSING_ERROR as validation error', () => {
      const error = { status: 'PARSING_ERROR' };
      const result = parseApiError(error);
      
      expect(result.type).toBe('validation');
      expect(result.message).toBe('Invalid response from server');
    });

    it('should parse standard Error object', () => {
      const error = new Error('Something went wrong');
      const result = parseApiError(error);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const error = { unexpected: 'error' };
      const result = parseApiError(error);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return custom message for known error types', () => {
      const error = { type: 'authentication' as const, message: 'Session expired' };
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe('Session expired');
    });

    it('should return fallback for network error without message', () => {
      const error = { type: 'network' as const, message: '' };
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe('Unable to connect. Please check your internet connection.');
    });

    it('should return fallback for validation error without message', () => {
      const error = { type: 'validation' as const, message: '' };
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe('Please check your input and try again.');
    });

    it('should return fallback for unknown error type', () => {
      const error = { type: 'unknown' as const, message: '' };
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe('Something went wrong. Please try again.');
    });
  });

  describe('shouldLogout', () => {
    it('should return true for 401 authentication error', () => {
      const error = { type: 'authentication' as const, message: 'Unauthorized', status: 401 };
      
      expect(shouldLogout(error)).toBe(true);
    });

    it('should return false for 403 authorization error', () => {
      const error = { type: 'authorization' as const, message: 'Forbidden', status: 403 };
      
      expect(shouldLogout(error)).toBe(false);
    });

    it('should return false for other error types', () => {
      const error = { type: 'network' as const, message: 'Network error' };
      
      expect(shouldLogout(error)).toBe(false);
    });
  });
});
