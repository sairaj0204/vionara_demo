import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { amount, currency = 'INR' } = await req.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { success: false, message: 'Razorpay keys not configured in environment' },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Razorpay takes amount in standard subunits (paise for INR)
        const options = {
            amount: amount * 100,
            currency,
            receipt: `rcpt_${crypto.randomBytes(4).toString('hex')}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
