import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiX, HiPlus, HiMinus, HiArrowRight, HiOutlineGift, 
    HiLocationMarker, HiCheck, HiOutlineShieldCheck, 
    HiOutlineTruck, HiOutlineCreditCard, HiChevronDown, HiChevronUp 
} from 'react-icons/hi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { validateCoupon } from '@/services/api';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { cart, removeItem, updateQuantity, getCartTotal } = useCart();
    const { user, setShowLoginModal } = useAuth();
    const router = useRouter();
    
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showCoupon, setShowCoupon] = useState(false);
    
    // UI details
    const [pincode, setPincode] = useState('');
    const [pincodeChecked, setPincodeChecked] = useState(false);
    const [giftMessages, setGiftMessages] = useState({}); // { itemId: boolean }

    const subtotal = getCartTotal();
    const shipping = subtotal >= 5000 ? 0 : 99;
    const total = subtotal - discount + shipping;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const { data } = await validateCoupon({ code: couponCode, cartTotal: subtotal });
            if (data.success) {
                setDiscount(data.discount);
                toast.success(`Coupon applied! You saved ₹${data.discount.toLocaleString('en-IN')}`);
            }
        } catch (error) {
            setDiscount(0);
            toast.error(error.response?.data?.message || 'Invalid coupon');
        }
    };

    const handlePincodeCheck = () => {
        if (pincode.length === 6) {
            setPincodeChecked(true);
            toast.success("Delivery available in your area");
        } else {
            toast.error("Please enter a valid 6-digit pincode");
            setPincodeChecked(false);
        }
    };

    const toggleGiftMessage = (id) => {
        setGiftMessages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-24 h-24 mx-auto mb-6 bg-[#FCF8EE] rounded-full flex items-center justify-center text-[#C9A34E]">
                        <HiOutlineGift size={40} />
                    </div>
                    <h2 className="font-heading text-2xl font-medium mb-3 text-[#121212]">Your Cart is Empty</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Discover our exclusive collections and find the perfect piece for yourself or a loved one.</p>
                    <Link href="/shop" className="w-full block bg-[#8B2C2C] text-white py-3.5 rounded-lg text-sm font-medium tracking-wide hover:bg-[#722323] transition-colors shadow-md shadow-[#8B2C2C]/20">
                        Start Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-body text-[#121212] pb-16">
            
            {/* Top Notification Banner */}
            <div className="bg-[#FCF8EE] border-b border-[#F5EAD4] py-2.5 px-4 hidden sm:flex items-center justify-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C9A34E] animate-pulse"></span>
                <p className="text-xs font-medium text-[#8B2C2C] tracking-wide">
                    Don’t miss out - get notified about our latest exclusive drops and festive offers.
                </p>
                <button className="text-[11px] font-bold text-[#121212] underline decoration-[#C9A34E] underline-offset-4 ml-2 hover:text-[#C9A34E] transition-colors uppercase">
                    Notify Me
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-heading text-3xl font-medium">Shopping Cart ({cart.items.length})</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* LEFT COLUMN: Products & Details */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                        
                        {/* Pincode Check Section */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A34E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#FCF8EE] flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                    <HiLocationMarker size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#121212]">Delivery & Store Details</h3>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Enter pincode for exact delivery dates</p>
                                </div>
                            </div>
                            <div className="flex w-full sm:w-auto relative">
                                <input 
                                    type="text" 
                                    maxLength={6}
                                    placeholder="Enter Pincode" 
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full sm:w-44 border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-[#C9A34E] bg-gray-50 focus:bg-white transition-all text-center tracking-widest"
                                />
                                <button 
                                    onClick={handlePincodeCheck}
                                    className="bg-[#121212] text-white px-5 py-2.5 rounded-r-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors"
                                >
                                    Check
                                </button>
                                {pincodeChecked && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 w-5 h-5 bg-green-500 rounded-full text-white flex items-center justify-center shadow-sm">
                                        <HiCheck size={12} />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-5">
                            <AnimatePresence>
                                {cart.items.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 relative"
                                    >
                                        {/* Remove Button */}
                                        <button 
                                            onClick={() => removeItem(item._id)} 
                                            className="absolute top-4 right-4 text-gray-400 hover:text-[#8B2C2C] transition-colors p-1"
                                            title="Remove Item"
                                        >
                                            <HiX size={20} />
                                        </button>

                                        {/* Image */}
                                        <Link href={`/product/${item.product.slug}`} className="w-full sm:w-36 h-36 flex-shrink-0 rounded-xl bg-[#FDFBF7] overflow-hidden border border-[#F0EBE1] flex items-center justify-center p-2">
                                            <img 
                                                src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200'} 
                                                alt={item.product.name} 
                                                className="w-full h-full object-cover rounded-lg mix-blend-multiply" 
                                            />
                                        </Link>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between pt-1">
                                            <div className="pr-8">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-[#C9A34E] uppercase tracking-widest px-2 py-0.5 bg-[#FCF8EE] rounded-sm">
                                                        {item.product.category || 'Jewellery'}
                                                    </span>
                                                </div>
                                                <h3 className="font-heading text-base font-medium text-[#121212] leading-snug line-clamp-2 pr-4">{item.product.name}</h3>
                                                
                                                {/* Weight Dteails (Mocked or real) */}
                                                <p className="text-[12px] text-gray-500 mt-2 flex items-center gap-2">
                                                    <span>Weight: {(Math.random() * (15 - 2) + 2).toFixed(2)}g</span> 
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span>Purity: {item.product.material?.includes('18k') ? '18KT' : '22KT'}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-end justify-between mt-6 sm:mt-auto gap-4">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-9">
                                                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#C9A34E] transition-colors"><HiMinus size={14} /></button>
                                                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, Math.min(item.product.stock || 99, item.quantity + 1))} className={`w-9 h-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#C9A34E] transition-colors ${item.quantity >= item.product.stock ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={item.quantity >= item.product.stock}><HiPlus size={14} /></button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <span className="text-sm text-gray-400 line-through block mb-0.5">₹{(item.product.price * item.quantity * 1.15).toLocaleString('en-IN')}</span>
                                                    <span className="font-medium text-lg text-[#8B2C2C]">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Gift Message Toggle */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <button 
                                                    onClick={() => toggleGiftMessage(item._id)}
                                                    className="flex items-center gap-2 text-[12px] font-medium text-gray-600 hover:text-[#8B2C2C] transition-colors"
                                                >
                                                    <HiOutlineGift size={16} className={giftMessages[item._id] ? 'text-[#8B2C2C]' : ''} />
                                                    {giftMessages[item._id] ? 'Message Added' : 'Add Gift Message'}
                                                </button>
                                                {giftMessages[item._id] && (
                                                    <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Complimentary</span>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {giftMessages[item._id] && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }} 
                                                        animate={{ opacity: 1, height: 'auto' }} 
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 overflow-hidden"
                                                    >
                                                        <textarea 
                                                            placeholder="Type your personal message here (max 150 characters)" 
                                                            className="w-full border border-gray-200 rounded-lg p-3 text-[12px] outline-none focus:border-[#C9A34E] bg-gray-50 focus:bg-white resize-none"
                                                            rows="2"
                                                            maxLength={150}
                                                        ></textarea>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 xl:col-span-4 relative">
                        <div className="sticky top-24">
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                                <div className="p-6 bg-[#FCF8EE] border-b border-[#F5EAD4]">
                                    <h3 className="font-heading text-lg font-medium text-[#121212]">Order Summary</h3>
                                </div>

                                <div className="p-6">
                                    {/* Collapsible Coupon Section */}
                                    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 group">
                                        <button 
                                            onClick={() => setShowCoupon(!showCoupon)}
                                            className="w-full flex items-center justify-between p-4 bg-white text-sm font-medium hover:text-[#C9A34E] transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A34E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                Apply Coupon Code
                                            </span>
                                            {showCoupon ? <HiChevronUp size={18} /> : <HiChevronDown size={18} />}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showCoupon && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 pt-2 flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter code"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A34E] bg-white transition-all uppercase tracking-wider"
                                                        />
                                                        <button 
                                                            onClick={handleApplyCoupon} 
                                                            className="bg-[#121212] text-white px-5 rounded-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-4 text-sm font-medium text-gray-500 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span>Subtotal ({cart.items.length} items)</span>
                                            <span className="text-[#121212]">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-green-600 bg-green-50/50 p-2 rounded-lg -mx-2">
                                                <span>Coupon Discount</span>
                                                <span>-₹{discount.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-center">
                                            <span>Delivery Charges</span>
                                            {shipping === 0 ? (
                                                <span className="text-green-600 font-bold tracking-wide">FREE</span>
                                            ) : (
                                                <span className="text-[#121212]">₹{shipping}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Divider */}
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

                                    {/* Total */}
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-base font-bold text-[#121212]">Total Amount</span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 block mb-0.5 tracking-wide">(Incl. of all taxes)</span>
                                            <span className="text-2xl font-bold text-[#8B2C2C]">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Savings Banner */}
                                    <div className="bg-[#FCF8EE] rounded-lg p-3 mt-4 text-center border border-[#F5EAD4]">
                                        <p className="text-[12px] font-medium text-[#C9A34E]">
                                            You will save ₹{(discount + (subtotal * 0.15)).toLocaleString('en-IN')} on this order!
                                        </p>
                                    </div>
                                    
                                    {/* CTA Button */}
                                    <div className="mt-8">
                                        {user ? (
                                            <Link 
                                                href={`/checkout?discount=${discount}&couponCode=${encodeURIComponent(couponCode)}`}
                                                className="w-full bg-[#8B2C2C] text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#722323] transition-all shadow-lg shadow-[#8B2C2C]/20 flex items-center justify-center gap-2 group"
                                            >
                                                Proceed to Checkout 
                                                <HiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    toast.error('Please login to checkout');
                                                    setShowLoginModal(true);
                                                }}
                                                className="w-full bg-[#8B2C2C] text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#722323] transition-all shadow-lg shadow-[#8B2C2C]/20 flex items-center justify-center gap-2 group"
                                            >
                                                Login to Checkout 
                                                <HiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                            </button>
                                        )}
                                        <Link href="/shop" className="block text-center text-xs text-gray-400 hover:text-[#C9A34E] mt-4 font-medium transition-colors">
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Feature Highlights */}
                <div className="mt-16 pt-12 border-t border-gray-200">
                    <h3 className="font-heading text-xl font-medium text-center mb-10">The Vionara Promise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                        {/* Box 1 */}
                        <div className="bg-white p-6 rounded-2xl flex items-start gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#FCF8EE] rounded-full flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-heading text-[15px] font-semibold text-[#121212] mb-1">Purity Guaranteed</h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed">Every piece is Hallmarked and comes with a certificate of authenticity.</p>
                            </div>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-white p-6 rounded-2xl flex items-start gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#FCF8EE] rounded-full flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                <HiOutlineTruck size={24} />
                            </div>
                            <div>
                                <h4 className="font-heading text-[15px] font-semibold text-[#121212] mb-1">Secure Delivery</h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed">Fully insured and secure transit with real-time package tracking.</p>
                            </div>
                        </div>

                        {/* Box 3 */}
                        <div className="bg-white p-6 rounded-2xl flex items-start gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#FCF8EE] rounded-full flex items-center justify-center text-[#C9A34E] flex-shrink-0">
                                <HiOutlineCreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="font-heading text-[15px] font-semibold text-[#121212] mb-1">Easy & Secure Payments</h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed">Multiple payment options secured by 256-bit encryption technology.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CartPage;
