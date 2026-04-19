import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import { AuthOtpError, requestAuthOtp } from '@/lib/auth-otp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/login
 * Reverted to OTP-based login flow.
 * Validates password first, then sends verification OTP.
 */
export async function POST(req) {
    if (!hasMongoConfig()) {
        return NextResponse.json(
            { success: false, message: 'Database is not configured.' },
            { status: 503 }
        );
    }

    try {
        await connectDB();
        const payload = await req.json();
        const result = await requestAuthOtp({ ...payload, purpose: 'login' });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof AuthOtpError) {
            return NextResponse.json(
                { success: false, message: error.message, ...error.extra },
                { status: error.status }
            );
        }

        console.error("❌ [API] LOGIN ERROR:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
