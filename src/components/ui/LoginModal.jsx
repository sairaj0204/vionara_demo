import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const INITIAL_FORM = {
    name: '',
    email: '',
    password: '',
};

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white';
const labelClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block';
const btnPrimary = 'w-full bg-[#121212] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2';

const LoginModal = ({ isOpen, onClose }) => {
    const { login, register, forgotPassword } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setIsLogin(true);
        setForm(INITIAL_FORM);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading) return; // Prevent double submit
        
        setLoading(true);

        try {
            const purpose = isLogin ? 'login' : 'signup';
            let res;
            
            if (isLogin) {
                res = await login(form.email, form.password);
            } else {
                res = await register(form.name, form.email, form.password);
            }

            // Success! The API returned the OTP session info.
            toast.success(res.message || 'Verification code sent to your email.');
            
            const params = new URLSearchParams({
                purpose,
                identifier: res.identifier || form.email,
                channel: res.channel || 'email',
                cooldown: String(res.resendAvailableIn || '30'),
            });

            onClose();

            if (typeof window !== 'undefined') {
                window.location.assign(`/auth/verify?${params.toString()}`);
            }
        } catch (error) {
            console.error('[LoginModal] Submit error:', error);
            const msg = error.response?.data?.message || error.message || 'Something went wrong. Please check your details and try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };



    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                            id="login-modal-close"
                        >
                            <HiX size={16} className="text-gray-500" />
                        </button>

                        <div className="border-b border-[#F0EBE1] bg-[#FDFBF7] px-8 pb-6 pt-8">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FCF8EE] text-[#C9A34E]">
                                    <HiOutlineSparkles size={14} />
                                </div>
                                <h2 className="font-heading text-lg font-medium text-[#121212]">VIONARA</h2>
                            </div>
                            <p className="text-[13px] text-gray-500">
                                {isLogin
                                    ? 'Sign in with your email address.'
                                    : 'Create your account and verify it with a 6-digit OTP.'}
                            </p>
                        </div>

                        <div className="px-8 py-6">
                            <div className="mb-6 flex rounded-lg bg-gray-50 p-1">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 rounded-md py-2.5 text-[12px] font-medium transition-all ${
                                        isLogin ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    LOGIN
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 rounded-md py-2.5 text-[12px] font-medium transition-all ${
                                        !isLogin ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    SIGN UP
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <label className={labelClass}>Full Name</label>
                                        <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="John Doe" />
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                        placeholder="you@example.com"
                                    />
                                </div>

                                {/* Password field — required for BOTH login and signup */}
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className={`${labelClass} mb-0`}>
                                            {isLogin ? 'Password' : 'Create Password'}
                                        </label>
                                        {isLogin && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!form.email) {
                                                        toast.error('Enter your email first');
                                                        return;
                                                    }
                                                    setLoading(true);
                                                    try {
                                                        await forgotPassword(form.email);
                                                        toast.success('Reset OTP sent to your email!');
                                                        const params = new URLSearchParams({
                                                            purpose: 'forgot-password',
                                                            identifier: form.email,
                                                            channel: 'email',
                                                            cooldown: '30',
                                                        });
                                                        onClose();
                                                        window.location.assign(`/auth/verify?${params.toString()}`);
                                                    } catch (err) {
                                                        toast.error(err.response?.data?.message || err.message || 'Failed to send reset OTP');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="text-[11px] font-medium text-[#C9A34E] transition-colors hover:text-[#A37E22]"
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={inputClass}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <p className="rounded-xl border border-[#F5EAD4] bg-[#FCF8EE] px-4 py-3 text-[12px] leading-6 text-gray-600">
                                    {isLogin
                                        ? "We'll verify your password then email a 6-digit OTP to complete your login."
                                        : "We'll send a 6-digit verification code to your email to confirm your account."}
                                </p>

                                <button type="submit" disabled={loading} className={btnPrimary}>
                                    {loading ? 'Sending...' : 'Continue to Verification'}
                                </button>

                                <p className="mt-4 text-center text-[10px] leading-relaxed text-gray-400">
                                    By continuing, you agree to Vionara&apos;s{' '}
                                    <Link href="/terms-and-conditions" className="underline hover:text-gray-600">Terms</Link> and{' '}
                                    <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
