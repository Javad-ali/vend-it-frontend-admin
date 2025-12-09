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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Download, Filter } from 'lucide-react';
import { useGetCampaignsQuery, useCreateCampaignMutation, useUpdateCampaignMutation, useDeleteCampaignMutation } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate, getStatusVariant } from '@/lib/utils';

interface Campaign {
    id: string;
    title: string;
    description?: string;
    start_at?: string;
    end_at?: string;
    image_url?: string;
}

export default function Campaigns() {
    const pagination = usePagination(10);
    const { data, isLoading, error } = useGetCampaignsQuery(undefined);
    const [createCampaign] = useCreateCampaignMutation();
    const [updateCampaign] = useUpdateCampaignMutation();
    const [deleteCampaign] = useDeleteCampaignMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', action: async () => { } });

    const [formData, setFormData] = useState({ title: '', description: '', start_at: '', end_at: '', image: null as File | null });

    const campaigns = data?.data?.campaigns || [];

    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return campaigns;
        return campaigns.filter((c: Campaign) =>
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, campaigns]);

    const paginatedCampaigns = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        return filteredCampaigns.slice(startIndex, startIndex + pagination.limit);
    }, [filteredCampaigns, pagination.page, pagination.limit]);

    useEffect(() => {
        pagination.setTotal(filteredCampaigns.length);
    }, [filteredCampaigns.length, pagination]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('start_at', formData.start_at);
        formDataToSend.append('end_at', formData.end_at);
        if (formData.image) formDataToSend.append('image', formData.image);

        try {
            if (editingCampaign) {
                await updateCampaign({ id: editingCampaign.id, formData: formDataToSend }).unwrap();
                toast.success('Campaign updated successfully');
            } else {
                await createCampaign(formDataToSend).unwrap();
                toast.success('Campaign created successfully');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error(editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Campaign',
            description: 'Are you sure you want to delete this campaign? This action cannot be undone.',
            action: async () => {
                try {
                    await deleteCampaign(id).unwrap();
                    toast.success('Campaign deleted successfully');
                } catch (error) {
                    toast.error('Failed to delete campaign');
                    throw error;
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', start_at: '', end_at: '', image: null });
        setEditingCampaign(null);
    };

    const openEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({ title: campaign.title, description: campaign.description || '', start_at: campaign.start_at || '', end_at: campaign.end_at || '', image: null });
        setIsDialogOpen(true);
    };

    const handleExportCSV = () => {
        exportToCSV(filteredCampaigns, `campaigns-${new Date().toISOString().split('T')[0]}.csv`, [
            { key: 'title', label: 'Title' },
            { key: 'description', label: 'Description' },
            { key: 'start_at', label: 'Start Date', format: (val) => formatDate(val) },
            { key: 'end_at', label: 'End Date', format: (val) => formatDate(val) },
        ]);
        toast.success('Campaigns exported successfully');
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Campaigns</h1>
                    <TableSkeleton columns={4} rows={10} />
                </div>
            </Layout>
        );
    }

    if (error) return <Layout><div className="text-red-500">Failed to load campaigns</div></Layout>;

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Campaigns</h1>
                            <p className="text-muted-foreground">Manage marketing campaigns</p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{editingCampaign ? 'Edit' : 'Create'} Campaign</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label>Title</Label>
                                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Start Date</Label>
                                                <Input type="date" value={formData.start_at} onChange={(e) => setFormData({ ...formData, start_at: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label>End Date</Label>
                                                <Input type="date" value={formData.end_at} onChange={(e) => setFormData({ ...formData, end_at: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Image</Label>
                                            <ImageUpload value={formData.image || undefined} onChange={(file) => setFormData({ ...formData, image: file })} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">{editingCampaign ? 'Update' : 'Create'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Input placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />CSV
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCampaigns.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">No campaigns found</TableCell></TableRow>
                                ) : (
                                    paginatedCampaigns.map((campaign: Campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium">{campaign.title}</TableCell>
                                            <TableCell>{campaign.description || 'N/A'}</TableCell>
                                            <TableCell>{campaign.start_at ? formatDate(campaign.start_at) : 'N/A'}</TableCell>
                                            <TableCell>{campaign.end_at ? formatDate(campaign.end_at) : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(campaign)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)}>
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

                    {filteredCampaigns.length > 0 && (
                        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={pagination.setPage} itemsPerPage={pagination.limit} onItemsPerPageChange={pagination.setLimit} />
                    )}

                    <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={confirmDialog.action} variant="destructive" />
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
