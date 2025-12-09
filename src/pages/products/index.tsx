import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { Eye, Search, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useGetProductsQuery } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';

interface Product {
    product_u_id: string;
    description: string;
    brand_name?: string;
    category?: string;
}

export default function Products() {
    const pagination = usePagination(10);
    const { data, isLoading, error } = useGetProductsQuery(undefined);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const products = data?.data?.products || [];

    // Get unique categories for filter
    const categories = useMemo<string[]>(() => {
        const uniqueCategories = new Set(products.map((p: Product) => p.category).filter(Boolean));
        return Array.from(uniqueCategories) as string[];
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = products;

        if (searchTerm) {
            result = result.filter(
                (product: Product) =>
                    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.product_u_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            result = result.filter((product: Product) => product.category === categoryFilter);
        }

        return result;
    }, [searchTerm, categoryFilter, products]);

    // Paginate products
    const paginatedProducts = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, pagination.page, pagination.limit]);

    useEffect(() => {
        pagination.setTotal(filteredProducts.length);
    }, [filteredProducts.length, pagination]);

    const handleExportCSV = () => {
        exportToCSV(
            filteredProducts,
            `products-${new Date().toISOString().split('T')[0]}.csv`,
            [
                { key: 'product_u_id', label: 'Product ID' },
                { key: 'description', label: 'Description' },
                { key: 'brand_name', label: 'Brand' },
                { key: 'category', label: 'Category' },
            ]
        );
        toast.success('Products exported successfully');
    };

    const handleExportExcel = () => {
        exportToExcel(
            filteredProducts,
            `products-${new Date().toISOString().split('T')[0]}`,
            'Products',
            [
                { key: 'product_u_id', label: 'Product ID' },
                { key: 'description', label: 'Description' },
                { key: 'brand_name', label: 'Brand' },
                { key: 'category', label: 'Category' },
            ]
        );
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
                <div className="flex items-center justify-center h-64">
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
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {categories.length > 0 && (
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category: string) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedProducts.map((product: Product) => (
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

                    {filteredProducts.length > 0 && (
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
