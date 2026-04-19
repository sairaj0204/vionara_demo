import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/settings';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
    if (!hasMongoConfig()) {
        return NextResponse.json({
            success: true,
            users: [],
            fallback: true,
            message: 'Using empty user list because MONGODB_URI is not configured.',
        });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const [users, orders] = await Promise.all([
            User.find({}).select('-password').lean(),
            Order.find({}).sort('-createdAt').lean(),
        ]);

        const orderStatsByUser = new Map();
        for (const order of orders) {
            const userId = order.user?.toString?.() || String(order.user || '');
            if (!userId) continue;

            const current = orderStatsByUser.get(userId) || { orderCount: 0, totalSpent: 0, recentOrders: [] };
            current.orderCount += 1;
            current.totalSpent += Number(order.totalAmount || 0);
            if (current.recentOrders.length < 5) {
                current.recentOrders.push(order);
            }
            orderStatsByUser.set(userId, current);
        }

        return NextResponse.json({
            success: true,
            users: users.map((user) => {
                const stats = orderStatsByUser.get(user._id.toString()) || { orderCount: 0, totalSpent: 0, recentOrders: [] };
                return {
                    ...user,
                    orderCount: stats.orderCount,
                    totalSpent: stats.totalSpent,
                    recentOrders: stats.recentOrders,
                    address: user.addresses?.find?.((address) => address.isDefault) || user.addresses?.[0] || null,
                };
            }),
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
