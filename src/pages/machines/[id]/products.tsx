import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetMachineProductsQuery } from '@/store/api/adminApi';
import { formatCurrency } from '@/lib/utils';

export default function MachineProducts() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: products, isLoading } = useGetMachineProductsQuery(id as string, {
    skip: !id,
  });

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Link href={`/machines/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Machine
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Machine Products</h1>
          </div>

          {isLoading ? (
            <div className="p-6">Loading products...</div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: { id: string; name: string; price: number; stock: number; status: number }) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Stock</span>
                      <span className="font-medium">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge variant={product.status === 1 ? 'default' : 'destructive'}>
                        {product.status === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">No products assigned to this machine</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
