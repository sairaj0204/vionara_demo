'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminCustomers from '@/pages/admin/AdminCustomers';
export default function CustomersRoute() {
    return <AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>;
}
