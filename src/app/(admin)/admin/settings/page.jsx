'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSettings from '@/pages/admin/AdminSettings';
export default function SettingsRoute() {
    return <AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>;
}
