'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import ReviewsCMS from '@/pages/admin/ReviewsCMS';
export default function ReviewsRoute() {
    return <AdminProtectedRoute><ReviewsCMS /></AdminProtectedRoute>;
}
