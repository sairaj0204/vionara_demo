'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminBanners from '@/pages/admin/AdminBanners';
export default function BannersRoute() {
    return <AdminProtectedRoute><AdminBanners /></AdminProtectedRoute>;
}
