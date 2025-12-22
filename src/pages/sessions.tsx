import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetSessionQuery, useRevokeAllSessionsMutation } from '@/store/api/adminApi';
import { Loader2, Monitor, Smartphone, LogOut, AlertTriangle, Check } from 'lucide-react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SessionsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetSessionQuery(undefined);
  const [revokeAll, { isLoading: isRevoking }] = useRevokeAllSessionsMutation();

  const sessions = data?.data?.sessions || [];
  const currentSession = sessions.find((s: any) => s.isCurrent);
  const otherSessions = sessions.filter((s: any) => !s.isCurrent);

  const handleRevokeAll = async () => {
    try {
      await revokeAll(undefined).unwrap();
      toast.success('All sessions revoked successfully');
      // User will be logged out, redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getDeviceIcon = (deviceInfo: string) => {
    return deviceInfo === 'mobile' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Sessions</CardTitle>
              <CardDescription>Failed to load your active sessions. Please try again later.</CardDescription>
            </CardHeader>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your active login sessions across all devices
          </p>
        </div>
        
        {sessions.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isRevoking}>
                {isRevoking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout All Devices
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Logout from all devices?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will end all active sessions and log you out from all devices including this one.
                  You will need to login again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Logout All Devices
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid gap-4">
        {/* Current Session */}
        {currentSession && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(currentSession.deviceInfo)}
                  <div>
                    <CardTitle className="text-lg">Current Session</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Check className="h-4 w-4 text-green-600" />
                      This device
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Device Type</p>
                  <p className="font-medium capitalize">{currentSession.deviceInfo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Browser</p>
                  <p className="font-medium">{getBrowserInfo(currentSession.userAgent)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono text-xs">{currentSession.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Login Time</p>
                  <p className="font-medium">{formatDate(currentSession.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold mt-6">
              Other Active Sessions ({otherSessions.length})
            </h2>
            {otherSessions.map((session: any) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.deviceInfo)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {session.deviceInfo === 'mobile' ? 'Mobile Device' : 'Desktop/Web'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getBrowserInfo(session.userAgent)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-mono text-xs">{session.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Login Time</p>
                      <p className="font-medium">{formatDate(session.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Other Sessions</CardTitle>
                <CardDescription>
                  You are only logged in on this device
                </CardDescription>
              </CardHeader>
            </Card>
          )
        )}

        {sessions.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Active Sessions</CardTitle>
              <CardDescription>
                You don't have any active sessions
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Security Note */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Security Tip</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            If you see any sessions you don't recognize, logout from all devices immediately and change your password.
            Sessions expire automatically after 30 days of inactivity.
          </p>
        </CardContent>
      </Card>
    </div>
    </Layout>
    </ProtectedRoute>
  );
}
