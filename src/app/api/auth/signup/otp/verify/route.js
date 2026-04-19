import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import { SignupOtpError, verifySignupOtpCode } from '@/lib/signup-otp';

export const runtime = 'nodejs';

export async function POST(req) {
    if (!hasMongoConfig()) {
        return NextResponse.json(
            { success: false, message: 'MONGODB_URI is required for OTP verification.' },
            { status: 503 }
        );
    }

    try {
        await connectDB();
        const payload = await req.json();
        const result = await verifySignupOtpCode(payload);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof SignupOtpError) {
            return NextResponse.json(
                { success: false, message: error.message, ...error.extra },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { success: false, message: error.message || 'Failed to verify OTP.' },
            { status: 500 }
        );
    }
}
