'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const OTP_LENGTH = 6;

function parseCountdown(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function AuthVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyOtp, resendOtp } = useAuth();
    const paramPurpose = searchParams.get('purpose');
    const purpose = paramPurpose === 'login' ? 'login' : paramPurpose === 'forgot-password' ? 'forgot-password' : 'signup';
    const identifier = searchParams.get('identifier') || '';
    const channel = searchParams.get('channel') || 'email';
    const [otpDigits, setOtpDigits] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(() => parseCountdown(searchParams.get('cooldown')));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!countdown) {
            return undefined;
        }

        const timer = setInterval(() => {
            setCountdown((current) => {
                if (current <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }, []);

    const handleOtpChange = (event, index) => {
        const nextDigit = event.target.value.replace(/\D/g, '').slice(-1);
        const nextDigits = [...otpDigits];
        nextDigits[index] = nextDigit;
        setOtpDigits(nextDigits);

        if (nextDigit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (event, index) => {
        if (event.key !== 'Backspace') {
            return;
        }

        if (otpDigits[index]) {
            const nextDigits = [...otpDigits];
            nextDigits[index] = '';
            setOtpDigits(nextDigits);
            return;
        }

        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (event) => {
        event.preventDefault();
        const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
        const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] || '');
        setOtpDigits(nextDigits);
        inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        if (!identifier) {
            toast.error('Missing verification session. Please try again.');
            return;
        }

        const otp = otpDigits.join('');
        if (otp.length !== OTP_LENGTH) {
            toast.error('Enter the 6-digit OTP.');
            return;
        }

        setLoading(true);
        try {
            const data = await verifyOtp({ purpose, email: identifier, otp });
            
            if (purpose === 'forgot-password') {
                toast.success('OTP verified successfully.');
                const params = new URLSearchParams({
                    token: data.resetToken,
                    email: identifier
                });
                router.push(`/auth/reset-password?${params.toString()}`);
                return;
            }

            toast.success(purpose === 'login' ? 'Welcome Back!' : (data.message || 'OTP verified successfully.'));
            router.push('/');
        } catch (error) {
            toast.error(error.message || 'Invalid OTP or failed to verify.');
            
            // Clear OTP fields on error for better UX
            setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!identifier || countdown > 0) {
            return;
        }

        setResendLoading(true);
        try {
            const data = await resendOtp({ purpose, email: identifier });
            setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ''));
            // Fix: Requirement 5 says new OTP generated on resend, invalidate old. 
            // Our backend already does this in requestAuthOtp.
            setCountdown(data.resendAvailableIn || 30);
            toast.success(data.message || 'New OTP sent to your email.');
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch (error) {
            const retryAfter = Number(error.retryAfter || 0);
            if (retryAfter > 0) {
                setCountdown(retryAfter);
            }
            toast.error(error.message || 'Failed to resend OTP.');
        } finally {
            setResendLoading(false);
        }
    };

    if (!identifier) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
                    <h1 className="font-heading text-3xl text-[#121212] mb-3">Verification link missing</h1>
                    <p className="text-sm text-gray-500 mb-6">Start the authentication flow again so we can send you a fresh OTP.</p>
                    <Link href="/auth" className="inline-flex items-center justify-center rounded-lg bg-[#121212] px-5 py-3 text-sm font-medium text-white hover:bg-[#2A2A2A] transition-colors">
                        Back to authentication
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-lg rounded-[28px] border border-[#EFE7D8] bg-white p-8 sm:p-10 shadow-[0_24px_80px_-24px_rgba(17,17,17,0.18)]"
            >
                <Link href="/" className="inline-block mb-8 font-heading text-2xl tracking-[0.18em] text-[#121212]">
                    VIONARA
                </Link>

                <div className="mb-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C9A34E] mb-3">OTP Verification</p>
                    <h1 className="font-heading text-3xl text-[#121212] mb-3">{purpose === 'login' ? 'Confirm your login' : 'Confirm your account'}</h1>
                    <p className="text-sm leading-7 text-gray-500">
                        We sent a 6-digit code to your {channel === 'phone' ? 'phone number' : 'email address'} to finish your {purpose === 'login' ? 'login' : 'signup'}.
                    </p>
                    <p className="mt-2 rounded-xl bg-[#FCF8EE] px-4 py-3 text-sm font-medium text-[#121212] break-all">
                        {identifier}
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="flex justify-between gap-2 sm:gap-3">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(event) => handleOtpChange(event, index)}
                                onKeyDown={(event) => handleOtpKeyDown(event, index)}
                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                className={`h-14 w-12 sm:h-16 sm:w-14 rounded-2xl border text-center text-2xl font-medium outline-none transition-all ${
                                    digit
                                        ? 'border-[#C9A34E] bg-[#FCF8EE]/60 text-[#121212]'
                                        : 'border-gray-200 bg-gray-50 text-gray-400'
                                } focus:border-[#C9A34E] focus:bg-white focus:ring-4 focus:ring-[#C9A34E]/10`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otpDigits.join('').length !== OTP_LENGTH}
                        className="w-full rounded-xl bg-[#121212] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : purpose === 'login' ? 'Verify and sign in' : 'Verify and create account'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                    <p className="text-gray-500">
                        {countdown > 0 ? `Resend available in ${countdown}s` : "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={countdown > 0 || resendLoading}
                        className={`font-medium transition-colors ${
                            countdown > 0 || resendLoading
                                ? 'cursor-not-allowed text-gray-300'
                                : 'text-[#C9A34E] hover:text-[#A37E22]'
                        }`}
                    >
                        {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
                    Wrong contact info? <Link href="/auth" className="font-medium text-[#121212] underline underline-offset-4">Go back to authentication</Link>
                </div>
            </motion.div>
        </div>
    );
}
