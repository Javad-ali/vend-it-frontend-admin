import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, MapPin, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { useGetOrderDetailsQuery } from '@/store/api/adminApi';
import { formatCurrency, formatDate, getStatusVariant, getStatusLabel } from '@/lib/utils';
import { fetchAndDownloadPdf } from '@/lib/pdf-export';
import { toast } from 'sonner';

export default function OrderDetails() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
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

  if (!order) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <p className="text-gray-500">Order not found</p>
            <Link href="/orders">
              <Button variant="outline" className="mt-4">
                Back to Orders
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
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{order.order_reference}</h1>
                <p className="text-sm text-gray-500">Order Details</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsExportingPdf(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                const result = await fetchAndDownloadPdf(
                  `${API_URL}/admin/export/order-pdf/${id}`,
                  `order-${order.order_reference || id}.pdf`,
                  { method: 'GET' }
                );
                setIsExportingPdf(false);
                if (result.success) {
                  toast.success('Order exported successfully');
                } else {
                  toast.error('Failed to export order');
                }
              }}
              disabled={isExportingPdf || !id}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExportingPdf ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Order Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Order Reference</p>
                  <p className="font-mono text-lg font-bold text-blue-600">
                    {order.order_reference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusVariant(order.status || '')} className="mt-1">
                    {getStatusLabel(order.status || 'Unknown')}
                  </Badge>
                </div>
                {order.transaction_id && (
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-mono text-xs">{order.transaction_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.user_name || 'Guest'}</p>
                </div>
                {order.user_email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.user_email}</p>
                  </div>
                )}
                {order.user_phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.user_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Machine Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <CardTitle>Machine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Machine Tag</p>
                  <p className="font-medium">{order.machine_tag || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{order.machine_location || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.total_amount || 0, order.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                  </div>
                  {order.earned_points > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Points Earned</p>
                      <p className="font-medium text-blue-600">+{order.earned_points} pts</p>
                    </div>
                  )}
                  {order.redeemed_points > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Points Redeemed</p>
                      <p className="font-medium text-orange-600">-{order.redeemed_points} pts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items.map((item: { product_id: string; product_name: string; quantity: number; dispensed_quantity: number; price: number; product_image?: string }, index: number) => (
                    <div key={item.product_id || index} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        {item.product_image ? (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                            {item.dispensed_quantity !== item.quantity && (
                              <span className="ml-2 text-orange-600">
                                (Dispensed: {item.dispensed_quantity})
                              </span>
                            )}
                          </p>
                        </div>
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
