import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProductsPage: React.FC = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Product Management</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Products List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Products table will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ProductsPage;
