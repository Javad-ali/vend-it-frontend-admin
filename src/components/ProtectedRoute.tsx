import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done initializing and there's no admin
    if (!loading && !isInitializing && !admin) {
      router.push('/login');
    }
  }, [admin, loading, isInitializing, router]);

  // Show loading while initializing or during login
  if (loading || isInitializing) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
