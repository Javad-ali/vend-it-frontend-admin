import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetUserDetailsQuery, useGetOrdersQuery } from '@/store/api/adminApi';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: user, isLoading: userLoading } = useGetUserDetailsQuery(id as string, {
    skip: !id,
  });
  
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery(undefined, {
    skip: !id,
  });

  if (userLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">User Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={user?.status === 1 ? 'default' : 'destructive'}>
                    {user?.status === 1 ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders ({orders?.data?.meta?.total || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : orders?.data?.orders && orders.data.orders.length > 0 ? (
                  <ul className="space-y-2">
                    {orders.data.orders.slice(0, 5).map((order) => (
                      <li key={order.order_id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{order.order_id}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <span className="font-medium">{formatCurrency(order.total_amount || 0)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No orders found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
