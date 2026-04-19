import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/settings';
import { buildDashboardStats, buildDemoDashboardStats } from '@/lib/admin-metrics';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET() {
    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            stats: buildDemoDashboardStats(),
            fallback: true,
            message: 'Using demo dashboard stats because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const [orders, products, users] = await Promise.all([
            Order.find({})
                .populate('user', 'name email')
                .sort('-createdAt')
                .lean(),
            Product.find({}).populate('category', 'name slug').lean(),
            User.find({ role: 'user' }).select('name email createdAt').lean(),
        ]);

        return NextResponse.json({
            success: true,
            stats: buildDashboardStats({ orders, products, users }),
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            stats: buildDemoDashboardStats(),
            fallback: true,
            message: error.message,
        });
    }
}
