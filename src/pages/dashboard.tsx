import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { useGetDashboardQuery, useGetChartDataQuery } from '@/store/api/adminApi';
import { Users, ShoppingCart, DollarSign, Server } from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { UserGrowthChart } from '@/components/dashboard/UserGrowthChart';
import { MachineStatusChart } from '@/components/dashboard/MachineStatusChart';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboardQuery(undefined);
  const { data: chartData, isLoading: chartsLoading } = useGetChartDataQuery(undefined);
  const metrics = data?.data?.metrics;

  // Get chart data from API
  const revenueData = chartData?.data?.charts?.revenue || [];
  const ordersData = chartData?.data?.charts?.orders || [];
  const userGrowthData = chartData?.data?.charts?.userGrowth || [];
  const machineStatusData = chartData?.data?.charts?.machineStatus || [];

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
        <div className="flex items-center justify-center h-64">
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
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeMachines || 0}</div>
                <p className="text-xs text-muted-foreground">Vending machines</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <RevenueChart data={revenueData} />
            <MachineStatusChart data={machineStatusData} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <OrdersChart data={ordersData} />
            <UserGrowthChart data={userGrowthData} />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}