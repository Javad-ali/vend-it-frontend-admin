import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Content() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState({
        aboutUs: '',
        termsAndConditions: '',
        privacyPolicy: '',
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await api.get('/admin/content');
            setContent({
                aboutUs: response.data.data.aboutUs || '',
                termsAndConditions: response.data.data.termsAndConditions || '',
                privacyPolicy: response.data.data.privacyPolicy || '',
            });
        } catch (error) {
            toast.error('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/content', content);
            toast.success('Content updated successfully');
        } catch (error) {
            toast.error('Failed to update content');
        } finally {
            setSaving(false);
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
                        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                        <p className="text-muted-foreground">Manage static content and legal pages</p>
                    </div>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList>
                            <TabsTrigger value="about">About Us</TabsTrigger>
                            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                        </TabsList>

                        <TabsContent value="about" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About Us</CardTitle>
                                    <CardDescription>Information about your company</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="aboutUs">Content</Label>
                                        <Textarea
                                            id="aboutUs"
                                            value={content.aboutUs}
                                            onChange={(e) => setContent({ ...content, aboutUs: e.target.value })}
                                            rows={15}
                                        />
                                    </div>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="terms" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Terms & Conditions</CardTitle>
                                    <CardDescription>Your terms of service</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="terms">Content</Label>
                                        <Textarea
                                            id="terms"
                                            value={content.termsAndConditions}
                                            onChange={(e) => setContent({ ...content, termsAndConditions: e.target.value })}
                                            rows={15}
                                        />
                                    </div>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="privacy" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Privacy Policy</CardTitle>
                                    <CardDescription>Your privacy policy</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="privacy">Content</Label>
                                        <Textarea
                                            id="privacy"
                                            value={content.privacyPolicy}
                                            onChange={(e) => setContent({ ...content, privacyPolicy: e.target.value })}
                                            rows={15}
                                        />
                                    </div>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
