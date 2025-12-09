import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { Plus, Pencil, Download } from 'lucide-react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV } from '@/lib/export';

interface Category {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
}

export default function Categories() {
    const pagination = usePagination(10);
    const { data, isLoading, error } = useGetCategoriesQuery(undefined);
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: null as File | null });

    const categories = data?.data?.categories || [];

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter((c: Category) =>
            c.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, categories]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        return filteredCategories.slice(startIndex, startIndex + pagination.limit);
    }, [filteredCategories, pagination.page, pagination.limit]);

    useEffect(() => {
        pagination.setTotal(filteredCategories.length);
    }, [filteredCategories.length, pagination]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        if (formData.icon) formDataToSend.append('icon', formData.icon);

        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory.id, formData: formDataToSend }).unwrap();
                toast.success('Category updated successfully');
            } else {
                await createCategory(formDataToSend).unwrap();
                toast.success('Category created successfully');
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon: null });
        setEditingCategory(null);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '', icon: null });
        setIsDialogOpen(true);
    };

    const handleExportCSV = () => {
        exportToCSV(filteredCategories, `categories-${new Date().toISOString().split('T')[0]}.csv`, [
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
        ]);
        toast.success('Categories exported successfully');
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <TableSkeleton columns={3} rows={10} />
                </div>
            </Layout>
        );
    }

    if (error) return <Layout><div className="text-red-500">Failed to load categories</div></Layout>;

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Categories</h1>
                            <p className="text-muted-foreground">Manage product categories</p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button><Plus className="h-4 w-4 mr-2" />New Category</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div>
                                            <Label>Name</Label>
                                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label>Icon</Label>
                                            <ImageUpload value={formData.icon || undefined} onChange={(file) => setFormData({ ...formData, icon: file })} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Input placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />CSV
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCategories.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">No categories found</TableCell></TableRow>
                                ) : (
                                    paginatedCategories.map((category: Category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredCategories.length > 0 && (
                        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={pagination.setPage} itemsPerPage={pagination.limit} onItemsPerPageChange={pagination.setLimit} />
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
