import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetMachinesQuery, useGetMachineProductsQuery } from '@/store/api/adminApi';

export default function MachineDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: machineResponse, isLoading: machineLoading } = useGetMachinesQuery({ search: id as string }, {
    skip: !id,
  });
  
  const machine = machineResponse?.data?.machines?.[0];
  
  const { data: products, isLoading: productsLoading } = useGetMachineProductsQuery(id as string, {
    skip: !id,
  });

  if (machineLoading) {
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
            <Link href="/machines">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Machines
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Machine Details</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Machine ID</p>
                  <p className="font-medium">{machine?.machine_u_id || id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Machine Name</p>
                  <p className="font-medium">{machine?.machine_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{machine?.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={machine?.status === 'active' ? 'default' : 'destructive'}>
                    {machine?.status || 'Unknown'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products ({products?.length || 0})</CardTitle>
                {products && products.length > 5 && (
                  <Link href={`/machines/${id}/products`}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : products && products.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {products.slice(0, 5).map((product: { id: string; name: string; stock: number }) => (
                        <li key={product.id} className="flex justify-between border-b pb-2">
                          <span>{product.name}</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                        </li>
                      ))}
                    </ul>
                    {products.length <= 5 && products.length > 0 && (
                      <Link href={`/machines/${id}/products`}>
                        <Button variant="link" className="mt-2 w-full">
                          View All Products
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No products assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
