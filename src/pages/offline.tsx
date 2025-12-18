import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

     
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      router.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-8 w-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">You&apos;re Offline</CardTitle>
          <CardDescription>
            {isOnline
              ? 'Connection restored! You can retry now.'
              : 'It looks like you lost your internet connection.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="mb-2">While you&lsquo;re offline:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Previously visited pages may still be accessible</li>
              <li>New data won&apos;t load until you&apos;re back online</li>
              <li>Changes won&apos;t be saved until connection is restored</li>
            </ul>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm">
            <div
              className={`h-3 w-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}
            />
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <Button onClick={handleRetry} className="w-full" disabled={!isOnline}>
            {isOnline ? 'Retry' : 'Waiting for connection...'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
