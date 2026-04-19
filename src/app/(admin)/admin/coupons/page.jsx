'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminCoupons from '@/pages/admin/AdminCoupons';
export default function CouponsRoute() {
    return <AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>;
}
