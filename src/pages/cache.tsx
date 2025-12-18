import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetCacheStatsQuery, useClearCacheMutation } from '@/store/api/adminApi';
import { Loader2, Trash2, Database, RefreshCw, AlertTriangle } from 'lucide-react';
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

export default function CachePage() {
  const { data, isLoading, isError, refetch } = useGetCacheStatsQuery(undefined);
  const [clearCache, { isLoading: isClearing }] = useClearCacheMutation();

  const cacheStats = data?.data || {};

  const handleClearCache = async () => {
    try {
      await clearCache(undefined).unwrap();
      toast.success('Cache cleared successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Cache Stats</CardTitle>
          <CardDescription>
            Failed to load cache statistics. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache Management</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage Redis cache</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearing}>
                {isClearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cache
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  Clear all cache?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all cached data from Redis. This action cannot be undone. The
                  application will rebuild the cache as needed, which may temporarily slow down some
                  operations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCache}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All Cache
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Keys */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.keyspace?.keys || 0}</div>
            <p className="text-muted-foreground text-xs">Cached entries</p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Used</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(cacheStats.memory?.used_memory || 0)}
            </div>
            <p className="text-muted-foreground text-xs">Redis memory</p>
          </CardContent>
        </Card>

        {/* Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.stats?.keyspace_hits || 0}</div>
            <p className="text-muted-foreground text-xs">Successful cache lookups</p>
          </CardContent>
        </Card>

        {/* Cache Misses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.stats?.keyspace_misses || 0}</div>
            <p className="text-muted-foreground text-xs">Failed cache lookups</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Statistics</CardTitle>
          <CardDescription>Detailed Redis cache information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(cacheStats).length > 0 ? (
              <div className="rounded-md border">
                <div className="max-h-96 overflow-auto">
                  <pre className="p-4 text-sm">{JSON.stringify(cacheStats, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                No cache statistics available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">About Cache Management</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            <strong>Cache Purpose:</strong> Redis cache stores frequently accessed data to improve
            application performance.
          </p>
          <p>
            <strong>When to Clear:</strong> Clear cache when you notice stale data, after major
            updates, or during troubleshooting.
          </p>
          <p>
            <strong>Impact:</strong> Clearing cache may temporarily slow down the application as
            data is re-cached.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
