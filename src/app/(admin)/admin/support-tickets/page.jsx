'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSupportTickets from '@/pages/admin/AdminSupportTickets';
export default function SupportTicketsRoute() {
    return <AdminProtectedRoute><AdminSupportTickets /></AdminProtectedRoute>;
}
