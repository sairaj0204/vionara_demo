import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';

export async function GET(_req, { params }) {
    const { slug: rawSlug } = await params;
    const slug = typeof rawSlug === 'string' ? rawSlug.trim() : '';

    if (!slug) {
        return NextResponse.json(
            { success: false, message: 'Product slug is required.' },
            { status: 400 }
        );
    }

    if (!hasMongoConfig()) {
        const product = getDemoProducts().find((item) => item.slug === slug);

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    }

    try {
        await connectDB();

        // Note: isActive filter intentionally omitted here — the detail page
        // should resolve for both active and inactive products (e.g. admin preview).
        // Active-only filtering is enforced at the product listing level.
        const product = await Product.findOne({ slug })
            .populate('category', 'name slug')
            .lean();

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        const product = getDemoProducts().find((item) => item.slug === slug);

        if (!product) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            product,
            fallback: true,
            message: error.message,
        });
    }
}
