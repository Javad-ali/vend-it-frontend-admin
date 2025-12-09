import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (!admin) {
    return null;
  }
  return <>{children}</>;
}
