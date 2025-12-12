// Error monitoring and tracking setup
// Ready for Sentry integration

export interface ErrorContext {
  [key: string]: unknown;
}

export interface UserContext {
  id?: string;
  email?: string;
  name?: string;
}

class Monitoring {
  private isInitialized = false;

  /**
   * Initialize error monitoring
   * Call this once in _app.tsx
   */
  init() {
    if (this.isInitialized) return;

    // Sentry initialization (add your DSN)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production') {
      // Example Sentry init:
      // Sentry.init({
      //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 1.0,
      // });
      
      console.log('[Monitoring] Sentry initialized');
    }

    this.isInitialized = true;
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Monitoring] Exception:', error, context);
      return;
    }

    // Send to Sentry or your error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Monitoring] ${level.toUpperCase()}:`, message, context);
      return;
    }

    // Send to Sentry or your error tracking service
    // Example: Sentry.captureMessage(message, { level, extra: context });
  }

  /**
   * Set user context for error reports
   */
  setUser(user: UserContext | null) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring] User context set:', user);
      return;
    }

    // Set user in Sentry
    // Example: Sentry.setUser(user);
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring] Breadcrumb:', message, data);
      return;
    }

    // Add breadcrumb to Sentry
    // Example: Sentry.addBreadcrumb({ message, data });
  }

  /**
   * Track performance
   */
  trackPerformance(name: string, duration: number, metadata?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring] Performance:', name, `${duration}ms`, metadata);
      return;
    }

    // Send to your performance monitoring service
  }
}

export const monitoring = new Monitoring();

// Helper to wrap async functions with error tracking
export function withMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      monitoring.captureException(error as Error, context);
      throw error;
    }
  }) as T;
}
