'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
export default function DashboardRoute() {
    return <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>;
}
