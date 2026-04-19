import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hasMongoConfig } from '@/lib/settings';
import User from '@/models/User';
import { normalizeEmail } from '@/lib/auth-utils';

export const runtime = 'nodejs';

export async function POST(req) {
    if (!hasMongoConfig()) {
        return NextResponse.json(
            { success: false, message: 'MONGODB_URI is required.' },
            { status: 503 }
        );
    }

    try {
        await connectDB();
        const { email, token, password } = await req.json();
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !token) {
            return NextResponse.json(
                { success: false, message: 'Email and reset token are required.' },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters long.' },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            email: normalizedEmail,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired reset token. Please request a new OTP.' },
                { status: 400 }
            );
        }

        // Set new password (will be hashed by pre-save hook)
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log(`Password reset successful for ${normalizedEmail}`);

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in.',
        });
    } catch (error) {
        console.error('❌ [API Log] RESET PASSWORD ERROR:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

