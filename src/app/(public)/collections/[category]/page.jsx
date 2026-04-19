'use client';
import { useParams } from 'next/navigation';
import CategoryPage from '@/pages/CategoryPage';
export default function CategoryRoute() {
    const params = useParams();
    return <CategoryPage params={params} />;
}
