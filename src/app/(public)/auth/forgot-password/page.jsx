'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white';
const labelClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purpose: 'forgot-password', email }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('OTP sent to your email.');
                const params = new URLSearchParams({
                    purpose: 'forgot-password',
                    identifier: data.identifier || email,
                    channel: 'email',
                    cooldown: String(data.resendAvailableIn || 30),
                });
                router.push(`/auth/verify?${params.toString()}`);
            } else {
                toast.error(data.message || 'Failed to send OTP.');
            }
        } catch (error) {
            console.error('Password reset request failed:', error);
            toast.error('Something went wrong. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-body relative overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(#C9A34E 0.5px, transparent 0.5px)', backgroundSize: '40px 40px', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-[#FDFDFD]/90 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]"
            >
                <div className="flex flex-col p-8 sm:p-10">
                    <div className="mb-6 text-center">
                        <Link href="/" className="font-heading text-2xl font-semibold tracking-[0.18em] text-[#121212]">
                            VIONARA
                        </Link>
                    </div>

                    <div className="mb-6 text-center">
                        <h2 className="mb-2 font-heading text-[24px] font-medium text-[#121212]">Forgot Password?</h2>
                        <p className="text-[13px] text-gray-500">
                            Enter the email address associated with your account, and we'll send you an OTP to verify your identity.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="you@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="mt-2 w-full rounded-lg bg-[#121212] py-3.5 text-sm font-medium tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Sending Request...' : 'Send OTP'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <Link href="/auth" className="font-medium text-[#121212] underline underline-offset-4 hover:text-[#C9A34E]">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
