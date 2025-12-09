import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Feedback {
    id: string;
    user_name?: string;
    message: string;
    rating?: number;
    created_at: string;
}

export default function Feedback() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await api.get('/admin/feedback');
            setFeedback(response.data.data.feedback || []);
        } catch (error) {
            toast.error('Failed to fetch feedback');
        } finally {
            setLoading(false);
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
                        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
                        <p className="text-muted-foreground">Customer feedback messages</p>
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
                                {feedback.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No feedback found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    feedback.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.user_name || 'Anonymous'}</TableCell>
                                            <TableCell className="max-w-md">{item.message}</TableCell>
                                            <TableCell>
                                                {item.rating ? `${item.rating}/5` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.created_at).toLocaleDateString()}
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
