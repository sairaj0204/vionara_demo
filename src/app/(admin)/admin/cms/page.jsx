'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminCMS from '@/pages/admin/AdminCMS';
export default function CMSRoute() {
    return <AdminProtectedRoute><AdminCMS /></AdminProtectedRoute>;
}
