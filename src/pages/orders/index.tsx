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
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { Eye, Search, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useGetOrdersQuery } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatCurrency, formatDate, getStatusVariant } from '@/lib/utils';
import type { Order } from '@/types/api';

export default function Orders() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useGetOrdersQuery({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const orders = data?.data?.orders || [];
  const meta = data?.data?.meta;

  const handleExportCSV = () => {
    exportToCSV(orders, `orders-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'order_id', label: 'Order ID' },
      { key: 'user_name', label: 'Customer' },
      { key: 'total_amount', label: 'Amount', format: (val) => `KWD ${(val as number)?.toFixed(2) || '0.00'}` },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Date', format: (val) => formatDate(val as string | Date) },
    ]);
    toast.success('Orders exported successfully');
  };

  const handleExportExcel = () => {
    exportToExcel(orders, `orders-${new Date().toISOString().split('T')[0]}`, 'Orders', [
      { key: 'order_id', label: 'Order ID' },
      { key: 'user_name', label: 'Customer' },
      { key: 'total_amount', label: 'Amount', format: (val) => `KWD ${(val as number)?.toFixed(2) || '0.00'}` },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Date', format: (val) => formatDate(val as string | Date) },
    ]);
    toast.success('Orders exported successfully');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>
          <TableSkeleton columns={6} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-red-500">Failed to load orders</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: Order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                      <TableCell>{order.user_name || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status || '')}>
                          {order.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/orders/${order.order_id}`}>
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
