import dynamic from 'next/dynamic';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { Button } from '@/components/ui/button';
import { useGetDashboardQuery, useGetChartDataQuery } from '@/store/api/adminApi';
import { Users, ShoppingCart, DollarSign, Server, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchAndDownloadPdf } from '@/lib/pdf-export';
import { toast } from 'sonner';
import { useMemo } from 'react';

// Lazy load chart components for better performance
const RevenueChart = dynamic(
  () =>
    import('@/components/dashboard/RevenueChart').then((mod) => ({ default: mod.RevenueChart })),
  {
    loading: () => <CardSkeleton count={1} />,
    ssr: false, // Charts don't need SSR
  }
);

const OrdersChart = dynamic(
  () => import('@/components/dashboard/OrdersChart').then((mod) => ({ default: mod.OrdersChart })),
  {
    loading: () => <CardSkeleton count={1} />,
    ssr: false,
  }
);

const UserGrowthChart = dynamic(
  () =>
    import('@/components/dashboard/UserGrowthChart').then((mod) => ({
      default: mod.UserGrowthChart,
    })),
  {
    loading: () => <CardSkeleton count={1} />,
    ssr: false,
  }
);

const MachineStatusChart = dynamic(
  () =>
    import('@/components/dashboard/MachineStatusChart').then((mod) => ({
      default: mod.MachineStatusChart,
    })),
  {
    loading: () => <CardSkeleton count={1} />,
    ssr: false,
  }
);

export default function Dashboard() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { data, isLoading, error } = useGetDashboardQuery(undefined);
  const { data: chartData, isLoading: chartsLoading } = useGetChartDataQuery(undefined);

  const metrics = useMemo(() => data?.data?.metrics, [data]);

  // Memoize chart data to prevent unnecessary recalculations
  const charts = useMemo(
    () => ({
      revenue: chartData?.data?.charts?.revenue || [],
      orders: chartData?.data?.charts?.orders || [],
      userGrowth: chartData?.data?.charts?.userGrowth || [],
      machineStatus: chartData?.data?.charts?.machineStatus || [],
    }),
    [chartData]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Vend-IT Admin Panel</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton count={4} />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-red-500">Failed to load dashboard</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to Vend-IT Admin Panel</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsExportingPdf(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                const result = await fetchAndDownloadPdf(
                  `${API_URL}/admin/export/dashboard-pdf`,
                  `dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
                  { method: 'POST' }
                );
                setIsExportingPdf(false);
                if (result.success) {
                  toast.success('Dashboard exported successfully');
                } else {
                  toast.error('Failed to export dashboard');
                }
              }}
              disabled={isExportingPdf}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExportingPdf ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                <p className="text-muted-foreground text-xs">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
                <p className="text-muted-foreground text-xs">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.totalRevenue || 0)}
                </div>
                <p className="text-muted-foreground text-xs">Total earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
                <Server className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeMachines || 0}</div>
                <p className="text-muted-foreground">Vending machines</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid - Only render if data is loaded */}
          {!chartsLoading && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RevenueChart data={charts.revenue} />
                <MachineStatusChart data={charts.machineStatus} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OrdersChart data={charts.orders} />
                <UserGrowthChart data={charts.userGrowth} />
              </div>
            </>
          )}

          {/* Show skeleton while charts loading */}
          {chartsLoading && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <CardSkeleton count={2} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <CardSkeleton count={2} />
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
