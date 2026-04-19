'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminOrders from '@/pages/admin/AdminOrders';
export default function OrdersRoute() {
    return <AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>;
}
