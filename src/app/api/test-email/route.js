import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function GET() {
    // Show exactly what env vars are loaded (mask password partially)
    const smtpUser = process.env.SMTP_USER || '(NOT SET)';
    const smtpPass = process.env.SMTP_PASS || '';
    const smtpHost = process.env.SMTP_HOST || '(NOT SET)';
    const smtpPort = process.env.SMTP_PORT || '(NOT SET)';
    const emailFrom = process.env.EMAIL_FROM || '(NOT SET)';
    const resendKey = process.env.RESEND_API_KEY || '(NOT SET)';

    const maskedPass = smtpPass
        ? `${smtpPass.slice(0, 4)}${'*'.repeat(Math.max(0, smtpPass.length - 4))}`
        : '(NOT SET)';

    const envReport = {
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_USER: smtpUser,
        SMTP_PASS: maskedPass,
        SMTP_PASS_LENGTH: smtpPass.length,
        SMTP_PASS_HAS_SPACES: smtpPass.includes(' '),
        EMAIL_FROM: emailFrom,
        RESEND_API_KEY: resendKey.startsWith('re_') ? `${resendKey.slice(0, 8)}****` : '(NOT SET or placeholder)',
    };

    if (!smtpPass || !smtpUser || smtpHost === '(NOT SET)') {
        return NextResponse.json({
            success: false,
            message: 'SMTP env vars are missing — set them in Vercel dashboard (Settings → Environment Variables)',
            envReport,
        }, { status: 500 });
    }

    // Attempt SMTP verify
    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort) || 587,
            secure: false,
            requireTLS: true,
            auth: { type: 'login', user: smtpUser, pass: smtpPass },
            tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
            connectionTimeout: 10_000,
            greetingTimeout: 8_000,
        });

        await transporter.verify();

        return NextResponse.json({
            success: true,
            message: '✅ SMTP connection verified. Credentials are correct.',
            envReport,
        });
    } catch (err) {
        return NextResponse.json({
            success: false,
            message: `❌ SMTP Error: ${err.message}`,
            responseCode: err.responseCode || null,
            envReport,
        }, { status: 500 });
    }
}
