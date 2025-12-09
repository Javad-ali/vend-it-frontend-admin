import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Eye, Ban, Trash2, Search, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useGetUsersQuery, useDeleteUserMutation, useSuspendUserMutation } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types/api';

export default function Users() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Debounce search to avoid too many API calls
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, error } = useGetUsersQuery({
        page,
        limit,
        status: statusFilter !== 'all' ? parseInt(statusFilter) : undefined,
        search: debouncedSearch || undefined
    });

    const [deleteUser] = useDeleteUserMutation();
    const [suspendUser] = useSuspendUserMutation();

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void>;
        variant?: 'default' | 'destructive';
    }>({
        open: false,
        title: '',
        description: '',
        action: async () => { },
    });

    const selection = useBulkSelection<User>();
    const users = data?.data?.users || [];
    const meta = data?.data?.meta;

    const handleSuspend = async (userId: string, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        setConfirmDialog({
            open: true,
            title: `${newStatus === 1 ? 'Unsuspend' : 'Suspend'} User`,
            description: `Are you sure you want to ${newStatus === 1 ? 'unsuspend' : 'suspend'} this user?`,
            variant: newStatus === 1 ? 'default' : 'destructive',
            action: async () => {
                try {
                    await suspendUser({ userId, status: newStatus }).unwrap();
                    toast.success(`User ${newStatus === 1 ? 'unsuspended' : 'suspended'} successfully`);
                } catch (error) {
                    toast.error('Failed to update user status');
                    throw error;
                }
            },
        });
    };

    const handleDelete = async (userId: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete User',
            description: 'Are you sure you want to delete this user? This action cannot be undone.',
            variant: 'destructive',
            action: async () => {
                try {
                    await deleteUser(userId).unwrap();
                    toast.success('User deleted successfully');
                    selection.clearSelection();
                } catch (error) {
                    toast.error('Failed to delete user');
                    throw error;
                }
            },
        });
    };

    const handleBulkDelete = async () => {
        if (selection.selectedCount === 0) return;

        setConfirmDialog({
            open: true,
            title: 'Delete Multiple Users',
            description: `Are you sure you want to delete ${selection.selectedCount} user(s)? This action cannot be undone.`,
            variant: 'destructive',
            action: async () => {
                try {
                    const promises = Array.from(selection.selectedIds).map(id =>
                        deleteUser(id).unwrap()
                    );
                    await Promise.all(promises);
                    toast.success(`Successfully deleted ${selection.selectedCount} user(s)`);
                    selection.clearSelection();
                } catch (error) {
                    toast.error('Failed to delete some users');
                    throw error;
                }
            },
        });
    };

    const handleExportCSV = () => {
        const dataToExport = selection.selectedCount > 0
            ? users.filter((user: User) => selection.isSelected(user.id))
            : users;

        exportToCSV(
            dataToExport,
            `users-${new Date().toISOString().split('T')[0]}.csv`,
            [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status', format: (val) => val === 1 ? 'Active' : 'Suspended' },
                { key: 'createdAt', label: 'Joined', format: (val) => formatDate(val) },
            ]
        );
        toast.success('Users exported successfully');
    };

    const handleExportExcel = () => {
        const dataToExport = selection.selectedCount > 0
            ? users.filter((user: User) => selection.isSelected(user.id))
            : users;

        exportToExcel(
            dataToExport,
            `users-${new Date().toISOString().split('T')[0]}`,
            'Users',
            [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status', format: (val) => val === 1 ? 'Active' : 'Suspended' },
                { key: 'createdAt', label: 'Joined', format: (val) => formatDate(val) },
            ]
        );
        toast.success('Users exported successfully');
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground">Manage registered users</p>
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
                    <div className="text-lg text-red-500">Failed to load users</div>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground">Manage registered users</p>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(val) => {
                                setStatusFilter(val);
                                setPage(1);
                            }}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Excel
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selection.selectedCount > 0 && (
                        <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                            <span className="text-sm font-medium">
                                {selection.selectedCount} user(s) selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selection.clearSelection}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="rounded-md border text-black">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={selection.isAllSelected(users, (u) => u.id)}
                                            onChange={() => selection.toggleAll(users, (u) => u.id)}
                                            className="rounded border-gray-300"
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No users found</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user: User) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selection.isSelected(user.id)}
                                                    onChange={() => selection.toggle(user.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 1 ? 'default' : 'destructive'}>
                                                    {user.status === 1 ? 'Active' : 'Suspended'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(user.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/users/${user.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSuspend(user.id, user.status)}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
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

                    {/* Confirm Dialog */}
                    <ConfirmDialog
                        open={confirmDialog.open}
                        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                        title={confirmDialog.title}
                        description={confirmDialog.description}
                        onConfirm={confirmDialog.action}
                        variant={confirmDialog.variant}
                    />
                </div>
            </Layout>
        </ProtectedRoute>
    );
}