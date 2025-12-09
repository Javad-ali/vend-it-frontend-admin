import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface Order {
    order_id: string;
    user_name?: string;
    total_amount?: number;
    status?: string;
    created_at: string;
}

export default function Orders() {
    const pagination = usePagination(10);
    const { data, isLoading, error } = useGetOrdersQuery(undefined);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const orders = data?.data?.orders || [];

    // Filter orders
    const filteredOrders = useMemo(() => {
        let result = orders;

        if (searchTerm) {
            result = result.filter(
                (order: Order) =>
                    order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter((order: Order) => order.status?.toLowerCase() === statusFilter);
        }

        return result;
    }, [searchTerm, statusFilter, orders]);

    // Paginate orders
    const paginatedOrders = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return filteredOrders.slice(startIndex, endIndex);
    }, [filteredOrders, pagination.page, pagination.limit]);

    useEffect(() => {
        pagination.setTotal(filteredOrders.length);
    }, [filteredOrders.length, pagination]);

    const handleExportCSV = () => {
        exportToCSV(
            filteredOrders,
            `orders-${new Date().toISOString().split('T')[0]}.csv`,
            [
                { key: 'order_id', label: 'Order ID' },
                { key: 'user_name', label: 'Customer' },
                { key: 'total_amount', label: 'Amount', format: (val) => `KWD ${val?.toFixed(2) || '0.00'}` },
                { key: 'status', label: 'Status' },
                { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
            ]
        );
        toast.success('Orders exported successfully');
    };

    const handleExportExcel = () => {
        exportToExcel(
            filteredOrders,
            `orders-${new Date().toISOString().split('T')[0]}`,
            'Orders',
            [
                { key: 'order_id', label: 'Order ID' },
                { key: 'user_name', label: 'Customer' },
                { key: 'total_amount', label: 'Amount', format: (val) => `KWD ${val?.toFixed(2) || '0.00'}` },
                { key: 'status', label: 'Status' },
                { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
            ]
        );
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
                <div className="flex items-center justify-center h-64">
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
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <Filter className="h-4 w-4 mr-2" />
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
                                <Download className="h-4 w-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportExcel}>
                                <Download className="h-4 w-4 mr-2" />
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
                                {paginatedOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedOrders.map((order: Order) => (
                                        <TableRow key={order.order_id}>
                                            <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                                            <TableCell>{order.user_name || 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(order.total_amount || 0)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status || '')}>
                                                    {order.status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.created_at)}
                                            </TableCell>
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

                    {filteredOrders.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.setPage}
                            itemsPerPage={pagination.limit}
                            onItemsPerPageChange={pagination.setLimit}
                        />
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
