// Web Vitals tracking and analytics
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface AnalyticsEvent {
  name: string;
  value: number;
  id: string;
  delta?: number;
}

// Track Web Vitals
export function trackWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry); // INP replaces FID in web-vitals v4
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

// Send metric to analytics endpoint
export function sendToAnalytics(metric: Metric) {
  const body: AnalyticsEvent = {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    id: metric.id,
    delta: metric.delta,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', body);
  }

  // In production, send to your analytics service
  // Example: Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Example: Custom analytics endpoint
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  }
}

// Track custom events
export function trackEvent(eventName: string, eventData?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Event]', eventName, eventData);
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }
}

// Extended window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}
