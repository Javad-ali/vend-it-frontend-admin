import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && admin) {
      router.push('/dashboard');
    }
  }, [admin, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If user is authenticated, show nothing while redirecting
  if (admin) {
    return null;
  }

  return <>{children}</>;
}
