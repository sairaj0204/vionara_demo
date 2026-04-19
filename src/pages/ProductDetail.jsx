import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import {
    HiStar, HiOutlineHeart, HiHeart, HiCheck, HiOutlineTruck,
    HiShieldCheck, HiRefresh, HiChevronLeft, HiChevronRight,
    HiOutlineTag, HiOutlineGift, HiOutlineBadgeCheck, HiSparkles,
    HiOutlineShare, HiOutlineShoppingBag,
} from 'react-icons/hi';
import { HiMiniChevronLeft, HiMiniChevronRight } from 'react-icons/hi2';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/product/ProductCard';
import { getProductBySlug, getRelatedProducts, addReview } from '@/services/api';
import toast from 'react-hot-toast';

/* ─── Tiny reusable sub-components ──────────────────────────────────────── */

const TrustBadge = ({ icon: Icon, label, sub }) => (
    <div className="flex flex-col items-center gap-1.5 text-center px-2">
        <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center">
            <Icon size={18} className="text-[#B8922E]" />
        </div>
        <p className="text-[11px] font-semibold text-[#121212] uppercase tracking-wider leading-tight">{label}</p>
        <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
    </div>
);

const OfferBadge = ({ icon: Icon, text, highlight, bg = 'bg-amber-50', border = 'border-amber-200', textColor = 'text-amber-800' }) => (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${bg} ${border}`}>
        <div className="flex-shrink-0 mt-0.5">
            <Icon size={17} className={textColor} />
        </div>
        <p className="text-[13px] leading-snug text-gray-700">
            {highlight && (
                <span className={`font-bold ${textColor}`}>{highlight} </span>
            )}
            {text}
        </p>
    </div>
);

const StarRating = ({ rating = 0, count = 0, size = 14 }) => (
    <div className="flex items-center gap-1.5">
        <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
                <HiStar key={i} size={size} className={i < Math.round(rating) ? 'text-[#CBA135]' : 'text-gray-200'} />
            ))}
        </div>
        {count > 0 && (
            <span className="text-[12px] text-gray-500">({count} reviews)</span>
        )}
    </div>
);

/* ─── Related Product Mini-card ──────────────────────────────────────────── */

const RelatedCard = ({ product, onAddToCart }) => {
    const [hovered, setHovered] = useState(false);
    const discountPercent = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
        <div
            className="flex-shrink-0 w-[220px] sm:w-[240px] group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative overflow-hidden bg-[#F9F7F4] aspect-[3/4] rounded-xl">
                <Image
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-700 ${hovered && product.images?.[1] ? 'opacity-0' : 'opacity-100'} group-hover:scale-[1.04]`}
                    sizes="260px"
                />
                {product.images?.[1] && (
                    <Image
                        src={product.images[1]}
                        alt={`${product.name} view 2`}
                        fill
                        className={`object-cover transition-all duration-700 absolute inset-0 ${hovered ? 'opacity-100 scale-[1.04]' : 'opacity-0 scale-100'}`}
                        sizes="260px"
                    />
                )}
                {discountPercent > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-[#121212] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                        {discountPercent}% OFF
                    </div>
                )}
                {(product.isNewArrival || product.isBestseller) && (
                    <div className="absolute top-2.5 right-2.5 bg-[#D4AF37] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                        {product.isNewArrival ? 'New' : 'Best'}
                    </div>
                )}
                {/* Add to cart overlay */}
                <button
                    onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
                    className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-[#121212] hover:text-white"
                >
                    Add to Bag
                </button>
            </Link>

            {/* Info */}
            <div className="mt-3 px-0.5">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-[13px] font-medium text-[#121212] leading-snug line-clamp-2 hover:text-[#CBA135] transition-colors mb-1">{product.name}</h3>
                </Link>
                <StarRating rating={product.averageRating} count={product.numReviews} size={11} />
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[15px] font-bold text-[#121212]">₹{product.price?.toLocaleString('en-IN')}</span>
                    {product.mrp > product.price && (
                        <span className="text-[12px] text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

const ProductDetail = ({ params }) => {
    const router = useRouter();
    const slug = params?.slug || '';
    const { user, setShowLoginModal } = useAuth();
    const { addItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();

    // Product data
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Image gallery
    const [selectedImage, setSelectedImage] = useState(0);
    const [zoomParams, setZoomParams] = useState({ isZoomed: false, x: 0, y: 0 });
    const imageContainerRef = useRef(null);

    // Actions
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [pincode, setPincode] = useState('');
    const [pincodeResult, setPincodeResult] = useState(null);

    // Reviews
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [hoverRating, setHoverRating] = useState(0);

    // Related products scroll
    const relatedScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    /* ── Fetch product ── */
    useEffect(() => {
        if (!slug) { setLoading(false); setError('No product slug provided.'); return; }

        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await getProductBySlug(slug);
                if (data.success && data.product) {
                    setProduct(data.product);
                    try {
                        const relatedRes = await getRelatedProducts(data.product._id);
                        if (relatedRes.data.success) {
                            setRelatedProducts(relatedRes.data.products?.slice(0, 8) || []);
                        }
                    } catch { /* non-critical */ }
                } else {
                    setError(data.message || 'Product not found.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedImage(0);
        setQuantity(1);
        setAddedToCart(false);
    }, [slug]);

    /* ── Related scroll helpers ── */
    const checkScroll = useCallback(() => {
        const el = relatedScrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }, []);

    const scrollRelated = (dir) => {
        const el = relatedScrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 280, behavior: 'smooth' });
        setTimeout(checkScroll, 350);
    };

    /* ── Image zoom ── */
    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
        setZoomParams({ isZoomed: true, x, y });
    };
    const handleMouseLeave = () => setZoomParams(prev => ({ ...prev, isZoomed: false }));

    /* ── Cart & wishlist handlers ── */
    const handleAddToCart = useCallback(() => {
        addItem(product, quantity);
        setAddedToCart(true);
        toast.success('Added to bag! 🛍️');
        setTimeout(() => setAddedToCart(false), 2200);
    }, [addItem, product, quantity]);

    const handleRelatedAddToCart = useCallback((p) => {
        addItem(p, 1);
        toast.success('Added to bag!');
    }, [addItem]);

    const handleBuyNow = useCallback(() => {
        if (!user) { setShowLoginModal(true); return toast.error('Please login to checkout'); }
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('checkout:buyNowItem', JSON.stringify({
                product, quantity, price: product.price, name: product.name, image: product.images?.[0],
            }));
        }
        router.push('/checkout?buyNow=1');
    }, [user, product, quantity, router, setShowLoginModal]);

    const handleWishlist = () => {
        toggleItem(product);
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♥');
    };

    const handleShare = async () => {
        try {
            await navigator.share({ title: product.name, url: window.location.href });
        } catch {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
        }
    };

    /* ── Review submit ── */
    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) { setShowLoginModal(true); return toast.error('Please login to review'); }
        setSubmittingReview(true);
        try {
            const { data } = await addReview(product._id, reviewForm);
            if (data.success) {
                toast.success('Review submitted!');
                setReviewForm({ rating: 5, comment: '' });
                const refreshed = await getProductBySlug(slug);
                setProduct(refreshed.data.product);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    /* ── Pincode check ── */
    const handleCheckPincode = () => {
        if (pincode.length === 6) {
            setPincodeResult({ ok: true, msg: 'Delivery available in 3–5 business days via insured shipping.' });
        } else {
            setPincodeResult({ ok: false, msg: 'Please enter a valid 6-digit pincode.' });
        }
    };

    /* ── Loading / Error states ── */
    if (loading) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {[0, 150, 300].map(delay => (
                            <div key={delay} className="w-2 h-2 bg-[#CBA135] rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Loading</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white">
                <div className="text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                        <HiOutlineShoppingBag size={36} className="text-gray-300" />
                    </div>
                    <h2 className="font-heading text-3xl text-[#121212] mb-3">Piece Not Found</h2>
                    <p className="text-gray-400 mb-8 font-light text-sm leading-relaxed max-w-sm mx-auto">
                        {error || "The piece you're looking for might have been moved or is no longer available."}
                    </p>
                    <Link href="/shop" className="btn-dark inline-block">Explore Collection</Link>
                </div>
            </div>
        );
    }

    const wishlisted = isInWishlist(product._id);
    const discountPercent = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
    const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'];
    const inStock = product.stock > 0;
    const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

    return (
        <div className="min-h-screen bg-white">
            {/* ── SEO ── */}
            <title>{product.name} | Vionara Luxury Jewellery</title>
            <meta name="description" content={product.description?.substring(0, 160) || `Buy ${product.name} online at Vionara.`} />

            {/* ── Breadcrumb ── */}
            <div className="border-b border-gray-100 mt-16 md:mt-20">
                <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5">
                    <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-[#CBA135] transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-[#CBA135] transition-colors">Shop</Link>
                        {categoryName && (<><span>/</span><Link href={`/collections/${typeof product.category === 'object' ? product.category?.slug : product.category}`} className="hover:text-[#CBA135] transition-colors">{categoryName}</Link></>)}
                        <span>/</span>
                        <span className="text-[#121212] font-medium truncate max-w-[180px] sm:max-w-none">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* ── Main Product Section ── */}
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

                    {/* ═══════════════ LEFT: Image Gallery ═══════════════ */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4">
                        {/* Thumbnails */}
                        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:w-[72px] flex-shrink-0">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative flex-shrink-0 w-[62px] h-[78px] sm:w-full sm:aspect-[3/4] overflow-hidden rounded-lg transition-all duration-200 ${selectedImage === i ? 'ring-2 ring-[#CBA135] ring-offset-2' : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-[#CBA135]/50 hover:ring-offset-1'}`}
                                >
                                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 relative overflow-hidden rounded-2xl bg-[#F9F7F4] aspect-[4/5] cursor-crosshair group"
                            ref={imageContainerRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        fill
                                        priority
                                        className="object-cover transition-transform duration-300 ease-out"
                                        style={{
                                            transformOrigin: zoomParams.isZoomed ? `${zoomParams.x}% ${zoomParams.y}%` : 'center',
                                            transform: zoomParams.isZoomed ? 'scale(2.2)' : 'scale(1)',
                                        }}
                                        draggable={false}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Prev / Next arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                                        disabled={selectedImage === 0}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-all z-10"
                                    >
                                        <HiChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                                        disabled={selectedImage === images.length - 1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-30 hover:bg-white transition-all z-10"
                                    >
                                        <HiChevronRight size={18} />
                                    </button>
                                </>
                            )}

                            {/* Zoom hint */}
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Hover to zoom
                            </div>

                            {/* Badges */}
                            {discountPercent > 0 && (
                                <div className="absolute top-4 left-4 bg-[#121212] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                                    {discountPercent}% OFF
                                </div>
                            )}
                            {product.isNewArrival && (
                                <div className="absolute top-4 right-4 bg-[#D4AF37] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                                    New Arrival
                                </div>
                            )}
                            {product.isBestseller && !product.isNewArrival && (
                                <div className="absolute top-4 right-4 bg-[#8B2C2C] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                                    Bestseller
                                </div>
                            )}

                            {/* Image dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedImage ? 'bg-white w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════ RIGHT: Product Info ═══════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="flex flex-col lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto no-scrollbar"
                    >
                        {/* Category pill */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-[#CBA135] font-semibold">{categoryName}</span>
                            {product.sku && <span className="text-[10px] text-gray-300">|</span>}
                            {product.sku && <span className="text-[10px] text-gray-400 tracking-wider">SKU: {product.sku}</span>}
                        </div>

                        {/* Title row */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="font-heading text-2xl sm:text-3xl xl:text-[2rem] font-medium text-[#121212] leading-[1.2]">{product.name}</h1>
                            <div className="flex-shrink-0 flex items-center gap-2 mt-1">
                                <button
                                    onClick={handleWishlist}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#CBA135] hover:text-[#CBA135] transition-all hover:scale-110"
                                    aria-label="Wishlist"
                                >
                                    {wishlisted ? <HiHeart size={20} className="text-red-500" /> : <HiOutlineHeart size={20} />}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#CBA135] hover:text-[#CBA135] transition-all hover:scale-110"
                                    aria-label="Share"
                                >
                                    <HiOutlineShare size={19} />
                                </button>
                            </div>
                        </div>

                        {/* Stars */}
                        <div className="mb-5">
                            <StarRating rating={product.averageRating} count={product.numReviews} size={15} />
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
                            <span className="text-3xl font-light text-[#121212] tracking-tight">₹{product.price?.toLocaleString('en-IN')}</span>
                            {product.mrp > product.price && (
                                <>
                                    <span className="text-lg text-gray-400 line-through font-light">₹{product.mrp?.toLocaleString('en-IN')}</span>
                                    <span className="bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                        You save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Short description */}
                        {product.shortDescription && (
                            <p className="text-[14px] text-gray-600 leading-relaxed font-light mb-6">{product.shortDescription}</p>
                        )}

                        {/* Specs Grid */}
                        {(product.material || product.weight || product.stone || product.purity) && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {product.material && (
                                    <div className="bg-[#F9F7F4] rounded-xl px-4 py-3">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Material</p>
                                        <p className="text-[13px] font-semibold text-[#121212]">{product.material}</p>
                                    </div>
                                )}
                                {product.purity && (
                                    <div className="bg-[#F9F7F4] rounded-xl px-4 py-3">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Purity</p>
                                        <p className="text-[13px] font-semibold text-[#121212]">{product.purity}</p>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="bg-[#F9F7F4] rounded-xl px-4 py-3">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Weight</p>
                                        <p className="text-[13px] font-semibold text-[#121212]">{product.weight}</p>
                                    </div>
                                )}
                                {product.stone && (
                                    <div className="bg-[#F9F7F4] rounded-xl px-4 py-3">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Stone</p>
                                        <p className="text-[13px] font-semibold text-[#121212]">{product.stone}{product.stoneWeight ? ` · ${product.stoneWeight}` : ''}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stock status */}
                        <div className="flex items-center gap-2 mb-6">
                            {inStock ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] uppercase tracking-widest text-emerald-700 font-semibold">In Stock · Ready to Ship</span>
                                    {product.stock < 10 && (
                                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold ml-1">Only {product.stock} left</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[11px] uppercase tracking-widest text-red-500 font-semibold">Currently Unavailable</span>
                                </>
                            )}
                        </div>

                        {/* ─── Quantity + Actions ─── */}
                        <div className="flex flex-col gap-3 mb-7">
                            {/* Quantity row */}
                            <div className="flex items-center gap-4">
                                <span className="text-[12px] uppercase tracking-widest text-gray-500 font-medium w-20">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-10 h-11 flex items-center justify-center text-gray-500 hover:text-[#CBA135] hover:bg-[#F9F7F4] transition-all text-lg font-light"
                                    >−</button>
                                    <span className="w-12 h-11 flex items-center justify-center text-[15px] font-semibold border-x border-gray-200">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        disabled={quantity >= product.stock}
                                        className="w-10 h-11 flex items-center justify-center text-gray-500 hover:text-[#CBA135] hover:bg-[#F9F7F4] transition-all disabled:opacity-30 text-lg font-light"
                                    >+</button>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                id="add-to-cart-btn"
                                className={`w-full h-14 flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-bold uppercase tracking-[0.12em] transition-all duration-300 border ${addedToCart
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    : 'bg-white border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-white hover:shadow-lg hover:shadow-black/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {addedToCart ? (
                                    <><HiCheck size={18} />Added to Bag!</>
                                ) : (
                                    <><HiOutlineShoppingBag size={18} />{inStock ? 'Add to Bag' : 'Out of Stock'}</>
                                )}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={!inStock}
                                id="buy-now-btn"
                                className="w-full h-14 flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-bold uppercase tracking-[0.12em] bg-[#CBA135] text-white hover:bg-[#B8922E] transition-all duration-300 shadow-md shadow-[#CBA135]/25 hover:shadow-lg hover:shadow-[#CBA135]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Proceed to Checkout
                            </button>
                        </div>

                        {/* Exchange Policy pill */}
                        <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
                            <HiRefresh size={14} className="text-[#CBA135] flex-shrink-0" />
                            <span>
                                <span className="font-semibold text-[#121212]">5-Day Exchange Available</span>
                                {' '}— unused &amp; in original packaging only.{' '}
                                <a href="/exchange-policy" className="underline text-[#CBA135] hover:text-[#A37E22] transition-colors">Exchange Policy</a>
                            </span>
                        </div>


                        <div className="space-y-2.5 mb-7">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3 flex items-center gap-2">
                                <HiSparkles size={13} className="text-[#CBA135]" />
                                Available Offers
                            </p>
                            <OfferBadge
                                icon={HiOutlineTag}
                                highlight="10% OFF"
                                text="on your first order. Use code WELCOME10 at checkout."
                                bg="bg-amber-50"
                                border="border-amber-200"
                                textColor="text-amber-700"
                            />
                            <OfferBadge
                                icon={HiOutlineGift}
                                highlight="BUY 2 GET 1 FREE"
                                text="on all rings and earrings. Mix & match!"
                                bg="bg-rose-50"
                                border="border-rose-200"
                                textColor="text-rose-600"
                            />
                            {product.mrp > product.price && (
                                <OfferBadge
                                    icon={HiOutlineBadgeCheck}
                                    highlight={`EXTRA ${discountPercent}% OFF`}
                                    text="already applied — no coupon needed."
                                    bg="bg-green-50"
                                    border="border-green-200"
                                    textColor="text-green-700"
                                />
                            )}
                        </div>

                        {/* ─── Pincode checker ─── */}
                        <div className="bg-[#F9F7F4] rounded-2xl p-5 mb-7">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                <HiOutlineTruck size={14} className="text-[#CBA135]" />
                                Check Delivery
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit pincode"
                                    value={pincode}
                                    onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#CBA135] transition-colors placeholder-gray-400 tracking-wider"
                                    onKeyDown={e => e.key === 'Enter' && handleCheckPincode()}
                                />
                                <button
                                    onClick={handleCheckPincode}
                                    className="bg-[#121212] text-white px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#2A2A2A] transition-colors"
                                >
                                    Check
                                </button>
                            </div>
                            {pincodeResult && (
                                <p className={`text-[12px] mt-2.5 font-medium ${pincodeResult.ok ? 'text-emerald-700' : 'text-red-500'}`}>
                                    {pincodeResult.ok ? '✓ ' : '✗ '}{pincodeResult.msg}
                                </p>
                            )}
                        </div>

                        {/* ─── Trust Badges ─── */}
                        <div className="grid grid-cols-4 gap-2 pb-2">
                            <TrustBadge icon={HiShieldCheck} label="BIS Hallmark" sub="Certified purity" />
                            <TrustBadge icon={HiOutlineTruck} label="Free Shipping" sub="Above ₹5,000" />
                            <TrustBadge icon={HiRefresh} label="5-Day Exchange" sub="Exchange only" />
                            <TrustBadge icon={HiOutlineBadgeCheck} label="Authentic" sub="100% genuine" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════ TABS: Description + Reviews ═══════════════ */}
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-16 border-t border-gray-100">
                <div className="max-w-3xl mx-auto">
                    {/* Tab Nav */}
                    <div className="flex border-b border-gray-200 mb-10 gap-0">
                        {['description', 'reviews'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-6 text-[12px] tracking-[0.18em] uppercase font-semibold relative transition-colors ${activeTab === tab ? 'text-[#121212]' : 'text-gray-400 hover:text-[#121212]'}`}
                            >
                                {tab === 'reviews' ? `Reviews (${product.numReviews || 0})` : 'The Details'}
                                {activeTab === tab && (
                                    <motion.div layoutId="pdp-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CBA135]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <p className="text-gray-600 leading-loose font-light text-[15px]">{product.description}</p>

                                {/* Feature list */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        '925 Sterling Silver / Gold Plated finish',
                                        'Hypoallergenic & skin-safe materials',
                                        'Anti-tarnish coating for long-lasting shine',
                                        'Lovingly packed in a Vionara gift box',
                                    ].map(feat => (
                                        <div key={feat} className="flex items-start gap-3">
                                            <HiCheck size={16} className="text-[#CBA135] mt-0.5 flex-shrink-0" />
                                            <span className="text-[13px] text-gray-600 font-light">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Gold divider */}
                                <div className="flex justify-center gap-2 text-[#CBA135] opacity-60 pt-4">
                                    <HiStar size={10} /><HiStar size={10} /><HiStar size={10} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div key="revs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Review list */}
                                <div>
                                    <h3 className="font-heading text-xl mb-6">Customer Reviews</h3>
                                    {!product.reviews?.length ? (
                                        <p className="text-gray-400 font-light text-sm italic">Be the first to share your experience.</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {product.reviews.map((review, idx) => (
                                                <div key={idx} className="pb-6 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <StarRating rating={review.rating} size={13} />
                                                        <span className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-[13px] leading-relaxed font-light italic mb-2">"{review.comment}"</p>
                                                    <p className="text-[10px] tracking-widest uppercase text-[#121212] font-medium">— Anonymous</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Write review */}
                                <div className="bg-[#F9F7F4] p-7 rounded-2xl h-fit">
                                    <h3 className="font-heading text-xl mb-5">Write a Review</h3>
                                    {!user ? (
                                        <div className="text-center py-6">
                                            <p className="text-[13px] font-light text-gray-500 mb-5">Sign in to share your thoughts.</p>
                                            <Link href="/auth" className="btn-dark inline-block">Sign In</Link>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitReview} className="space-y-5">
                                            <div>
                                                <label className="text-[10px] text-[#121212] uppercase tracking-widest mb-2.5 block font-semibold">Your Rating</label>
                                                <div className="flex gap-1.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <button
                                                            type="button"
                                                            key={i}
                                                            onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}
                                                            onMouseEnter={() => setHoverRating(i + 1)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="hover:scale-125 transition-transform"
                                                        >
                                                            <HiStar size={26} className={i < (hoverRating || reviewForm.rating) ? 'text-[#CBA135]' : 'text-gray-300'} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[#121212] uppercase tracking-widest mb-2.5 block font-semibold">Your Review</label>
                                                <textarea
                                                    required
                                                    rows="4"
                                                    placeholder="Share your experience with this piece..."
                                                    value={reviewForm.comment}
                                                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[13px] font-light outline-none focus:border-[#CBA135] transition-colors resize-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="btn-dark w-full rounded-xl"
                                            >
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ═══════════════ RELATED PRODUCTS ═══════════════ */}
            {relatedProducts.length > 0 && (
                <div className="border-t border-gray-100 pb-20">
                    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pt-16">
                        {/* Section header */}
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#CBA135] font-semibold mb-2">More from {categoryName || 'this collection'}</p>
                                <h2 className="font-heading text-3xl text-[#121212]">You May Also Love</h2>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => scrollRelated(-1)}
                                    disabled={!canScrollLeft}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#CBA135] hover:text-[#CBA135] transition-all disabled:opacity-30"
                                >
                                    <HiMiniChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => scrollRelated(1)}
                                    disabled={!canScrollRight}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#CBA135] hover:text-[#CBA135] transition-all disabled:opacity-30"
                                >
                                    <HiMiniChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Horizontal scroll rail */}
                        <div
                            ref={relatedScrollRef}
                            onScroll={checkScroll}
                            className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory"
                        >
                            {relatedProducts.map((p, i) => (
                                <div key={p._id} className="snap-start">
                                    <RelatedCard product={p} onAddToCart={handleRelatedAddToCart} />
                                </div>
                            ))}
                        </div>

                        {/* View all link */}
                        <div className="flex justify-center mt-10">
                            <Link
                                href={`/collections/${typeof product.category === 'object' ? product.category?.slug : product.category}`}
                                className="inline-flex items-center gap-2 border border-[#121212] text-[#121212] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-[#121212] hover:text-white transition-all duration-300"
                            >
                                View All {categoryName}
                                <HiMiniChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
