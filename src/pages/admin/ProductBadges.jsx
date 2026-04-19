import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const ProductBadges = () => {
    return (
        <AdminLayout title="Product Badges CMS" subtitle="Manage badges for your products">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 pb-32 min-h-[60vh] flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-heading font-medium text-charcoal mb-4">Product Badges CMS</h1>
                <p className="text-gray-500 max-w-md">Advanced UI controls for Product Badges will be loaded here pending data retrieval.</p>
            </div>
        </AdminLayout>
    );
};

export default ProductBadges;
