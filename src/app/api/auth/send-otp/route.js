import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuthOtpError, requestAuthOtp } from '@/lib/auth-otp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/send-otp
 * Body: { email, purpose, name, password, resend }
 * Sends a 6-digit verification code to the user.
 */
export async function POST(req) {
    try {
        await connectDB();
        const payload = await req.json();
        
        const result = await requestAuthOtp(payload);
        
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AuthOtpError) {
            return NextResponse.json(
                { success: false, message: error.message, ...error.extra },
                { status: error.status }
            );
        }
        
        console.error("❌ [API] SEND-OTP ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to send OTP. Please try again later.' },
            { status: 500 }
        );
    }
}
