import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { useGetDashboardQuery } from '@/store/api/adminApi';
import { Users, ShoppingCart, DollarSign, Server } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

// Temporarily disabled chart imports due to missing components
// const RevenueChart = dynamic(
//   () =>
//     import('@/components/dashboard/RevenueChart').then((mod) => ({ default: mod.RevenueChart })),
//   {
//     loading: () => <CardSkeleton count={1} />,
//     ssr: false, // Charts don't need SSR
//   }
// );

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboardQuery(undefined);

  const metrics = useMemo(() => data?.data?.metrics, [data]);

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Vend-IT Admin Panel</p>
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

          {/* Charts temporarily disabled - components not found */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                Dashboard charts will be implemented soon
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
