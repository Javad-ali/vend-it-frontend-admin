import { useEffect } from 'react';
import { toast } from 'sonner';
import { parseApiError, getUserFriendlyMessage, logError, shouldLogout, ApiError } from '@/lib/errorHandler';
import { useRouter } from 'next/router';

interface UseApiErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

interface UseApiErrorReturn {
  handleError: (error: unknown, options?: UseApiErrorOptions) => ApiError;
}

export function useApiError(): UseApiErrorReturn {
  const router = useRouter();

  const handleError = (
    error: unknown,
    options: UseApiErrorOptions = {}
  ): ApiError => {
    const {
      showToast = true,
      logToConsole = true,
      context,
    } = options;

    // Parse the error
    const apiError = parseApiError(error);

    // Log error if enabled
    if (logToConsole) {
      logError(apiError, context);
    }

    // Show toast notification
    if (showToast) {
      const message = getUserFriendlyMessage(apiError);
      
      switch (apiError.type) {
        case 'authentication':
        case 'authorization':
          toast.error(message);
          break;
        case 'validation':
          toast.warning(message);
          break;
        case 'network':
        case 'server':
          toast.error(message);
          break;
        default:
          toast.error(message);
      }
    }

    // Handle authentication errors (logout)
    if (shouldLogout(apiError)) {
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }

    return apiError;
  };

  return { handleError };
}
