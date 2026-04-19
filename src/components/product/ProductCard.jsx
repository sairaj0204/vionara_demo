import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineHeart, HiHeart, HiStar, HiOutlineStar } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
    const { addItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        toast.success('Added to bag');
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    const discountPercent = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const hasSecondImage = product.images?.length > 1;

    // Always render 5 stars for uniform height across all products
    const renderStars = () => {
        const rating = Math.round(product.averageRating || 0);
        return Array.from({ length: 5 }).map((_, i) => (
            <HiStar key={i} size={13} className={i < rating ? 'text-[#C9A14A]' : 'text-gray-200'} />
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full block group relative"
        >
            {/* Image Container */}
            <div className="relative w-full h-[300px] overflow-hidden bg-gray-50">
                <Link href={`/product/${product.slug}`} className="block w-full h-full outline-none" id={`product-${product.slug}`}>
                    <Image
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                        alt={product.name}
                        fill
                        priority={index < 4}
                        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${hasSecondImage ? 'group-hover:opacity-0' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {hasSecondImage && (
                        <Image
                            src={product.images[1]}
                            alt={`${product.name} alternate view`}
                            fill
                            className="object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {(product.isNewArrival || product.isBestseller) && (
                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            <span className="bg-charcoal text-white text-[10px] uppercase tracking-wide px-2 py-1">
                                {product.isNewArrival ? 'New' : 'Bestseller'}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Overlays (Wishlist & Add to Bag) */}
                <div className="absolute bottom-3 left-0 right-0 px-3 flex justify-between items-end z-20 pointer-events-none">
                    {/* Left: Wishlist Heart */}
                    <button
                        onClick={handleWishlist}
                        className="pointer-events-auto bg-white/90 backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 shadow-sm transition-all text-charcoal hover:text-gold"
                        aria-label="Wishlist"
                    >
                        {wishlisted ? (
                            <HiHeart size={18} className="text-red-500" />
                        ) : (
                            <HiOutlineHeart size={18} />
                        )}
                    </button>

                    {/* Right: Add to Bag Pill */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`pointer-events-auto bg-white/95 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-md transition-all duration-300 md:translate-y-4 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center hover:bg-black hover:text-white ${product.stock === 0 ? 'opacity-100 translate-y-0 bg-gray-100 text-gray-400 cursor-not-allowed hidden' : ''}`}
                    >
                        {product.stock > 0 ? 'ADD TO BAG' : 'SOLD OUT'}
                    </button>
                </div>
            </div>

            {/* Product Info - Strict Alignments & Margins */}
            <div className="mt-[10px] text-left w-full h-[85px] flex flex-col justify-start">
                <Link href={`/product/${product.slug}`} className="block outline-none hover:underline">
                    <h3 className="text-[14px] font-normal text-charcoal truncate mb-1 w-full">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1 mb-1.5 h-[16px]">
                    {renderStars()}
                    <span className="text-[11px] text-gray-400 ml-1">({product.numReviews || 0})</span>
                </div>

                <div className="flex items-center gap-2 w-full truncate h-[22px]">
                    <span className="text-[15px] font-bold text-charcoal">
                        ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    {product.mrp > product.price && (
                        <>
                            <span className="text-[13px] line-through text-gray-400">
                                ₹{product.mrp?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[12px] font-bold text-green-600 ml-1">
                                {discountPercent}% OFF
                            </span>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
