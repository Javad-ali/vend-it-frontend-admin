import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetOrderDetailsQuery } from '@/store/api/adminApi';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: orderData, isLoading } = useGetOrderDetailsQuery(id as string, {
    skip: !id,
  });
  
  const order = orderData?.data;

  if (isLoading) {
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
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-medium">{order?.order_id || id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{order?.user_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{order?.created_at ? formatDate(order.created_at) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={order?.status === 'completed' ? 'default' : order?.status === 'pending' ? 'secondary' : 'destructive'}>
                    {order?.status || 'Unknown'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(order?.total_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{order?.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge variant={order?.payment_status === 'paid' ? 'default' : 'destructive'}>
                    {order?.payment_status || 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {order?.items && order.items.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item: { id: string; product_name: string; quantity: number; price: number }) => (
                    <div key={item.id} className="flex justify-between border-b py-2">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
