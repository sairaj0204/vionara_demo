'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AuthResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword } = useAuth();
    
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';
    
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !token) {
            toast.error('Invalid reset session. Please try again.');
            return;
        }

        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, token, form.password);
            toast.success('Password updated successfully! Please log in.');
            router.push('/'); // Redirect home, they can login via Modal
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (!email || !token) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
                    <h1 className="font-heading text-3xl text-[#121212] mb-3">Invalid Link</h1>
                    <p className="text-sm text-gray-500 mb-6">This reset session is invalid or expired.</p>
                    <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-[#121212] px-5 py-3 text-sm font-medium text-white hover:bg-[#2A2A2A] transition-colors">
                        Back to Home
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C9A34E] mb-3">Secure Reset</p>
                    <h1 className="font-heading text-3xl text-[#121212] mb-3">Set New Password</h1>
                    <p className="text-sm leading-7 text-gray-500">
                        Create a new secure password for your account associated with:
                    </p>
                    <p className="mt-2 rounded-xl bg-[#FCF8EE] px-4 py-3 text-sm font-medium text-[#121212] break-all">
                        {email}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#121212] px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6 text-sm text-center">
                    <p className="text-gray-500">
                        Remembered your password? <Link href="/" className="font-medium text-[#121212] underline underline-offset-4">Go back and login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
