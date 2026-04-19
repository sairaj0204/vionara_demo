'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Shop from '@/pages/Shop';

function ShopPageContent() {
    const searchParams = useSearchParams();
    return <Shop searchQuery={searchParams.get('search') || ''} />;
}

export default function ShopPage() {
    return (
        <Suspense fallback={null}>
            <ShopPageContent />
        </Suspense>
    );
}
