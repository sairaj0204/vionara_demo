import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/settings';
import { buildAnalytics, buildDemoAnalytics } from '@/lib/admin-metrics';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '9months';

    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            analytics: buildDemoAnalytics(period),
            fallback: true,
            message: 'Using demo analytics because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const [orders, products, users] = await Promise.all([
            Order.find({}).sort('-createdAt').lean(),
            Product.find({}).populate('category', 'name slug').lean(),
            User.find({ role: 'user' }).select('createdAt').lean(),
        ]);

        return NextResponse.json({
            success: true,
            analytics: buildAnalytics({ period, orders, products, users }),
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            analytics: buildDemoAnalytics(period),
            fallback: true,
            message: error.message,
        });
    }
}
