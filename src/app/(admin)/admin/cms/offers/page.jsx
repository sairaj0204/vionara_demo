'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import OffersDiscounts from '@/pages/admin/OffersDiscounts';
export default function OffersRoute() {
    return <AdminProtectedRoute><OffersDiscounts /></AdminProtectedRoute>;
}
