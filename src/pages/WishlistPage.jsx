import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiX, HiOutlineShoppingBag } from 'react-icons/hi';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

import AccountLayout from '@/components/profile/AccountLayout';

const WishlistPage = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addItem } = useCart();

    const handleMoveToCart = (product) => {
        addItem(product, 1);
        removeFromWishlist(product._id);
        toast.success('Moved to cart');
    };

    return (
        <AccountLayout title="My Wishlist">
            {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-dash border-gray-200">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <h2 className="font-heading text-lg font-medium mb-1 text-charcoal">Your Wishlist is Empty</h2>
                    <p className="text-gray-500 text-sm mb-6">Save pieces you love and come back to them later.</p>
                    <Link href="/shop" className="btn-gold px-8 py-2.5 inline-block text-sm">Explore Collection</Link>
                </div>
            ) : (
                <div>
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{wishlist.length} saved item{wishlist.length > 1 ? 's' : ''}</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {wishlist.map((product, i) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-white border border-gray-100 rounded-sm hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all flex flex-col"
                            >
                                <div className="relative aspect-[4/5] bg-ivory overflow-hidden border-b border-gray-50">
                                    <Link href={`/product/${product.slug}`}>
                                        <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </Link>
                                    <button 
                                        onClick={() => { removeFromWishlist(product._id); toast.success('Removed'); }} 
                                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                                    >
                                        <HiX size={14} />
                                    </button>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1">{product.category}</p>
                                    <h3 className="font-medium text-sm text-charcoal line-clamp-2 mb-2">{product.name}</h3>
                                    <div className="mt-auto">
                                        <p className="font-semibold text-charcoal text-sm mb-4">₹{product.price?.toLocaleString('en-IN')}</p>
                                        <button 
                                            onClick={() => handleMoveToCart(product)} 
                                            className="w-full border border-gray-200 hover:border-gold text-charcoal hover:text-gold text-xs font-semibold py-2.5 flex items-center justify-center gap-2 transition-colors rounded-sm uppercase tracking-wider"
                                        >
                                            <HiOutlineShoppingBag size={14} /> MOVE TO CART
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </AccountLayout>
    );
};

export default WishlistPage;
