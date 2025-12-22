import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Box } from 'lucide-react';
import Link from 'next/link';
import { useGetMachineProductsQuery, useGetMachinesQuery } from '@/store/api/adminApi';
import { formatMachineId } from '@/lib/id-format';

// Define the correct type based on API response
interface MachineSlot {
  slot: string;
  quantity: number;
  maxQuantity: number;
  product: {
    id: string;
    description: string;
    image: string;
    brand: string;
    category: string;
  } | null;
}

export default function MachineProducts() {
  const router = useRouter();
  const { id } = router.query;
  
  // Get machine products - API returns { data: { products: [...], machineId: "..." } }
  const { data: productsResponse, isLoading } = useGetMachineProductsQuery(id as string, {
    skip: !id,
  });
  
  // Get machine info for the header
  const { data: machineResponse } = useGetMachinesQuery({ search: id as string }, {
    skip: !id,
  });
  
  // Extract products from nested response structure
  // API response: { success: true, data: { products: [...], machineId: "..." } }
  const products: MachineSlot[] = productsResponse?.data?.products || [];
  const machineInfo = machineResponse?.data?.machines?.[0];

  // Sort by slot number
  const sortedProducts = [...products].sort((a, b) => 
    parseInt(a.slot) - parseInt(b.slot)
  );

  // Calculate stats
  const totalSlots = products.length;
  const emptySlots = products.filter(p => p.quantity === 0).length;
  const lowStockSlots = products.filter(p => p.quantity > 0 && p.quantity <= 2).length;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link href={`/machines/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Machine
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {machineInfo?.machine_name || 'Machine'} Products
              </h1>
              <p className="font-mono text-sm text-gray-500">
                {formatMachineId(id as string)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Slots</p>
                <p className="text-2xl font-bold">{totalSlots}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Empty Slots</p>
                <p className="text-2xl font-bold text-red-600">{emptySlots}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockSlots}</p>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="p-6 text-center">Loading products...</div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((item) => (
                <Card 
                  key={item.slot} 
                  className={`overflow-hidden ${item.quantity === 0 ? 'border-red-200 bg-red-50' : item.quantity <= 2 ? 'border-yellow-200 bg-yellow-50' : ''}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono">
                        Slot {item.slot}
                      </Badge>
                      <Badge 
                        variant={item.quantity === 0 ? 'destructive' : item.quantity <= 2 ? 'secondary' : 'default'}
                      >
                        {item.quantity}/{item.maxQuantity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {item.product ? (
                      <div className="space-y-3">
                        {/* Product Image */}
                        {item.product.image ? (
                          <div className="flex justify-center">
                            <img 
                              src={item.product.image} 
                              alt={item.product.brand}
                              className="h-20 w-20 rounded-lg object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 items-center justify-center">
                            <Package className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Product Info */}
                        <div>
                          <p className="font-medium text-sm line-clamp-2">
                            {item.product.brand}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {item.product.description || 'No description'}
                          </p>
                        </div>
                        
                        {/* Category Badge */}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.product.category}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-gray-400">
                        <Box className="h-8 w-8 mb-2" />
                        <p className="text-sm">No product assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No products assigned to this machine</p>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
