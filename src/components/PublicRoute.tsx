import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { admin, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isInitializing && admin) {
      router.push('/dashboard');
    }
  }, [admin, isInitializing, router]);

  // Show loading while initializing
  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If user is authenticated, show nothing while redirecting
  if (admin) {
    return null;
  }

  return <>{children}</>;
}
