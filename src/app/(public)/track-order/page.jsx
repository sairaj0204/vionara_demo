'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderTracking from '@/pages/OrderTracking';

function TrackOrderContent() {
    const searchParams = useSearchParams();
    return <OrderTracking orderId={searchParams.get('id') || ''} />;
}

export default function TrackOrderRoute() {
    return (
        <Suspense fallback={null}>
            <TrackOrderContent />
        </Suspense>
    );
}
