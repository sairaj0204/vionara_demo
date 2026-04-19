
import { motion } from 'framer-motion';
import Link from 'next/link';

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

const differentiators = [
    {
        icon: '✦',
        title: 'Global-Trend Designs',
        desc: 'Every collection is inspired by international runways and street style, bringing world-class aesthetics to your doorstep.',
    },
    {
        icon: '◇',
        title: 'Affordable Luxury',
        desc: 'Premium finish, precious-looking pieces — crafted to feel extravagant without the extravagant price tag.',
    },
    {
        icon: '❀',
        title: 'Occasion-Ready Curation',
        desc: 'From Sunday brunch to wedding receptions, we curate for every chapter of your life.',
    },
    {
        icon: '⟡',
        title: 'Seamless Shopping',
        desc: 'A smooth, secure, and delightful online experience — because luxury should extend to every touchpoint.',
    },
    {
        icon: '♡',
        title: 'Customer-First Always',
        desc: 'Every decision at Vionara starts and ends with one question: does this make our customer happier?',
    },
    {
        icon: '◈',
        title: 'Quality You Can Feel',
        desc: 'Each piece is hand-selected, quality-checked, and shipped only when it meets our standard of excellence.',
    },
];

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white">

            <title>About Us | Vionara — Shine Beyond Limits</title>
            <meta
                name="description"
                content="Discover the story behind Vionara — premium, affordable, and trend-forward jewellery crafted for modern India. Elegance meets expression."
            />


            {/* ══ HERO BANNER ══ */}
            <section className="relative overflow-hidden bg-[#fdf9f4]">
                {/* Decorative background rings */}
                <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full border border-[#CBA135]/10 pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-[280px] h-[280px] rounded-full border border-[#CBA135]/15 pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full border border-[#7a1f1f]/8 pointer-events-none" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center relative z-10">
                    <motion.p
                        {...fadeUp(0)}
                        className="text-[11px] tracking-[0.3em] uppercase text-[#CBA135] font-semibold mb-5"
                    >
                        Our Story
                    </motion.p>

                    <motion.h1
                        {...fadeUp(0.08)}
                        className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#121212] leading-tight mb-6"
                        style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
                    >
                        Where Elegance<br />
                        <span
                            className="text-[#7a1f1f]"
                            style={{ fontStyle: 'italic' }}
                        >
                            Meets Expression
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp(0.16)}
                        className="text-gray-500 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        At Vionara, we believe jewellery is not just an accessory —
                        it&apos;s a reflection of who you are.
                    </motion.p>

                    {/* Thin gold divider */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className="mt-10 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#CBA135] to-transparent origin-center"
                    />
                </div>
            </section>

            {/* ══ BRAND STORY ══ */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-7">
                <motion.p {...fadeUp(0)} className="text-gray-600 text-base sm:text-[1.05rem] leading-[1.9]">
                    Every piece tells a story — of <span className="text-[#121212] font-medium">confidence</span>,{' '}
                    <span className="text-[#121212] font-medium">beauty</span>, and{' '}
                    <span className="text-[#121212] font-medium">individuality</span>.
                </motion.p>

                <motion.p {...fadeUp(0.05)} className="text-gray-600 text-base sm:text-[1.05rem] leading-[1.9]">
                    Founded with a vision to bring premium, affordable, and trend-forward jewellery to modern
                    India, Vionara blends <em>timeless craftsmanship</em> with contemporary design. From everyday
                    essentials to statement pieces, our collections are curated to suit every mood, moment, and style.
                </motion.p>

                <motion.p {...fadeUp(0.1)} className="text-gray-600 text-base sm:text-[1.05rem] leading-[1.9]">
                    We specialise in artificial and fashion jewellery that looks luxurious without compromising on
                    comfort or affordability. Each product is carefully selected and quality-checked to ensure
                    durability, shine, and elegance.
                </motion.p>
            </section>

            {/* ══ WHAT MAKES US DIFFERENT ══ */}
            <section className="bg-[#fdf9f4] py-16 lg:py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeUp(0)} className="text-center mb-12">
                        <p className="text-[11px] tracking-[0.3em] uppercase text-[#CBA135] font-semibold mb-3">
                            ✨ What Makes Vionara Different
                        </p>
                        <h2
                            className="font-heading text-3xl lg:text-4xl text-[#121212] font-semibold"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            The Vionara Promise
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {differentiators.map((item, i) => (
                            <motion.div
                                key={item.title}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.07)' }}
                                className="bg-white rounded-2xl p-7 border border-gray-100 transition-all duration-300 group"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-[#CBA135] bg-[#CBA135]/8 text-lg group-hover:bg-[#CBA135]/15 transition-colors duration-300"
                                >
                                    {item.icon}
                                </div>
                                <h3
                                    className="font-semibold text-[#121212] mb-2 text-[0.95rem]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ MISSION STATEMENT ══ */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <motion.div
                    {...fadeUp(0)}
                    className="relative text-center"
                >
                    {/* Large decorative quote mark */}
                    <div
                        className="text-[120px] leading-none text-[#CBA135]/10 font-serif absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none"
                        aria-hidden="true"
                    >
                        &quot;
                    </div>

                    <p
                        className="relative text-[#121212] text-xl sm:text-2xl font-medium leading-[1.7] italic"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Our mission is simple — to make every individual feel{' '}
                        <span className="text-[#7a1f1f]">confident</span>,{' '}
                        <span className="text-[#7a1f1f]">stylish</span>, and{' '}
                        <span className="text-[#7a1f1f]">unique</span> through jewellery.
                    </p>

                    <div className="mt-8 text-gray-500 text-base sm:text-[1.05rem] leading-relaxed">
                        <p>
                            Whether you&apos;re dressing up for a special occasion or adding a subtle charm to your
                            daily look, Vionara is here to complete your story.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* ══ MEET OUR FOUNDERS ══ */}
            <section className="bg-[#fdf9f4] py-20 lg:py-24 relative border-y border-[#CBA135]/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeUp(0)} className="text-center mb-16">
                        <h2
                            className="font-heading text-3xl lg:text-4xl text-[#121212] font-semibold"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Meet Our Founders
                        </h2>
                        <div className="mt-6 mx-auto w-16 h-px bg-[#CBA135]" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                name: 'Bhairavi Bamane',
                                role: 'Founder',
                                desc: 'Driven by a passion for timeless design, Bhairavi envisioned Vionara as a space where luxury meets everyday elegance.',
                                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'
                            },
                            {
                                name: 'Shahaji Salunkhe',
                                role: 'Co-Founder',
                                desc: 'With an eye for detail and a commitment to quality, Shahaji translates the brand’s vision into a seamless customer experience.',
                                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80'
                            }
                        ].map((founder, i) => (
                            <motion.div
                                key={founder.name}
                                {...fadeUp(i * 0.1)}
                                whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(0,0,0,0.06)' }}
                                className="bg-white rounded-xl overflow-hidden border border-[#CBA135]/15 transition-all duration-500 group flex flex-col sm:flex-row items-center sm:items-stretch"
                            >
                                {/* <div className="w-full sm:w-2/5 md:w-5/12 aspect-square sm:aspect-auto overflow-hidden relative border-r border-[#CBA135]/10">
                                    <img 
                                        src={founder.image} 
                                        alt={founder.name}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                                        loading="lazy"
                                    />
                                </div> */}
                                <div className="p-8 sm:w-3/5 md:w-7/12 flex flex-col justify-center text-center sm:text-left">
                                    <h3
                                        className="text-xl sm:text-[22px] font-semibold text-[#121212] mb-1.5"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        {founder.name}
                                    </h3>
                                    <p className="text-[#CBA135] text-[10px] tracking-[0.25em] uppercase font-bold mb-4">
                                        {founder.role}
                                    </p>
                                    <p className="text-gray-500 text-[14px] leading-relaxed font-light">
                                        {founder.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CLOSING CTA STRIP ══ */}
            <section className="bg-[#121212] py-16 lg:py-20 relative overflow-hidden">
                {/* Decorative glow circles */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#CBA135]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#7a1f1f]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.p
                        {...fadeUp(0)}
                        className="text-[11px] tracking-[0.3em] uppercase text-[#CBA135] font-semibold mb-5"
                    >
                        ✨ Our Tagline
                    </motion.p>

                    <motion.h2
                        {...fadeUp(0.08)}
                        className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Shine Beyond Limits —<br />
                        <span className="text-[#CBA135]">with Vionara.</span>
                    </motion.h2>

                    <motion.p
                        {...fadeUp(0.16)}
                        className="text-gray-400 text-base font-light mb-10 max-w-xl mx-auto"
                    >
                        Explore our collections and discover a piece that tells your story.
                    </motion.p>

                    <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/shop"
                            id="about-shop-cta"
                            className="inline-flex items-center justify-center gap-2 bg-[#CBA135] text-white text-[12px] font-semibold tracking-[0.15em] uppercase px-8 py-4 rounded-none hover:bg-[#A37E22] transition-all duration-300 hover:shadow-lg hover:shadow-[#CBA135]/20"
                        >
                            Shop the Collection
                        </Link>
                        <Link
                            href="/collections/rings"
                            id="about-new-arrivals-cta"
                            className="inline-flex items-center justify-center gap-2 border border-white/20 text-white text-[12px] font-semibold tracking-[0.15em] uppercase px-8 py-4 rounded-none hover:border-white/50 transition-all duration-300"
                        >
                            Explore Rings
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
