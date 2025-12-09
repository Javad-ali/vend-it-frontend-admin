import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { Eye, Search, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useGetProductsQuery } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import type { Product } from '@/types/api';

export default function Products() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useGetProductsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const products = data?.data?.products || [];
  const meta = data?.data?.meta;

  const handleExportCSV = () => {
    exportToCSV(products, `products-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'product_u_id', label: 'Product ID' },
      { key: 'description', label: 'Description' },
      { key: 'brand_name', label: 'Brand' },
      { key: 'category', label: 'Category' },
    ]);
    toast.success('Products exported successfully');
  };

  const handleExportExcel = () => {
    exportToExcel(products, `products-${new Date().toISOString().split('T')[0]}`, 'Products', [
      { key: 'product_u_id', label: 'Product ID' },
      { key: 'description', label: 'Description' },
      { key: 'brand_name', label: 'Brand' },
      { key: 'category', label: 'Category' },
    ]);
    toast.success('Products exported successfully');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage product catalog</p>
          </div>
          <TableSkeleton columns={5} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-red-500">Failed to load products</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage product catalog</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          <div className="rounded-md border text-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: Product) => (
                    <TableRow key={product.product_u_id}>
                      <TableCell className="font-mono text-sm">{product.product_u_id}</TableCell>
                      <TableCell>{product.description || 'N/A'}</TableCell>
                      <TableCell>{product.brand_name || 'N/A'}</TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/products/${product.product_u_id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {meta && meta.total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              itemsPerPage={limit}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
