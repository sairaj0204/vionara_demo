import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { verifyAdmin } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';

export async function GET() {
    if (!hasMongoConfig()) {
        return NextResponse.json({ success: true, products: getDemoProducts(), fallback: true });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const products = await Product.find({})
            .populate('category', 'name slug')
            .sort('-createdAt')
            .lean();

        return NextResponse.json({ success: true, products: products.map(normalizeProduct) });
    } catch (error) {
        return NextResponse.json({
            success: true,
            products: getDemoProducts(),
            fallback: true,
            message: error.message,
        });
    }
}
