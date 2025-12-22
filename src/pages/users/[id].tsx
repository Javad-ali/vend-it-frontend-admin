import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CreditCard, ShoppingBag, Wallet, Award } from 'lucide-react';
import Link from 'next/link';
import { useGetUserDetailsQuery, useGetOrdersQuery } from '@/store/api/adminApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import { formatUserId } from '@/lib/id-format';

export default function UserDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: userData, isLoading: userLoading, error: userError } = useGetUserDetailsQuery(id as string, {
    skip: !id,
  });
  
  // Fetch orders for this specific user
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery({ limit: 10, userId: id as string }, {
    skip: !id,
  });
  
  // Extract user from nested response structure
  const response = userData?.data;
  const user = response?.user;
  const history = response?.history || [];

  if (userLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (userError || !user) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <p className="text-gray-500">User not found</p>
            <Link href="/users">
              <Button variant="outline" className="mt-4">
                Back to Users
              </Button>
            </Link>
          </div>
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
            <div>
              <h1 className="text-3xl font-bold">{user.name || 'Unknown User'}</h1>
              <p className="text-sm text-gray-500">{formatUserId(user.id)}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-medium">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{user.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={user.status === 1 ? 'default' : 'destructive'} className="mt-1">
                    {user.status === 1 ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">OTP Verified</p>
                  <Badge variant={user.isOtpVerified ? 'default' : 'secondary'} className="mt-1">
                    {user.isOtpVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Wallet & Loyalty */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Wallet className="h-5 w-5 text-green-500" />
                <CardTitle>Wallet & Loyalty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(user.wallet || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {user.loyalty || 0} pts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase History Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-purple-500" />
                <CardTitle>Purchase History ({history.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {history.slice(0, 10).map((purchase: any) => (
                      <li key={purchase.id} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="text-sm text-gray-600">
                            {purchase.machine?.machine_tag || 'Unknown Machine'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(purchase.created_at)}
                          </p>
                        </div>
                        <span className="font-medium text-green-600">
                          {formatCurrency(purchase.amount || 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No purchase history</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Section */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <CardTitle>Recent Orders</CardTitle>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm">View All Orders</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : orders?.data?.orders && orders.data.orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.data.orders.slice(0, 5).map((order: any) => (
                    <Link 
                      key={order.order_id} 
                      href={`/orders/${order.order_id}`}
                      className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium text-blue-600">
                          {order.order_reference}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user_name} • {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total_amount || 0)}</p>
                        <Badge variant={order.status === 'CAPTURED' ? 'default' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No orders found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
