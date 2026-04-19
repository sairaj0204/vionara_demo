import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { buildDemoCategories } from '@/lib/catalog';
import { hasMongoConfig } from '@/lib/settings';
import Category from '@/models/Category';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            categories: buildDemoCategories(),
            fallback: true,
            message: 'Using default categories because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();
        const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, categories });
    } catch (error) {
        return NextResponse.json({
            success: true,
            categories: buildDemoCategories(),
            fallback: true,
            message: error.message,
        });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        
        const adminUser = await verifyAdmin();
        if (!adminUser) return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });

        const { name, thumbnail, banner, description, isActive } = await req.json();
        
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 400 });
        }
        
        const category = await Category.create({ name, thumbnail, banner, description, isActive });
        return NextResponse.json({ success: true, category, message: 'Category created' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
