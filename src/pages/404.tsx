import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <div className="mt-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Page Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
