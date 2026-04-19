'use client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
export default function AnalyticsRoute() {
    return <AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>;
}
