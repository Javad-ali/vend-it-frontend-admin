import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContentPage: React.FC = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Content Management</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Content management interface will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ContentPage;
