'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminProducts from '@/pages/admin/AdminProducts';
export default function ProductsRoute() {
    return <AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>;
}
