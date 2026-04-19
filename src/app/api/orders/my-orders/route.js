import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET() {
    try {
        await connectDB();
        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const rawOrders = await Order.find({ user: user._id })
            .sort('-createdAt')
            .lean();

        const statusMap = { confirmed: "paid", packed: "processing", ordered: "paid" };
        const orders = rawOrders.map(order => ({
            ...order,
            orderStatus: statusMap[order.orderStatus?.toLowerCase()] || order.orderStatus,
            statusHistory: (order.statusHistory || []).map(h => ({
                ...h,
                status: statusMap[h.status?.toLowerCase()] || h.status
            }))
        }));

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
