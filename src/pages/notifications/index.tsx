import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { toast } from 'sonner';
import { Search, Filter, Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation } from '@/store/api/adminApi';
import { formatDate } from '@/lib/utils';
import type { Notification } from '@/types/api';

export default function Notifications() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [readFilter, setReadFilter] = useState<string>('all');

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, error, refetch } = useGetNotificationsQuery({
        page,
        limit,
        read: readFilter !== 'all' ? readFilter === 'read' : undefined,
        search: debouncedSearch || undefined
    });

    const [markAsRead] = useMarkNotificationAsReadMutation();

    const notifications = data?.data?.notifications || [];
    const meta = data?.data?.meta;
    const unreadCount = data?.data?.unreadCount || 0;

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id).unwrap();
            toast.success('Notification marked as read');
            refetch();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-l-green-500';
            case 'error':
                return 'border-l-red-500';
            case 'warning':
                return 'border-l-yellow-500';
            default:
                return 'border-l-blue-500';
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Notifications</h1>
                        <p className="text-muted-foreground">
                            Stay updated with system alerts and important events
                        </p>
                    </div>
                    <CardSkeleton count={5} />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">Failed to load notifications</div>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Notifications</h1>
                            <p className="text-muted-foreground">
                                Stay updated with system alerts and important events
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Badge variant="destructive">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={readFilter} onValueChange={(val) => {
                                setReadFilter(val);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-[160px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>No notifications found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            notifications.map((notif: Notification) => (
                                <Card key={notif.id} className={`overflow-hidden border-l-4 ${getNotificationColor(notif.type)} ${!notif.read ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {notif.title}
                                                    </h3>
                                                    {!notif.read && (
                                                        <Badge variant="default" className="ml-auto">New</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(notif.created_at)}
                                                    </span>
                                                    {!notif.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notif.id)}
                                                            className="text-xs h-auto p-1"
                                                        >
                                                            Mark as read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
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
