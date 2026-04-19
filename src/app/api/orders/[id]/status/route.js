import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import Order from '@/models/Order';

export async function PUT(req, { params }) {
    const { id: rawId } = await params;
    const id = typeof rawId === 'string' ? rawId.trim() : '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: 'Invalid order id.' }, { status: 400 });
    }

    try {
        await connectDB();
        const adminUser = await verifyAdmin();
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'Not authorized as admin' }, { status: 403 });
        }

        const { orderStatus } = await req.json();
        if (!orderStatus) {
            return NextResponse.json({ success: false, message: 'Order status is required.' }, { status: 400 });
        }

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }

        const currentStatus = order.orderStatus || 'pending';

        if (currentStatus === orderStatus) {
            return NextResponse.json({ success: true, order });
        }

        const allowedNext = {
            pending: ['paid', 'cancelled'],
            paid: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: [],
            failed: []
        };

        if (!allowedNext[currentStatus]?.includes(orderStatus)) {
            return NextResponse.json(
                { success: false, message: `Invalid state transition from ${currentStatus} to ${orderStatus}` },
                { status: 400 }
            );
        }

        order.orderStatus = orderStatus;
        order.statusHistory = order.statusHistory || [];
        
        const lastStatus = order.statusHistory.at(-1);
        if (lastStatus?.status !== orderStatus) {
            order.statusHistory.push({
                status: orderStatus,
                date: new Date(),
                note: `Order marked as ${orderStatus}`,
            });
        }
        await order.save();

        return NextResponse.json({ success: true, order });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
