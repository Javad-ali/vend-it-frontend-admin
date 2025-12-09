import { useMemo, useState } from 'react';
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
import { toast } from 'sonner';
import { Eye, Ban, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { useGetUsersQuery, useDeleteUserMutation, useSuspendUserMutation } from '@/store/api/adminApi';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: number;
    createdAt: string;
}

export default function Users() {
    const { data, isLoading, error } = useGetUsersQuery(undefined);
    const [deleteUser] = useDeleteUserMutation();
    const [suspendUser] = useSuspendUserMutation();

    const [searchTerm, setSearchTerm] = useState('');

    const users = data?.data?.users || [];

    // Use useMemo instead of useEffect to filter users
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;

        return users.filter(
            (user: User) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    const handleSuspend = async (userId: string, currentStatus: number) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await suspendUser({ userId, status: newStatus }).unwrap();
            toast.success(`User ${newStatus === 1 ? 'unsuspended' : 'suspended'} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId).unwrap();
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
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

                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border text-black">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user: User) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 1 ? 'default' : 'destructive'}>
                                                    {user.status === 1 ? 'Active' : 'Suspended'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
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
                </div>
            </Layout>
        </ProtectedRoute>
    );
}