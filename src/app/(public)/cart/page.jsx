'use client';
/**
 * Cart route wrapper.
 *
 * The real cart UI lives in src/pages/CartPage.jsx which uses CartContext
 * (localStorage-backed cart). This thin wrapper simply mounts that component
 * so the App Router serves it at /cart.
 *
 * The previous implementation fetched from /api/cart (DB-backed server cart)
 * which always returned empty because Vionara uses a localStorage cart.
 */
import CartPage from '@/pages/CartPage';

export default function CartRoute() {
    return <CartPage />;
}
