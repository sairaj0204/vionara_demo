import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { buildDemoCategories } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Category from '@/models/Category';

export async function GET(_req, { params }) {
    const { slug: rawSlug } = await params;
    const slug = typeof rawSlug === 'string' ? rawSlug.trim().toLowerCase() : '';

    if (!slug) {
        return NextResponse.json({ success: false, message: 'Category slug is required.' }, { status: 400 });
    }

    if (!hasMongoConfig()) {
        const category = buildDemoCategories().find((item) => item.slug === slug);
        return category
            ? NextResponse.json({ success: true, category, fallback: true })
            : NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    }

    try {
        await connectDB();
        const category = await Category.findOne({ slug }).lean();
        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, category });
    } catch (error) {
        const category = buildDemoCategories().find((item) => item.slug === slug);
        if (category) {
            return NextResponse.json({ success: true, category, fallback: true, message: error.message });
        }

        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
