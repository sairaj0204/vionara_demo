import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

function normalizeStatus(status) {
    const statusMap = { confirmed: "paid", packed: "processing", ordered: "paid" };
    return statusMap[status?.toLowerCase()] || status;
}

function buildTrackingPayload(order) {
    const status = normalizeStatus(order.orderStatus);
    const history = (order.statusHistory || []).map(h => ({
        ...h,
        status: normalizeStatus(h.status)
    }));

    return {
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status,
        statusHistory: history,
        items: order.items || [],
        trackingNumber: order.trackingNumber || order.awbCode || '',
        trackingUrl: order.trackingUrl || '',
        courierName: order.courierName || '',
        expectedDeliveryDate: order.expectedDeliveryDate || order.estimatedDelivery || null,
    };
}

export async function GET(_req, { params }) {
    const { orderNumber: rawOrderNumber } = await params;
    const orderNumber = typeof rawOrderNumber === 'string' ? rawOrderNumber.trim() : '';

    if (!orderNumber) {
        return NextResponse.json({ success: false, message: 'Order number is required.' }, { status: 400 });
    }

    try {
        await connectDB();

        let order = await Order.findOne({ orderNumber }).lean();
        if (!order && mongoose.Types.ObjectId.isValid(orderNumber)) {
            order = await Order.findById(orderNumber).lean();
        }

        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, tracking: buildTrackingPayload(order) });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
