import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineGift, HiOutlineHeart, HiOutlineSparkles } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const INITIAL_FORM = {
    name: '',
    email: '',
    password: '',
};

const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-4 focus:ring-[#C9A34E]/10 transition-all text-[#121212] bg-gray-50 focus:bg-white';
const labelClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block';

const AuthPage = () => {
    const router = useRouter();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const goTo = (path) => {
        if (router) {
            router.push(path);
            return;
        }

        if (typeof window !== 'undefined') {
            window.location.assign(path);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const params = new URLSearchParams({
            purpose: isLogin ? 'login' : 'signup',
            identifier: form.email,
            channel: 'email',
            cooldown: '30',
        });

        try {
            // Await the backend request (login/register)
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                await register(form.name, form.email, form.password);
            }

            // Success: only happens if the promise resolves
            toast.success('OTP sent to your email.');
            goTo(`/auth/verify?${params.toString()}`);
        } catch (error) {
            console.error('Auth action failed:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Something went wrong. Please check your credentials and try again.';
            toast.error(errorMsg);
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
                className="relative z-10 flex min-h-[600px] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] md:flex-row"
            >
                <div className="hidden w-[45%] flex-col justify-center border-r border-[#F0EBE1] bg-[#FDFBF7] p-12 md:flex">
                    <Link href="/" className="mb-12 inline-block">
                        <h1 className="font-heading text-2xl font-semibold tracking-[0.18em] text-[#121212]">VIONARA</h1>
                    </Link>

                    <h2 className="mb-4 font-heading text-4xl font-medium leading-[1.15] tracking-tight text-[#C9A34E]">
                        Secure signup <br />
                        <span className="text-[#121212]">with email verification</span>
                    </h2>

                    <p className="mb-10 max-w-sm text-sm leading-relaxed text-gray-500">
                        Create your account with a short verification step so your wishlist, orders, and profile stay protected from the very beginning.
                    </p>

                    <div className="space-y-5">
                        <Feature icon={<HiOutlineSparkles size={16} />} title="OTP Protected" description="Every new signup is confirmed with a 6-digit verification code sent to your email." />
                        <Feature icon={<HiOutlineHeart size={16} />} title="Saved Wishlist" description="Keep your favourite pieces synced as soon as your account is verified." />
                        <Feature icon={<HiOutlineGift size={16} />} title="Faster Checkout" description="Store your details securely and reuse them across future purchases." />
                    </div>
                </div>

                <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-[55%] md:p-14 lg:p-16">
                    <div className="mb-10 text-center md:hidden">
                        <Link href="/" className="font-heading text-3xl font-semibold tracking-[0.18em] text-[#121212]">
                            VIONARA
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="mb-1 font-heading text-[26px] font-medium text-[#121212]">Welcome to Vionara</h2>
                        <p className="text-[13px] text-gray-500">
                            {isLogin
                                ? 'Enter your email and password, then confirm the OTP sent to your email.'
                                : 'Create your account, then confirm it with a one-time OTP.'}
                        </p>
                    </div>

                    <div className="mb-8 flex rounded-lg bg-gray-50 p-1">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 rounded-md py-2.5 text-[13px] font-medium transition-all ${isLogin ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            LOGIN
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 rounded-md py-2.5 text-[13px] font-medium transition-all ${!isLogin ? 'bg-white text-[#121212] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            SIGN UP
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                    placeholder="John Doe"
                                />
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

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className={`${labelClass} mb-0`}>Password</label>
                                {isLogin && (
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-[12px] font-medium text-[#C9A34E] transition-colors hover:text-[#A37E22]"
                                    >
                                        Forgot password?
                                    </Link>
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

                        {!isLogin && (
                            <p className="rounded-xl border border-[#F5EAD4] bg-[#FCF8EE] px-4 py-3 text-[13px] leading-6 text-gray-600">
                                We&apos;ll send a 6-digit OTP to your email address. The code stays valid for 5 minutes.
                            </p>
                        )}

                        {isLogin && (
                            <p className="rounded-xl border border-[#F5EAD4] bg-[#FCF8EE] px-4 py-3 text-[13px] leading-6 text-gray-600">
                                We&apos;ll verify your password on the server, then email you a 6-digit OTP before login completes.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-lg bg-[#121212] py-3.5 text-sm font-medium tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Continue to Verification'}
                        </button>

                        <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
                            By continuing, you agree to Vionara&apos;s <br />
                            <Link href="/terms-and-conditions" className="underline hover:text-gray-600">Terms of Service</Link> and{' '}
                            <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

function Feature({ icon, title, description }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FCF8EE] text-[#C9A34E]">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-[#121212]">{title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
            </div>
        </div>
    );
}

export default AuthPage;
