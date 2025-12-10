import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetProductDetailsQuery } from '@/store/api/adminApi';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: product, isLoading } = useGetProductDetailsQuery(id as string, {
    skip: !id,
  });

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
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Product Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="text-xl font-bold">{product?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{product?.description || 'No description available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product?.category_name || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={product?.status === 1 ? 'default' : 'destructive'}>
                    {product?.status === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(product?.price || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Quantity</p>
                  <p className="text-xl font-medium">{product?.stock || 0} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Status</p>
                  <Badge variant={(product?.stock || 0) > 10 ? 'default' : (product?.stock || 0) > 0 ? 'secondary' : 'destructive'}>
                    {(product?.stock || 0) > 10 ? 'In Stock' : (product?.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
