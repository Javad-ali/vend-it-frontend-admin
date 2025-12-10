import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetCategoryByIdQuery, useGetCategoryProductsQuery } from '@/store/api/adminApi';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function CategoryDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: category, isLoading: categoryLoading } = useGetCategoryByIdQuery(id as string, {
    skip: !id,
  });
  
  const { data: products, isLoading: productsLoading } = useGetCategoryProductsQuery(id as string, {
    skip: !id,
  });

  if (categoryLoading) {
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
            <Link href="/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Category Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Category Name</p>
                  <p className="text-xl font-bold">{category?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{category?.description || 'No description available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={category?.status === 1 ? 'default' : 'destructive'}>
                    {category?.status === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products ({products?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : products && products.length > 0 ? (
                  <ul className="space-y-2">
                    {products.slice(0, 10).map((product: { id: string; name: string; price: number }) => (
                      <li key={product.id} className="flex justify-between border-b pb-2">
                        <span>{product.name}</span>
                        <span className="font-medium">KWD {product.price}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No products in this category</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
