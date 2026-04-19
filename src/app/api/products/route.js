import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { getDemoProducts, normalizeProduct } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const limit = Number(searchParams.get('limit') || '0');

    if (!hasMongoConfig()) {
        const products = getDemoProducts({ search, category, limit });

        return NextResponse.json({
            success: true,
            count: products.length,
            products,
            fallback: true,
            message: 'Using demo products because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();

        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            const categoryMatch = await Category.findOne({
                $or: [
                    { slug: category },
                    { name: { $regex: `^${category}$`, $options: 'i' } },
                ],
            }).select('_id');

            if (categoryMatch) {
                query.category = categoryMatch._id;
            } else if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            } else {
                return NextResponse.json({ success: true, count: 0, products: [] });
            }
        }

        let productQuery = Product.find(query)
            .populate('category', 'name slug')
            .sort('-createdAt')
            .lean();

        if (limit > 0) {
            productQuery = productQuery.limit(limit);
        }

        const products = (await productQuery).map(normalizeProduct);

        return NextResponse.json({ success: true, count: products.length, products });
    } catch (error) {
        const products = getDemoProducts({ search, category, limit });

        return NextResponse.json({
            success: true,
            count: products.length,
            products,
            fallback: true,
            message: error.message,
        });
    }
}

export async function POST(req) {
    try {
        await connectDB();

        // Admin-only guard
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const data = await req.json();

        // Belt-and-suspenders: generate slug in controller if the model
        // middleware hasn't run yet (e.g. hot-reload edge case in dev)
        if (!data.slug && data.name) {
            const { default: slugify } = await import('slugify');
            data.slug = slugify(data.name, { lower: true, strict: true });
        }

        const product = await Product.create(data);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        // Return 400 for Mongoose validation errors, 500 for everything else
        const status = error.name === 'ValidationError' ? 400 : 500;
        return NextResponse.json({ success: false, message: error.message }, { status });
    }
}
