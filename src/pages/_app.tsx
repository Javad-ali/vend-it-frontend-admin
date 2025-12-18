// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackWebVitals, sendToAnalytics, trackPageView } from '@/lib/analytics';
import { monitoring } from '@/lib/monitoring';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize monitoring once
    monitoring.init();

    // Track Web Vitals
    trackWebVitals(sendToAnalytics);
  }, []);

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className={inter.variable}>
              <Component {...pageProps} />
              <Toaster position="top-right" />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}
