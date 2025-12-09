import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Campaign {
    id: string;
    title: string;
    description?: string;
    start_at?: string;
    end_at?: string;
    image_url?: string;
}

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startAt: '',
        endAt: '',
        image: null as File | null,
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/admin/campaigns');
            setCampaigns(response.data.data.campaigns || []);
        } catch (error) {
            toast.error('Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('startAt', formData.startAt);
            data.append('endAt', formData.endAt);
            if (formData.image) {
                data.append('image', formData.image);
            }

            await api.post('/admin/campaigns', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Campaign created successfully');
            setIsCreateOpen(false);
            resetForm();
            fetchCampaigns();
        } catch (error) {
            toast.error('Failed to create campaign');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaign) return;

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('startAt', formData.startAt);
            data.append('endAt', formData.endAt);
            if (formData.image) {
                data.append('image', formData.image);
            }

            await api.put(`/admin/campaigns/${selectedCampaign.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Campaign updated successfully');
            setIsEditOpen(false);
            resetForm();
            fetchCampaigns();
        } catch (error) {
            toast.error('Failed to update campaign');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            await api.delete(`/admin/campaigns/${id}`);
            toast.success('Campaign deleted successfully');
            fetchCampaigns();
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            startAt: '',
            endAt: '',
            image: null,
        });
        setSelectedCampaign(null);
    };

    const openEdit = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setFormData({
            title: campaign.title,
            description: campaign.description || '',
            startAt: campaign.start_at?.split('T')[0] || '',
            endAt: campaign.end_at?.split('T')[0] || '',
            image: null,
        });
        setIsEditOpen(true);
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                            <p className="text-muted-foreground">Manage promotional campaigns</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Campaign
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>Create Campaign</DialogTitle>
                                        <DialogDescription>Add a new promotional campaign</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="startAt">Start Date</Label>
                                            <Input
                                                id="startAt"
                                                type="date"
                                                value={formData.startAt}
                                                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="endAt">End Date</Label>
                                            <Input
                                                id="endAt"
                                                type="date"
                                                value={formData.endAt}
                                                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="image">Image</Label>
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Create</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-md border text-black">
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
                                {campaigns.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No campaigns found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium">{campaign.title}</TableCell>
                                            <TableCell className="max-w-md truncate">{campaign.description || 'N/A'}</TableCell>
                                            <TableCell>{campaign.start_at ? new Date(campaign.start_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>{campaign.end_at ? new Date(campaign.end_at).toLocaleDateString() : 'N/A'}</TableCell>
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

                    {/* Edit Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent>
                            <form onSubmit={handleEdit}>
                                <DialogHeader>
                                    <DialogTitle>Edit Campaign</DialogTitle>
                                    <DialogDescription>Update campaign details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-title">Title</Label>
                                        <Input
                                            id="edit-title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-startAt">Start Date</Label>
                                        <Input
                                            id="edit-startAt"
                                            type="date"
                                            value={formData.startAt}
                                            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-endAt">End Date</Label>
                                        <Input
                                            id="edit-endAt"
                                            type="date"
                                            value={formData.endAt}
                                            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-image">Image (optional)</Label>
                                        <Input
                                            id="edit-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Update</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
