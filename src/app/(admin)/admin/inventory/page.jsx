'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminInventory from '@/pages/admin/AdminInventory';
export default function InventoryRoute() {
    return <AdminProtectedRoute><AdminInventory /></AdminProtectedRoute>;
}
