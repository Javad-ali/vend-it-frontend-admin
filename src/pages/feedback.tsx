import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { Search, Star, Download, Filter } from 'lucide-react';
import { useGetFeedbackQuery } from '@/store/api/adminApi';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import type { Feedback } from '@/types/api';

export default function Feedback() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, error } = useGetFeedbackQuery({
        page,
        limit,
        search: debouncedSearch || undefined
    });

    const feedback = data?.data?.feedback || [];
    const meta = data?.data?.meta;

    // Client-side rating filter (can be moved to backend if needed)
    const filteredFeedback = ratingFilter !== 'all'
        ? feedback.filter((item: Feedback) => item.rating === parseInt(ratingFilter))
        : feedback;

    const handleExportCSV = () => {
        exportToCSV(filteredFeedback, `feedback-${new Date().toISOString().split('T')[0]}.csv`, [
            { key: 'user_name', label: 'User' },
            { key: 'message', label: 'Message' },
            { key: 'rating', label: 'Rating' },
            { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
        ]);
        toast.success('Feedback exported successfully');
    };

    const handleExportExcel = () => {
        exportToExcel(filteredFeedback, `feedback-${new Date().toISOString().split('T')[0]}`, 'Feedback', [
            { key: 'user_name', label: 'User' },
            { key: 'message', label: 'Message' },
            { key: 'rating', label: 'Rating' },
            { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
        ]);
        toast.success('Feedback exported successfully');
    };

    const getRatingStars = (rating?: number) => {
        if (!rating) return 'N/A';
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
                        <p className="text-muted-foreground">Customer feedback and ratings</p>
                    </div>
                    <TableSkeleton columns={4} rows={10} />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">Failed to load feedback</div>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
                        <p className="text-muted-foreground">Customer feedback and ratings</p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search feedback..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={ratingFilter} onValueChange={(val) => {
                                setRatingFilter(val);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
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
                                    <TableHead>User</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFeedback.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No feedback found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFeedback.map((item: Feedback) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.user_name || 'Anonymous'}</TableCell>
                                            <TableCell className="max-w-md">{item.message}</TableCell>
                                            <TableCell>{getRatingStars(item.rating)}</TableCell>
                                            <TableCell>{formatDate(item.created_at)}</TableCell>
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
