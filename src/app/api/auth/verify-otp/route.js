import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuthOtpError, verifyAuthOtp } from '@/lib/auth-otp';

export const runtime = 'nodejs';

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp, purpose }
 * Verifies the 6-digit code and logs the user in if purpose is 'login' or 'signup'.
 */
export async function POST(req) {
    try {
        await connectDB();
        const payload = await req.json();
        
        const result = await verifyAuthOtp(payload);
        
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AuthOtpError) {
            return NextResponse.json(
                { success: false, message: error.message, ...error.extra },
                { status: error.status }
            );
        }
        
        console.error("❌ [API] VERIFY-OTP ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message || 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
