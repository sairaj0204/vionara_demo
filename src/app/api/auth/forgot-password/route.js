import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import { AuthOtpError, requestAuthOtp } from '@/lib/auth-otp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * This route triggers the OTP flow for password reset.
 * It uses the same 6-digit OTP mechanism as login and signup for consistency.
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
        
        // We trigger the same requestAuthOtp but with purpose: 'forgot-password'
        const result = await requestAuthOtp({ ...payload, purpose: 'forgot-password' });

        return NextResponse.json({
            success: true,
            message: 'If that email exists, an OTP has been sent.',
            ...result
        }, { status: 200 });
        
    } catch (error) {
        if (error instanceof AuthOtpError) {
            // Respect the rate limiting or validation errors from the OTP engine
            return NextResponse.json(
                { success: false, message: error.message, ...error.extra },
                { status: error.status }
            );
        }

        console.error("❌ [API] FORGOT-PASSWORD ERROR:", error);
        return NextResponse.json({ success: false, message: 'Failed to process request.' }, { status: 500 });
    }
}
