'use client';
/**
 * Checkout route wrapper.
 *
 * The real checkout logic lives in src/pages/Checkout.jsx which uses
 * CartContext (localStorage-backed cart). This thin wrapper simply mounts
 * that component so the App Router serves it at /checkout.
 *
 * Previously this file contained a standalone implementation that fetched
 * cart items from /api/cart (server-side DB cart). Since Vionara uses a
 * localStorage cart (CartContext), that API call always returned empty,
 * causing the "Your cart is empty." message even with items in the bag.
 */
import { Suspense } from 'react';
import Checkout from '@/pages/Checkout';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading checkout...</div>}>
            <Checkout />
        </Suspense>
    );
}
