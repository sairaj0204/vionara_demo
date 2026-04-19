'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    HiOutlineRefresh,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlinePhotograph,
    HiOutlineStar,
    HiOutlineShieldCheck,
    HiOutlineMail,
} from 'react-icons/hi';

const Section = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-10"
    >
        <h2 className="font-heading text-xl font-semibold text-[#121212] mb-4 pb-3 border-b border-[#F0EBE1]">
            {title}
        </h2>
        {children}
    </motion.div>
);

const Check = ({ text }) => (
    <li className="flex items-start gap-3">
        <HiOutlineCheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
        <span className="text-[14px] leading-6 text-gray-700">{text}</span>
    </li>
);

const Cross = ({ text }) => (
    <li className="flex items-start gap-3">
        <HiOutlineXCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
        <span className="text-[14px] leading-6 text-gray-700">{text}</span>
    </li>
);

const StepCard = ({ num, title, desc }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#C9A34E] text-white flex items-center justify-center text-sm font-bold">
            {num}
        </div>
        <div>
            <p className="text-[14px] font-semibold text-[#121212]">{title}</p>
            <p className="text-[13px] text-gray-500 mt-0.5 leading-5">{desc}</p>
        </div>
    </div>
);

export default function ExchangePolicy() {
    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Hero */}
            <div className="bg-[#121212] text-white py-16 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 bg-[#C9A34E]/20 text-[#C9A34E] text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase mb-4">
                        <HiOutlineRefresh size={14} /> Exchange Policy
                    </div>
                    <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-3">
                        5-Day Exchange Guarantee
                    </h1>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                        We stand behind the quality of every piece. If something isn&apos;t right,
                        we&apos;ll happily exchange it — no questions asked within 5 days of delivery.
                    </p>
                </motion.div>
            </div>

            {/* Highlight Cards */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: HiOutlineClock, title: '5-Day Window', desc: 'Raise your exchange request within 5 days of delivery.' },
                        { icon: HiOutlinePhotograph, title: 'Original Packaging', desc: 'Item must be unused and in original box / pouch.' },
                        { icon: HiOutlineShieldCheck, title: 'No Hassle', desc: 'We cover the logistics for eligible exchanges.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-2xl border border-[#F0EBE1] p-5 shadow-sm text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#FCF8EE] flex items-center justify-center mx-auto mb-3">
                                <Icon className="text-[#C9A34E]" size={20} />
                            </div>
                            <p className="font-semibold text-[14px] text-[#121212] mb-1">{title}</p>
                            <p className="text-[12px] text-gray-500 leading-5">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

                <Section title="What Is Our Exchange Policy?">
                    <p className="text-[14px] leading-7 text-gray-600 mb-4">
                        At Vionara, we offer a <strong>5-day exchange policy</strong> from the date of delivery.
                        We do <strong>not</strong> offer returns or refunds. However, if you received a
                        damaged item, the wrong product, or simply need a different size/style, we&apos;re
                        happy to arrange an exchange.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-900 leading-6">
                        <strong>Note:</strong> Vionara operates an <strong>exchange-only</strong> policy.
                        We do not process returns, refunds, or cancellations after the order has shipped.
                    </div>
                </Section>

                <Section title="Exchange Eligibility — What's Allowed">
                    <ul className="space-y-3 list-none">
                        <Check text="Exchange requested within 5 days of delivery date" />
                        <Check text="Item is unused, unworn, and in its original condition" />
                        <Check text="Item is in original packaging (box, pouch, tags intact)" />
                        <Check text="Damaged or defective item received from Vionara" />
                        <Check text="Wrong item delivered (different from what was ordered)" />
                        <Check text="Size or variant mismatch (subject to stock availability)" />
                    </ul>
                </Section>

                <Section title="What Cannot Be Exchanged">
                    <ul className="space-y-3 list-none">
                        <Cross text="Item was worn, used, or altered after delivery" />
                        <Cross text="Original packaging, tags, or invoice are missing" />
                        <Cross text="Exchange request raised after 5 days of delivery" />
                        <Cross text="Items purchased during clearance / final sale" />
                        <Cross text="Customised or engraved jewellery" />
                        <Cross text="Damage caused by improper use, chemicals, or negligence" />
                    </ul>
                </Section>

                <Section title="How to Request an Exchange (3 Simple Steps)">
                    <div className="space-y-5 mt-2">
                        <StepCard
                            num={1}
                            title="Visit Help Center"
                            desc={`Go to your profile → Help Center → Select "Exchange Request" and fill in your order number and reason.`}
                        />
                        <StepCard
                            num={2}
                            title="Upload Photos"
                            desc="Attach clear photos of the item you received (required for damaged/wrong item cases)."
                        />
                        <StepCard
                            num={3}
                            title="We'll Arrange Pick-up"
                            desc="Once approved (within 24–48 hrs), our logistics partner will pick up the item and ship the replacement."
                        />
                    </div>
                </Section>

                <Section title="Important Notes">
                    <ul className="space-y-2 list-none">
                        <Check text="Exchanges are subject to stock availability. If the requested item is unavailable, we'll offer an alternate of equal value." />
                        <Check text="Reverse pickup will be arranged at no extra cost for eligible exchanges." />
                        <Check text="Processing time: 5–7 business days for replacement delivery after pick-up." />
                        <Check text="You'll receive an email/SMS confirmation at every step." />
                    </ul>
                </Section>

                {/* CTA */}
                <div className="mt-10 rounded-2xl bg-[#121212] text-white p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <HiOutlineMail className="text-[#C9A34E]" size={18} />
                            <p className="font-semibold text-[15px]">Need help?</p>
                        </div>
                        <p className="text-gray-400 text-sm">Our support team is available Mon–Sat, 10 AM–7 PM IST.</p>
                    </div>
                    <Link
                        href="/help-center"
                        className="flex-shrink-0 bg-[#C9A34E] hover:bg-[#A37E22] text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Raise Exchange Request
                    </Link>
                </div>
            </div>
        </div>
    );
}
