import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Server, MapPin, Package, Box } from 'lucide-react';
import Link from 'next/link';
import { useGetMachinesQuery, useGetMachineProductsQuery } from '@/store/api/adminApi';
import { formatMachineId } from '@/lib/id-format';
import { getStatusVariant } from '@/lib/utils';

export default function MachineDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: machineResponse, isLoading: machineLoading } = useGetMachinesQuery({ search: id as string }, {
    skip: !id,
  });
  
  const machine = machineResponse?.data?.machines?.[0];
  
  const { data: productsData, isLoading: productsLoading } = useGetMachineProductsQuery(id as string, {
    skip: !id,
  });
  
  const products = productsData?.data?.products || [];

  if (machineLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!machine) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6 text-center">
            <p className="text-gray-500">Machine not found</p>
            <Link href="/machines">
              <Button variant="outline" className="mt-4">
                Back to Machines
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
            <Link href="/machines">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Machines
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{machine.machine_name || 'Machine Details'}</h1>
              <p className="font-mono text-sm text-gray-500">
                {formatMachineId(machine.machine_u_id)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                <CardTitle>Machine Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Machine Name</p>
                  <p className="text-lg font-medium">{machine.machine_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Machine ID</p>
                  <p className="font-mono text-sm text-gray-600">
                    {formatMachineId(machine.machine_u_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusVariant(machine.status || '')} className="mt-1">
                    {machine.status || 'Unknown'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{machine.location || 'No location specified'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Products in Machine */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                <CardTitle>Products ({products.length})</CardTitle>
              </div>
              {products.length > 5 && (
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
              ) : products.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.slice(0, 6).map((item: any) => (
                    <div 
                      key={item.slot} 
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                        <Box className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.product?.description || 'Unknown Product'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Slot {item.slot}</span>
                          <span>•</span>
                          <span className={item.quantity <= 5 ? 'text-red-500' : ''}>
                            Stock: {item.quantity}/{item.maxQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products assigned to this machine</p>
              )}
              
              {products.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/machines/${id}/products`}>
                    <Button variant="link" className="w-full">
                      View All Products →
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
