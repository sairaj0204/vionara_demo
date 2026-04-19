'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    HiOutlineShoppingBag,
    HiOutlineCreditCard,
    HiOutlineRefresh,
    HiOutlineChatAlt2,
    HiOutlineQuestionMarkCircle,
    HiOutlineTruck,
    HiOutlineXCircle,
    HiOutlineMail,
    HiOutlineChevronDown,
    HiOutlineCheckCircle,
    HiOutlineTicket,
    HiArrowLeft,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: 'How long do I have to request an exchange?',
        a: 'You have 5 days from the date of delivery to raise an exchange request through the Help Center.',
    },
    {
        q: 'Do you offer refunds or returns?',
        a: 'Vionara operates an exchange-only policy. We do not process returns or refunds. If you received a defective or incorrect item, we will happily exchange it.',
    },
    {
        q: 'How do I track my order?',
        a: 'Go to My Account → Order History. Each order shows a tracking number once shipped. You can also use the "Track Order" link in the footer.',
    },
    {
        q: 'Can I cancel my order after placing it?',
        a: 'Orders can be cancelled before they are shipped. Once the item is dispatched, cancellation is no longer possible. Please contact support immediately.',
    },
    {
        q: 'My payment was deducted but I didn\'t receive an order confirmation — what do I do?',
        a: 'This usually resolves within a few minutes. If the order doesn\'t appear in your account within 30 minutes, please raise a "Payment Issue" ticket and we\'ll investigate promptly.',
    },
    {
        q: 'How long does it take to get a replacement after exchange approval?',
        a: 'Once your exchange is approved (24–48 hrs), reverse pickup is arranged. Replacement delivery takes 5–7 business days from pick-up.',
    },
    {
        q: 'Do I need to pay for reverse shipping during an exchange?',
        a: 'No, reverse pickup is complimentary for all eligible exchange requests.',
    },
    {
        q: 'How do I check the status of my support ticket?',
        a: 'Fill in your email in the "Check Ticket Status" section on this Help Center page and we\'ll list all your tickets and their current status.',
    },
];

// ─── Support Categories ───────────────────────────────────────────────────────
const CATEGORIES = [
    {
        id: 'order-tracking',
        icon: HiOutlineTruck,
        color: '#3B82F6',
        bg: '#EFF6FF',
        title: 'Track My Order',
        desc: 'Get real-time shipping updates and delivery ETA.',
        cta: 'Track Order',
        link: '/track-order',
    },
    {
        id: 'cancel-order',
        icon: HiOutlineXCircle,
        color: '#EF4444',
        bg: '#FEF2F2',
        title: 'Cancel My Order',
        desc: 'Request cancellation before your order ships.',
        cta: 'Request Cancellation',
        link: null, // opens form
    },
    {
        id: 'exchange-request',
        icon: HiOutlineRefresh,
        color: '#C9A34E',
        bg: '#FCF8EE',
        title: 'Exchange Request',
        desc: 'Exchange within 5 days of delivery. No returns or refunds.',
        cta: 'Start Exchange',
        link: null,
    },
    {
        id: 'payment-issue',
        icon: HiOutlineCreditCard,
        color: '#8B5CF6',
        bg: '#F5F3FF',
        title: 'Payment Issue',
        desc: 'Payment deducted but no order? We\'ll sort it fast.',
        cta: 'Report Issue',
        link: null,
    },
    {
        id: 'product-query',
        icon: HiOutlineShoppingBag,
        color: '#10B981',
        bg: '#ECFDF5',
        title: 'Product Query',
        desc: 'Questions about jewellery, sizing, materials, or care.',
        cta: 'Ask Us',
        link: null,
    },
    {
        id: 'other',
        icon: HiOutlineChatAlt2,
        color: '#6B7280',
        bg: '#F9FAFB',
        title: 'Other Query',
        desc: 'Anything else? We\'re happy to help.',
        cta: 'Contact Us',
        link: null,
    },
];

const CATEGORY_LABELS = {
    'order-tracking': 'Order Tracking',
    'cancel-order': 'Cancel Order',
    'exchange-request': 'Exchange Request',
    'payment-issue': 'Payment Issue',
    'product-query': 'Product Query',
    'other': 'Other Query',
};

// ─── Support Form ─────────────────────────────────────────────────────────────
function SupportForm({ defaultCategory, onBack }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        category: defaultCategory || 'other',
        subject: '',
        message: '',
        orderNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(null); // ticketNumber

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const showOrderField = ['cancel-order', 'exchange-request', 'order-tracking', 'payment-issue'].includes(form.category);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/support-tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setSubmitted(data.ticketNumber);
            toast.success(`Ticket #${data.ticketNumber} submitted!`);
        } catch (err) {
            toast.error(err.message || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <HiOutlineCheckCircle className="text-emerald-500" size={36} />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-[#121212] mb-2">Ticket Submitted!</h2>
                <p className="text-gray-500 text-sm mb-2">Your ticket number is:</p>
                <div className="inline-block bg-[#FCF8EE] border border-[#F0EBE1] rounded-lg px-6 py-3 mb-4">
                    <span className="font-bold text-[#C9A34E] text-xl tracking-widest">{submitted}</span>
                </div>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                    We&apos;ll respond within 24–48 hours. Check ticket status by entering your email on this page.
                </p>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#C9A34E] hover:text-[#A37E22]"
                >
                    <HiArrowLeft size={16} /> Back to Help Center
                </button>
            </motion.div>
        );
    }

    const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C9A34E] focus:ring-2 focus:ring-[#C9A34E]/10 bg-gray-50 focus:bg-white transition-all';
    const labelClass = 'block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5';

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#121212] mb-5 transition-colors"
            >
                <HiArrowLeft size={16} /> Back
            </button>

            <h2 className="font-heading text-xl font-semibold text-[#121212] mb-6">
                {CATEGORY_LABELS[form.category] || 'Contact Support'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Your Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Full Name" />
                    </div>
                    <div>
                        <label className={labelClass}>Email Address *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Phone (optional)</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                        <label className={labelClass}>Category *</label>
                        <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {showOrderField && (
                    <div>
                        <label className={labelClass}>Order Number</label>
                        <input name="orderNumber" value={form.orderNumber} onChange={handleChange} className={inputClass} placeholder="e.g. ORD-00042" />
                    </div>
                )}

                <div>
                    <label className={labelClass}>Subject *</label>
                    <input name="subject" value={form.subject} onChange={handleChange} required className={inputClass} placeholder="Brief summary of your issue" />
                </div>

                <div>
                    <label className={labelClass}>Message *</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className={inputClass}
                        placeholder="Describe your issue in detail…"
                    />
                </div>

                {form.category === 'exchange-request' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
                        <strong>Exchange Policy:</strong> Exchanges are accepted within <strong>5 days of delivery</strong> for unused items in original packaging. We do not offer returns or refunds.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#121212] hover:bg-[#2A2A2A] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                    {loading ? 'Submitting…' : 'Submit Support Ticket'}
                </button>
            </form>
        </motion.div>
    );
}

// ─── Ticket Status Checker ─────────────────────────────────────────────────
function TicketStatus() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState(null);

    const STATUS_COLOR = {
        pending: { bg: '#FEF9C3', text: '#854D0E' },
        'in-progress': { bg: '#DBEAFE', text: '#1E40AF' },
        resolved: { bg: '#D1FAE5', text: '#065F46' },
        closed: { bg: '#F3F4F6', text: '#6B7280' },
    };

    const check = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/support-tickets?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-[#F0EBE1]">
            <h3 className="font-heading text-base font-semibold text-[#121212] mb-4 flex items-center gap-2">
                <HiOutlineTicket className="text-[#C9A34E]" size={20} /> Check Ticket Status
            </h3>
            <form onSubmit={check} className="flex gap-2">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email…"
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#C9A34E] bg-gray-50"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#121212] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
                >
                    {loading ? '…' : 'Check'}
                </button>
            </form>

            {tickets !== null && (
                <div className="mt-4 space-y-2">
                    {tickets.length === 0 ? (
                        <p className="text-sm text-gray-500">No tickets found for this email.</p>
                    ) : tickets.map((t) => {
                        const s = STATUS_COLOR[t.status] || STATUS_COLOR.pending;
                        return (
                            <div key={t._id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm">
                                <div>
                                    <p className="font-semibold text-[#121212] text-[13px]">{t.ticketNumber}</p>
                                    <p className="text-gray-500 text-[12px] truncate max-w-[200px]">{t.subject}</p>
                                </div>
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
                                    style={{ background: s.bg, color: s.text }}
                                >
                                    {t.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────
function FAQ() {
    const [open, setOpen] = useState(null);
    return (
        <div>
            <h2 className="font-heading text-xl font-semibold text-[#121212] mb-5 flex items-center gap-2">
                <HiOutlineQuestionMarkCircle className="text-[#C9A34E]" size={22} /> Frequently Asked Questions
            </h2>
            <div className="space-y-2">
                {FAQS.map((faq, i) => (
                    <div key={i} className="border border-[#F0EBE1] rounded-xl overflow-hidden bg-white">
                        <button
                            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#121212] hover:bg-[#FDFBF7] transition-colors"
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <span>{faq.q}</span>
                            <HiOutlineChevronDown
                                size={18}
                                className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <AnimatePresence initial={false}>
                            {open === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-5 pb-4 text-sm text-gray-600 leading-7">{faq.a}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main HelpCenter Page ──────────────────────────────────────────────────
export default function HelpCenter() {
    const [activeForm, setActiveForm] = useState(null); // category id or null

    if (activeForm) {
        return (
            <div className="min-h-screen bg-[#FDFDFD]">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                    <SupportForm defaultCategory={activeForm} onBack={() => setActiveForm(null)} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Hero */}
            <div className="bg-[#121212] text-white py-12 px-4 text-center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C9A34E] mb-2">Vionara</p>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-2">Help Center</h1>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        How can we help you? Choose a topic below or search your question.
                    </p>
                    <div className="mt-5 flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 max-w-sm mx-auto">
                        <HiOutlineMail className="text-[#C9A34E] flex-shrink-0" size={18} />
                        <a href="mailto:hello@vionara.com" className="text-sm text-gray-300 hover:text-white transition-colors">
                            hello@vionara.com
                        </a>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

                {/* Category Cards */}
                <div>
                    <h2 className="font-heading text-lg font-semibold text-[#121212] mb-5">What do you need help with?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const card = (
                                <motion.div
                                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                                    transition={{ duration: 0.18 }}
                                    className="bg-white border border-[#F0EBE1] rounded-2xl p-5 cursor-pointer flex flex-col gap-3 h-full"
                                >
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: cat.bg }}>
                                        <Icon size={22} style={{ color: cat.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-[14px] text-[#121212] mb-1">{cat.title}</p>
                                        <p className="text-[12px] text-gray-500 leading-5">{cat.desc}</p>
                                    </div>
                                    <span
                                        className="self-start text-[12px] font-semibold px-3 py-1 rounded-full"
                                        style={{ background: cat.bg, color: cat.color }}
                                    >
                                        {cat.cta} →
                                    </span>
                                </motion.div>
                            );

                            if (cat.link) {
                                return (
                                    <Link key={cat.id} href={cat.link} className="block">
                                        {card}
                                    </Link>
                                );
                            }

                            return (
                                <div key={cat.id} onClick={() => setActiveForm(cat.id)}>
                                    {card}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Exchange Policy Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[#121212] to-[#2A2A2A] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineRefresh className="text-[#C9A34E]" size={18} />
                            <p className="font-semibold text-sm">5-Day Exchange Policy</p>
                        </div>
                        <p className="text-gray-400 text-xs max-w-sm leading-5">
                            Vionara offers exchange-only within 5 days of delivery. No returns or refunds. Item must be unused and in original packaging.
                        </p>
                    </div>
                    <Link
                        href="/exchange-policy"
                        className="flex-shrink-0 text-xs font-semibold border border-[#C9A34E]/50 text-[#C9A34E] hover:bg-[#C9A34E]/10 px-4 py-2.5 rounded-lg transition-colors"
                    >
                        Read Full Policy
                    </Link>
                </div>

                {/* FAQ */}
                <FAQ />

                {/* Ticket Status */}
                <TicketStatus />

                {/* Contact Bar */}
                <div className="border border-[#F0EBE1] rounded-2xl bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-[15px] text-[#121212] mb-0.5">Can&apos;t find what you&apos;re looking for?</p>
                        <p className="text-sm text-gray-500">Our team is available Mon–Sat, 10 AM–7 PM IST.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="mailto:hello@vionara.com"
                            className="flex items-center gap-2 text-sm font-medium border border-[#121212] text-[#121212] px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <HiOutlineMail size={16} /> Email Us
                        </a>
                        <button
                            onClick={() => setActiveForm('other')}
                            className="flex items-center gap-2 text-sm font-medium bg-[#121212] text-white px-5 py-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                            <HiOutlineChatAlt2 size={16} /> Open a Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
