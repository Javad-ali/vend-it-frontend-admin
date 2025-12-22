import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useGetProductDetailsQuery } from '@/store/api/adminApi';
import { formatCurrency } from '@/lib/utils';
import { formatProductId } from '@/lib/id-format';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: productData, isLoading, error } = useGetProductDetailsQuery(id as string, {
    skip: !id,
  });
  
  // Extract product from nested response: { success: true, data: { product: {...} } }
  const product = productData?.data?.product;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !product) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <p className="text-gray-500">Product not found</p>
            <Link href="/products">
              <Button variant="outline" className="mt-4">
                Back to Products
              </Button>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Extract category from nested structure
  const categoryName = product.category?.category_name || 'Uncategorized';

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
            <div>
              <h1 className="text-3xl font-bold">{product.description || 'Product Details'}</h1>
              <p className="font-mono text-sm text-gray-500">
                {formatProductId(product.product_u_id)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Image */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[200px]">
                {product.product_image_url ? (
                  <img 
                    src={product.product_image_url} 
                    alt={product.description}
                    className="max-h-64 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-lg font-medium">{product.description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">{product.brand_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <Badge variant="secondary" className="mt-1">
                    {categoryName}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-mono text-xs text-gray-600">
                    {formatProductId(product.product_u_id)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-500" />
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(product.unit_price || 0)}
                  </p>
                </div>
                {product.cost_price && (
                  <div>
                    <p className="text-sm text-gray-500">Cost Price</p>
                    <p className="font-medium text-gray-600">
                      {formatCurrency(product.cost_price)}
                    </p>
                  </div>
                )}
                {product.unit_price && product.cost_price && (
                  <div>
                    <p className="text-sm text-gray-500">Profit Margin</p>
                    <p className="font-medium text-blue-600">
                      {(((product.unit_price - product.cost_price) / product.unit_price) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-500" />
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(product.metadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detail Image if different */}
          {product.product_detail_image_url && product.product_detail_image_url !== product.product_image_url && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detail Image</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img 
                  src={product.product_detail_image_url} 
                  alt={`${product.description} detail`}
                  className="max-h-96 rounded-lg object-contain"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
