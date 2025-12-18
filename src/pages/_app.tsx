// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { trackWebVitals, sendToAnalytics, trackPageView } from '@/lib/analytics';
import { monitoring } from '@/lib/monitoring';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onShowHelp: () => setShowShortcuts(true),
    onLogout: logout,
    enabled: router.pathname !== '/login', // Disable on login page
  });

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
    <div className={inter.variable}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppContent {...props} />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}
