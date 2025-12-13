import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerCrash, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ServerCrash className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">500 - Server Error</CardTitle>
          <CardDescription className="text-base">
            Oops! Something went wrong on our end. We&apos;re working to fix it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Our team has been notified and is looking into the issue. Please try again in a few
            moments.
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
