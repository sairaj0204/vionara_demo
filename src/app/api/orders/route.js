import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getUserFromToken } from '@/lib/auth';

/**
 * Generate a unique order number like VIO-1713087600000-4A2B
 */
function generateOrderNumber() {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VIO-${ts}-${rand}`;
}

export async function GET(req) {
    try {
        await connectDB();

        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        // Return user's orders
        const orders = await Order.find({ user: user._id }).sort('-createdAt');

        return NextResponse.json({ success: true, count: orders.length, data: orders, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            shippingAddress,
            paymentMethod = 'cod',
            cartItems = [],   // Array of { productId, name, image, price, quantity, size }
            shippingCost = 0,
            discount = 0,
            couponCode = '',
        } = body;

        if (!shippingAddress?.fullName || !shippingAddress?.addressLine1) {
            return NextResponse.json({ success: false, message: 'Shipping address is required.' }, { status: 400 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ success: false, message: 'No items in order.' }, { status: 400 });
        }

        // Build items, verify prices, and VALIDATE STOCK from DB
        const orderItems = [];
        let itemsTotal = 0;

        for (const ci of cartItems) {
            const product = await Product.findById(ci.productId).select('name price images stock').lean();
            if (!product) {
                return NextResponse.json(
                    { success: false, message: `Product not found: ${ci.productId}` },
                    { status: 404 }
                );
            }

            const qty = Math.max(1, Number(ci.quantity) || 1);
            
            // Validate Stock
            if (product.stock < qty) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Insufficient stock for product: ${product.name}. Only ${product.stock} left.` 
                }, { status: 400 });
            }

            const price = product.price; // Use server price, never trust client price
            itemsTotal += price * qty;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0] || ci.image || '',
                price,
                quantity: qty,
                size: ci.size || '',
            });
        }

        const totalAmount = Math.max(0, itemsTotal - Number(discount) + Number(shippingCost));
        const orderNumber = generateOrderNumber();

        // Base order data - ALWAYS pending initially
        const orderData = {
            user: user._id,
            orderNumber,
            items: orderItems,
            shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: 'pending',
            },
            itemsTotal,
            shippingCost: Number(shippingCost),
            discount: Number(discount),
            couponCode: couponCode || '',
            totalAmount,
            orderStatus: 'pending',
            statusHistory: [{ status: 'pending', date: new Date(), note: 'Order placed but payment pending' }],
        };

        let razorpayOrder = null;
        let razorpayKey = null;

        if (paymentMethod === 'razorpay') {
            const Razorpay = require('razorpay');
            if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
                return NextResponse.json({ success: false, message: 'Razorpay not configured' }, { status: 500 });
            }
            
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // convert to paise
                currency: 'INR',
                receipt: orderNumber,
            });

            orderData.paymentInfo.razorpayOrderId = razorpayOrder.id;
            razorpayKey = process.env.RAZORPAY_KEY_ID;
        } else if (paymentMethod === 'cod') {
             // For COD, we can immediately mark it as processing/confirmed (depending on your flow)
             orderData.statusHistory.push({ status: 'processing', date: new Date(), note: 'COD order confirmed' });
             orderData.orderStatus = 'processing';
        }

        const order = await Order.create(orderData);

        return NextResponse.json({ 
            success: true, 
            data: order, 
            order,
            razorpayOrder,
            razorpayKey,
        }, { status: 201 });
    } catch (error) {
        console.error('[Orders POST] Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
