'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import ProductBadges from '@/pages/admin/ProductBadges';
export default function ProductBadgesRoute() {
    return <AdminProtectedRoute><ProductBadges /></AdminProtectedRoute>;
}
