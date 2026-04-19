'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiStar, HiArrowRight } from 'react-icons/hi';
import ProductCard from '../product/ProductCard';
import { getProducts, getCategories } from '../../services/api';
import HeroBanner from './HeroBanner';
import axios from 'axios';

const filterTabs = ['All', 'Necklaces', 'Bracelets', 'Earrings', 'Rings', 'Mens', 'Mangalsutra'];

const giftCombos = [
    { name: 'Eternal Love Set', desc: 'Ring + Necklace Combo', price: 2499, mrp: 4999, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
    { name: 'Classic Charm Set', desc: 'Earrings + Bracelet Combo', price: 1999, mrp: 3999, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
    { name: 'Golden Glow Set', desc: 'Complete Jewellery Set', price: 3999, mrp: 7999, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400' },
];

const reviews = [
    { name: 'Priya S.', rating: 5, text: 'Absolutely stunning! The quality exceeded my expectations. The gold plating is so thick and premium.', product: 'Celestial Solitaire Ring' },
    { name: 'Ananya P.', rating: 5, text: "Got the Diamond Drop Earrings as a gift for my mother. She was overwhelmed with joy. VIONARA's packaging is also very premium.", product: 'Diamond Drop Earrings' },
    { name: 'Ritu M.', rating: 5, text: "The Solitaire Pendant Necklace is my everyday go-to piece now. It's elegant, lightweight, and gets compliments everywhere.", product: 'Solitaire Pendant Necklace' },
    { name: 'Kavya R.', rating: 4, text: 'Beautiful Tennis Bangle! The diamonds are so sparkly and the clasp is very secure. Perfect for my wedding reception.', product: 'Diamond Tennis Bangle' },
];

const Home = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [bottomStrip, setBottomStrip] = useState({ isActive: true, speed: 30, messages: [
        "✨ Elegant Jewellery for Every Occasion",
        "✨ Free Shipping Above ₹999",
        "✨ 5L+ Happy Customers"
    ]});
    const [instagramPosts, setInstagramPosts] = useState({
        isActive: true,
        posts: [
            { imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', link: '' },
            { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', link: '' },
            { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', link: '' },
            { imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', link: '' },
            { imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400', link: '' },
            { imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b610?w=400', link: '' }
        ]
    });

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600';
        if (url.startsWith('/uploads')) {
            return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
        }
        return url;
    };

    useEffect(() => {
        console.log("✅ Rendering <Home /> Component from /components/home");
        
        const fetchProducts = async () => {
            try {
                const { data } = await getProducts({ limit: 50 });
                console.log("📡 [API Log] Fetched Products:", data);
                if (data && data.success && Array.isArray(data.products)) {
                    setAllProducts(data.products);
                } else {
                    setAllProducts([]);
                }
            } catch (error) {
                console.error("❌ [API Error] Error fetching products:", error);
                setAllProducts([]);
            }
        };

        const fetchCategoriesData = async () => {
            try {
                const { data } = await getCategories();
                if (data && data.success && data.categories) {
                    setCategories(data.categories.filter(c => c.isActive));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchSettingsData = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                if (data && data.success && data.settings) {
                    if (data.settings.announcementBottom) setBottomStrip(data.settings.announcementBottom);
                    if (data.settings.instagramGallery) setInstagramPosts(data.settings.instagramGallery);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        fetchProducts();
        fetchCategoriesData();
        fetchSettingsData();
    }, []);

    const filteredProducts = activeFilter === 'All'
        ? (allProducts || []).slice(0, 8)
        : (allProducts || []).filter(p => {
            const cat = p?.category?.toLowerCase() || '';
            const filter = activeFilter.toLowerCase();
            if (filter === 'mangalsutra') return p.tags?.includes('mangalsutra');
            if (filter === 'mens') return p.tags?.includes('mens') || p.tags?.includes('men');
            if (filter === 'bracelets') return cat === 'bangles';
            return cat === filter;
        }).slice(0, 8);

    const featuredProducts = (allProducts || []).filter(p => p?.isFeatured).slice(0, 4);
    const bestsellers = (allProducts || []).filter(p => p?.isBestseller).slice(0, 4);

    return (
        <div className="bg-white">
            <HeroBanner />

            {bottomStrip?.isActive && (bottomStrip?.messages?.length || 0) > 0 && (
                <section className="w-full bg-black h-[45px] m-0 p-0 marquee-container items-center border-none">
                    <div className="marquee-content h-full items-center min-w-max" style={{ animationDuration: `${bottomStrip.speed}s` }}>
                        {[...bottomStrip.messages, ...bottomStrip.messages, ...bottomStrip.messages].map((phrase, i) => (
                            <div key={i} className="flex items-center h-full">
                                <span className="text-white text-[13px] font-medium mx-4 lg:mx-8" style={{ letterSpacing: '0.05em' }}>
                                    {phrase}
                                </span>
                                <span className="text-white/30 mx-2 text-[10px]">•</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="py-10 bg-white" id="categories-section">
                <div className="w-full px-2 sm:px-4">
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat._id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.5 }}
                            >
                                <Link href={`/collections/${cat.slug}`} className="category-card block group">
                                    <div className={`aspect-[4/5] bg-gray-200 relative overflow-hidden rounded-none animate-pulse`}>
                                        <img
                                            src={getImageUrl(cat.thumbnail)}
                                            alt={cat.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 absolute inset-0 text-transparent"
                                            loading="lazy"
                                            onLoad={(e) => {
                                                e.target.parentElement.classList.remove('animate-pulse', 'bg-gray-200');
                                                e.target.parentElement.classList.add('bg-gray-50');
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600';
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-white/90 py-2.5 sm:py-3.5 px-2">
                                            <h3 className="text-charcoal text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-center truncate">
                                                {cat.name} 
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 lg:py-24 bg-white" id="top-styles-section">
                <div className="w-full px-4 sm:px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-[28px] sm:text-4xl font-heading font-medium tracking-widest uppercase text-charcoal mb-4">
                            TOP STYLES
                        </h2>
                        <div className="w-16 h-[1.5px] bg-gold mx-auto" />
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, i) => (
                                <ProductCard key={product._id} product={product} index={i} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <p className="text-gray-400 text-sm">No products found. Try a different filter.</p>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-medium text-charcoal hover:text-gold transition-colors pb-1 border-b border-charcoal hover:border-gold"
                        >
                            View All Products <HiArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-10 bg-white" id="promo-banner-section">
                <div className="w-full px-0">
                    <div className="relative overflow-hidden bg-[#F5F1EB] min-h-[300px] sm:min-h-[400px] flex items-center">
                        <div className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 py-12 flex flex-col items-center text-center">
                            <p className="text-gold text-[11px] tracking-[0.4em] uppercase mb-4 font-bold">Limited Edition</p>
                            <h2 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-charcoal mb-6 leading-tight uppercase font-medium">
                                The Gold Edit
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base font-light mb-10 max-w-xl leading-relaxed tracking-wide">
                                Discover our premium 18K gold-plated collection. Thick plating that lasts, at prices that surprise.
                            </p>
                            <Link
                                href="/shop"
                                className="bg-charcoal text-white px-12 py-4 text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-gold transition-all duration-300"
                            >
                                Shop The Collection
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 lg:py-20 bg-ivory" id="gift-combos-section">
                <div className="w-full px-4 sm:px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <p className="text-gold text-[11px] tracking-[0.3em] uppercase mb-3 font-medium">Gift Sets</p>
                        <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-2">FLAT 50% OFF</h2>
                        <p className="text-gray-500 text-sm font-light">Curated gift combos for every occasion</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                        {giftCombos.map((combo, i) => (
                            <motion.div
                                key={combo.name}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className="group bg-white overflow-hidden border border-gray-100 cursor-pointer"
                            >
                                <Link href="/shop">
                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={combo.image}
                                            alt={combo.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-8 text-center bg-white group-hover:bg-[#F9F6F1] transition-colors duration-500">
                                        <h3 className="font-heading text-xl text-charcoal mb-2 tracking-wide uppercase">{combo.name}</h3>
                                        <p className="text-gray-400 text-xs mb-4 tracking-widest uppercase">{combo.desc}</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-charcoal font-bold text-lg">₹{combo.price.toLocaleString('en-IN')}</span>
                                            <span className="text-gray-400 text-sm line-through">₹{combo.mrp.toLocaleString('en-IN')}</span>
                                            <span className="text-gold text-xs font-bold">(50% OFF)</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {bestsellers.length > 0 && (
                <section className="py-16 lg:py-24 bg-white text-charcoal" id="bestsellers-section">
                    <div className="w-full px-4 sm:px-8 lg:px-16">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <p className="text-gold text-[10px] tracking-[0.5em] uppercase mb-4 font-bold">The Favorites</p>
                            <h2 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 uppercase tracking-wider font-medium">Our Bestsellers</h2>
                            <div className="w-16 h-[1.5px] bg-gold mx-auto" />
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {bestsellers.map((product, i) => (
                                <ProductCard key={product._id} product={product} index={i} />
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <Link href="/shop" className="inline-block px-12 py-4 border border-charcoal text-charcoal text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all duration-300">
                                View Collection
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section className="py-20 bg-[#F9F6F1]" id="reviews-section">
                <div className="w-full px-4 sm:px-8 lg:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-heading text-4xl text-charcoal mb-4 uppercase tracking-widest">Voices of Elegance</h2>
                        <p className="text-gold text-[10px] tracking-[0.4em] uppercase font-bold">Trusted by 5L+ customers</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className="bg-white p-10 flex flex-col h-full border border-gray-100"
                            >
                                <div className="flex gap-1 mb-6">
                                    {Array.from({ length: review.rating }).map((_, j) => (
                                        <HiStar key={j} size={14} className="text-gold" />
                                    ))}
                                </div>
                                <p className="text-[15px] text-gray-600 leading-relaxed font-light italic mb-8 flex-grow">"{review.text}"</p>
                                <div className="mt-auto">
                                    <div className="w-10 h-[1.5px] bg-gold mb-4" />
                                    <p className="font-bold text-[12px] uppercase tracking-widest text-charcoal">{review.name}</p>
                                    <p className="text-[11px] text-gray-400 font-medium uppercase mt-1 tracking-tighter">{review.product}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {instagramPosts?.isActive && instagramPosts?.posts?.length > 0 && (
                <section className="py-16 bg-white border-t border-gray-50">
                    <div className="w-full px-1 sm:px-2">
                        <div className="text-center mb-12">
                            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-[11px] tracking-[0.5em] uppercase text-charcoal font-bold">
                                Experience VIONARA on Instagram
                            </motion.p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                            {instagramPosts.posts.slice(0, 6).map((post, i) => (
                                <motion.a
                                    key={i}
                                    href={post.link || "#"}
                                    target={post.link ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                    className="aspect-square overflow-hidden group relative block"
                                >
                                    <img 
                                        src={getImageUrl(post.imageUrl)} 
                                        alt={`Instagram ${i + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" 
                                        loading="lazy" 
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400"; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
