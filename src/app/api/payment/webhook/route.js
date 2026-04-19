import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req) {
    try {
        const bodyTxt = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify Webhook Signature
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(bodyTxt)
                .digest('hex');

            if (expectedSignature !== signature) {
                console.error('Invalid Webhook Signature');
                return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(bodyTxt);
        await connectDB();

        const paymentEntity = event.payload.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (!razorpayOrderId) {
            return NextResponse.json({ success: true, message: 'No order ID in payload' });
        }

        // Find Order by razorpayOrderId and Atomically Lock
        const order = await Order.findOneAndUpdate(
            { 'paymentInfo.razorpayOrderId': razorpayOrderId, isPaid: false },
            { $set: { isPaid: true } },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return NextResponse.json({ success: true, message: 'Order not found or already processed' });
        }

        if (event.event === 'payment.captured') {

            // Deduct Stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity, sold: item.quantity }
                });
            }

            order.paymentInfo.status = 'paid';
            order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
            order.orderStatus = 'paid';
            
            const lastStatus = order.statusHistory.at(-1);
            if (lastStatus?.status !== 'paid') {
                order.statusHistory.push({ status: 'paid', date: new Date(), note: 'Webhook: Payment captured successfully' });
            }
            await order.save();

            // Trigger Shiprocket sync
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
                } catch (err) {
                    console.error('Webhook Shiprocket error:', err);
                }
            }
        } else if (event.event === 'payment.failed') {
            if (order.paymentInfo?.status === 'paid') return NextResponse.json({ success: true });
            
            order.paymentInfo.status = 'failed';
            order.orderStatus = 'failed';
            
            const lastFailStatus = order.statusHistory.at(-1);
            if (lastFailStatus?.status !== 'failed') {
                order.statusHistory.push({ status: 'failed', date: new Date(), note: 'Webhook: Payment failed' });
            }
            await order.save();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("WEBHOOK ERROR:", {
            error: error.message || error,
        });
        return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
    }
}
