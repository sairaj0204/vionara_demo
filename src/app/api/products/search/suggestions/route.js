import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';

function buildSuggestions(products, query) {
    const normalizedQuery = query.trim().toLowerCase();
    return products
        .filter((product) => product.name?.toLowerCase().includes(normalizedQuery))
        .slice(0, 8)
        .map((product) => ({
            _id: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            category: product.categoryName || product.category,
        }));
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim() || '';

    if (query.length < 2) {
        return NextResponse.json({ success: true, suggestions: [] });
    }

    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            suggestions: buildSuggestions(getDemoProducts(), query),
            fallback: true,
        });
    }

    try {
        await connectDB();
        const products = await Product.find({
            name: { $regex: query, $options: 'i' },
            isActive: true,
        })
            .populate('category', 'name slug')
            .limit(8)
            .lean();

        return NextResponse.json({
            success: true,
            suggestions: buildSuggestions(products.map(normalizeProduct), query),
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            suggestions: buildSuggestions(getDemoProducts(), query),
            fallback: true,
            message: error.message,
        });
    }
}
