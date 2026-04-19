import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        await connectDB();
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json(
                { success: false, message: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        // 1. Verify Signature
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return NextResponse.json({ success: false, message: 'Payment verification failed: Invalid signature' }, { status: 400 });
        }

        // 2. Atomic Payment Lock
        const order = await Order.findOneAndUpdate(
            { _id: orderId, isPaid: false },
            { $set: { isPaid: true } },
            { new: true }
        ).populate('user', 'email name');

        if (!order) {
            return NextResponse.json({ success: true, message: 'Already processed or not found' });
        }

        // 3. Deduct Stock safely
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        // 4. Update Order Status
        order.paymentInfo.status = 'paid';
        order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
        order.paymentInfo.razorpaySignature = razorpaySignature;
        order.orderStatus = 'paid';
        
        const lastStatus = order.statusHistory.at(-1);
        if (lastStatus?.status !== 'paid') {
            order.statusHistory.push({ status: 'paid', date: new Date(), note: 'Payment successful' });
        }

        await order.save();

        // 5. Trigger Shiprocket (Asynchronously to avoid blocking response, or await it)
        // 5. Trigger Shiprocket (Asynchronously to avoid blocking response)
        if (process.env.ENABLE_SHIPROCKET === 'true' && !order.shiprocketOrderId) {
            try {
                const shiprocketRes = await createShiprocketOrder(order);
                if (shiprocketRes.success) {
                    order.shiprocketOrderId = shiprocketRes.shiprocketOrderId;
                    order.awbCode = shiprocketRes.awbCode;
                    order.courierName = shiprocketRes.courierName;
                    order.trackingUrl = shiprocketRes.trackingUrl;
                    order.trackingNumber = shiprocketRes.awbCode;
                    await order.save();
                }
            } catch (srError) {
                console.error('Shiprocket Sync failed during verify:', srError);
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified and order confirmed' });
    } catch (error) {
        console.error("PAYMENT VERIFY ERROR:", {
            error: error.message || error,
            body: req.body,
        });
        return NextResponse.json(
            { success: false, message: error.message || 'Payment verification failed' },
            { status: 500 }
        );
    }
}
