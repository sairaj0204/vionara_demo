'use client';
import { useParams } from 'next/navigation';
import ProductDetail from '@/pages/ProductDetail';
export default function ProductRoute() {
    const params = useParams();
    return <ProductDetail params={params} />;
}
