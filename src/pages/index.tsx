import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to dashboard...</p>
      </div>
    </ProtectedRoute>
  );
}
