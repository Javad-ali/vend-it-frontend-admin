// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function MyApp({ Component, pageProps }: AppProps) {
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
