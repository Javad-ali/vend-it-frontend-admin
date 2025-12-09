import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
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
import { Server, Search, QrCode } from 'lucide-react';
import Link from 'next/link';

interface Machine {
    machine_u_id: string;
    machine_name: string;
    location?: string;
    status?: string;
}

export default function Machines() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMachines();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = machines.filter(
                (machine) =>
                    machine.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.machine_u_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMachines(filtered);
        } else {
            setFilteredMachines(machines);
        }
    }, [searchTerm, machines]);

    const fetchMachines = async () => {
        try {
            const response = await api.get('/admin/machines');
            setMachines(response.data.data.machines || []);
            setFilteredMachines(response.data.data.machines || []);
        } catch (error) {
            toast.error('Failed to fetch machines');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateQR = async (machineId: string) => {
        try {
            await api.post(`/admin/machines/${machineId}/qr`);
            toast.success('QR code regenerated successfully');
        } catch (error) {
            toast.error('Failed to regenerate QR code');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
                        <p className="text-muted-foreground">Manage vending machines</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search machines..."
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
                                    <TableHead>Machine ID</TableHead>
                                    <TableHead>Machine Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMachines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No machines found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMachines.map((machine) => (
                                        <TableRow key={machine.machine_u_id}>
                                            <TableCell className="font-medium">{machine.machine_u_id}</TableCell>
                                            <TableCell>{machine.machine_name || 'N/A'}</TableCell>
                                            <TableCell>{machine.location || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={machine.status === 'active' ? 'default' : 'secondary'}>
                                                    {machine.status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/machines/${machine.machine_u_id}/products`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Server className="h-4 w-4 mr-1" />
                                                            Products
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRegenerateQR(machine.machine_u_id)}
                                                    >
                                                        <QrCode className="h-4 w-4" />
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
