import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';

export async function GET(_req, { params }) {
    const { id: rawId } = await params;
    const id = typeof rawId === 'string' ? rawId.trim() : '';

    if (!id) {
        return NextResponse.json(
            { success: false, message: 'Product id is required.' },
            { status: 400 }
        );
    }

    if (!hasMongoConfig()) {
        const demoProducts = getDemoProducts();
        const currentProduct = demoProducts.find((item) => item._id === id);

        if (!currentProduct) {
            return NextResponse.json({ success: true, products: [] });
        }

        const relatedProducts = demoProducts
            .filter((item) => item._id !== id && item.categorySlug === currentProduct.categorySlug)
            .slice(0, 8);

        return NextResponse.json({ success: true, products: relatedProducts });
    }

    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: true, products: [] });
        }

        const currentProduct = await Product.findById(id).select('category');
        if (!currentProduct) {
            return NextResponse.json({ success: true, products: [] });
        }

        const relatedProducts = await Product.find({
            _id: { $ne: currentProduct._id },
            category: currentProduct.category,
            isActive: true,
        })
            .populate('category', 'name slug')
            .sort('-createdAt')
            .limit(8)
            .lean();

        return NextResponse.json({
            success: true,
            products: relatedProducts.map(normalizeProduct),
        });
    } catch (error) {
        const demoProducts = getDemoProducts();
        const currentProduct = demoProducts.find((item) => item._id === id);
        const relatedProducts = currentProduct
            ? demoProducts
                .filter((item) => item._id !== id && item.categorySlug === currentProduct.categorySlug)
                .slice(0, 8)
            : [];

        return NextResponse.json({
            success: true,
            products: relatedProducts,
            fallback: true,
            message: error.message,
        });
    }
}
