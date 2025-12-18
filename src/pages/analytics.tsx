import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MetricCard } from '@/components/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  useGetSalesTrendsQuery,
  useGetUserGrowthQuery,
  useGetProductPerformanceQuery,
  useGetMachineUtilizationQuery,
  useGetOrderStatusQuery,
} from '@/store/api/adminApi';
import { DollarSign, Users, Package, Server } from 'lucide-react';

export default function Analytics() {
  const [period, setPeriod] = useState('30d');

  const { data: salesData, isLoading: salesLoading } = useGetSalesTrendsQuery(period);
  const { data: userGrowthData, isLoading: userGrowthLoading } = useGetUserGrowthQuery(period);
  const { data: productData, isLoading: productLoading } = useGetProductPerformanceQuery(10);
  const { data: machineData, isLoading: machineLoading } = useGetMachineUtilizationQuery();
  const { data: orderData, isLoading: orderLoading } = useGetOrderStatusQuery();

  // Calculate totals for metric cards
  const totalRevenue = salesData?.data?.revenue?.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalOrders = salesData?.data?.orders?.reduce((a: number, b: number) => a + b, 0) || 0;
  const totalUsers = userGrowthData?.data?.totalUsers?.[userGrowthData.data.totalUsers.length - 1] || 0;
  const activeMachines = machineData?.data?.active || 0;

  // Prepare chart data
  const salesChartData = salesData?.data?.dates?.map((date: string, index: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: salesData.data.revenue[index],
    orders: salesData.data.orders[index],
  })) || [];

  const userGrowthChartData = userGrowthData?.data?.dates?.map((date: string, index: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    newUsers: userGrowthData.data.newUsers[index],
    totalUsers: userGrowthData.data.totalUsers[index],
  })) || [];

  const productChartData = productData?.data?.map((product: any) => ({
    name: product.name?.substring(0, 20) || 'Unknown',
    sales: product.sales,
    revenue: product.revenue,
  })) || [];

  const machinePieData = [
    { name: 'Active', value: machineData?.data?.active || 0 },
    { name: 'Inactive', value: machineData?.data?.inactive || 0 },
    { name: 'Maintenance', value: machineData?.data?.maintenance || 0 },
  ].filter(item => item.value > 0);

  const orderPieData = Object.entries(orderData?.data || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
  }));

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your business performance
              </p>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              loading={salesLoading}
            />
            <MetricCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              loading={salesLoading}
            />
            <MetricCard
              title="Total Users"
              value={totalUsers.toLocaleString()}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              loading={userGrowthLoading}
            />
            <MetricCard
              title="Active Machines"
              value={activeMachines.toLocaleString()}
              icon={<Server className="h-4 w-4 text-muted-foreground" />}
              loading={machineLoading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sales Trends */}
            {salesLoading ? (
              <Card>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">Loading...</div>
                </CardContent>
              </Card>
            ) : (
              <LineChart
                title="Sales Trends"
                data={salesChartData}
                lines={[
                  { dataKey: 'revenue', stroke: '#3b82f6', name: 'Revenue ($)' },
                  { dataKey: 'orders', stroke: '#10b981', name: 'Orders' },
                ]}
                xAxisKey="date"
              />
            )}

            {/* User Growth */}
            {userGrowthLoading ? (
              <Card>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">Loading...</div>
                </CardContent>
              </Card>
            ) : (
              <LineChart
                title="User Growth"
                data={userGrowthChartData}
                lines={[
                  { dataKey: 'newUsers', stroke: '#8b5cf6', name: 'New Users' },
                  { dataKey: 'totalUsers', stroke: '#ec4899', name: 'Total Users' },
                ]}
                xAxisKey="date"
              />
            )}

            {/* Product Performance */}
            {productLoading ? (
              <Card>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">Loading...</div>
                </CardContent>
              </Card>
            ) : (
              <BarChart
                title="Top Products"
                data={productChartData}
                bars={[
                  { dataKey: 'sales', fill: '#f59e0b', name: 'Sales' },
                  { dataKey: 'revenue', fill: '#06b6d4', name: 'Revenue ($)' },
                ]}
                xAxisKey="name"
              />
            )}

            {/* Machine Utilization */}
            {machineLoading ? (
              <Card>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">Loading...</div>
                </CardContent>
              </Card>
            ) : (
              <PieChart
                title="Machine Status"
                data={machinePieData}
                colors={['#10b981', '#ef4444', '#f59e0b']}
              />
            )}
          </div>

          {/* Order Status */}
          {!orderLoading && orderPieData.length > 0 && (
            <div className="grid gap-6">
              <PieChart
                title="Order Status Breakdown"
                data={orderPieData}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
                height={350}
              />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
