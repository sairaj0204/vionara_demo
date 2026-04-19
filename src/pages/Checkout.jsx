import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineRefresh } from 'react-icons/hi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, createPaymentOrder, verifyPayment } from '@/services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, getCartTotal, clearCartItems, hydrated } = useCart();
    const { user, setShowLoginModal } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [buyNowItem, setBuyNowItem] = useState(null);
    const discount = Number(searchParams.get('discount') || 0);
    const couponCode = searchParams.get('couponCode') || '';
    const isBuyNow = !!buyNowItem;

    const [step, setStep] = useState(1);
    const [orderStatus, setOrderStatus] = useState('idle'); // idle | loading | success
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', paymentMethod: 'razorpay' });
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const savedAddresses = user?.addresses || [];

    // If unauthenticated, redirect and show modal
    useEffect(() => {
        if (!user) {
            toast.error('Please login to checkout');
            setShowLoginModal(true);
            router.push('/cart');
        }
    }, [user, router, setShowLoginModal]);

    // Only redirect to /cart once the cart has been hydrated from localStorage.
    // Without this guard the redirect fires before items are loaded, sending
    // the user away even when the cart has products in it.
    useEffect(() => {
        if (!hydrated) return; // wait until localStorage has been read
        if (!isBuyNow && cart.items.length === 0) {
            router.push('/cart');
        }
    }, [hydrated, cart.items.length, isBuyNow, router]);

    useEffect(() => {
        // App Router: no router.isReady — searchParams are available immediately
        if (searchParams.get('buyNow') !== '1' || typeof window === 'undefined') {
            return;
        }

        const storedItem = window.sessionStorage.getItem('checkout:buyNowItem');
        if (!storedItem) return;

        try {
            setBuyNowItem(JSON.parse(storedItem));
        } catch (error) {
            console.error('Failed to parse buy now item:', error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — searchParams is stable in App Router

    // Pre-select the default address and auto-fill form on mount
    useEffect(() => {
        if (savedAddresses.length > 0) {
            const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
            setSelectedAddressId(defaultAddr._id);
            setForm(prev => ({
                ...prev,
                fullName: defaultAddr.fullName || '',
                phone: defaultAddr.phone || '',
                addressLine1: defaultAddr.addressLine1 || '',
                addressLine2: defaultAddr.addressLine2 || '',
                city: defaultAddr.city || '',
                state: defaultAddr.state || '',
                pincode: defaultAddr.pincode || '',
            }));
        }
    }, [user]);

    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setForm(prev => ({
            ...prev,
            fullName: addr.fullName || '',
            phone: addr.phone || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
        }));
    };

    // Determine quantities and prices based on flow
    const displayItems = isBuyNow ? [buyNowItem] : cart.items;

    // Calculate Subtotal dynamically
    const subtotal = isBuyNow
        ? (buyNowItem.price * buyNowItem.quantity)
        : getCartTotal();

    const shipping = subtotal >= 5000 ? 0 : 99;
    const total = subtotal - discount + shipping;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePlaceOrder = async () => {
        if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
            toast.error('Please fill all required fields');
            return;
        }
        setOrderStatus('loading');
        
        try {
            // Serialize cart items
            const serializedItems = isBuyNow
                ? [{
                    productId: buyNowItem.product?._id || buyNowItem._id,
                    name: buyNowItem.name,
                    image: buyNowItem.image,
                    price: buyNowItem.price,
                    quantity: buyNowItem.quantity,
                    size: buyNowItem.size || '',
                }]
                : cart.items.map(item => ({
                    productId: item.product._id,
                    name: item.product.name,
                    image: item.product.images?.[0] || '',
                    price: item.product.price,
                    quantity: item.quantity,
                    size: item.size || '',
                }));

            // Step 1: Create DB Order (pending) & get Razorpay Order ID from backend
            const orderData = {
                shippingAddress: {
                    fullName: form.fullName,
                    addressLine1: form.addressLine1,
                    addressLine2: form.addressLine2,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                    phone: form.phone
                },
                paymentMethod: form.paymentMethod,
                cartItems: serializedItems,
                shippingCost: shipping,
                discount: discount,
                couponCode: couponCode,
            };

            const { data } = await createOrder(orderData);
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to place order');
            }

            const dbOrder = data.order;

            // Step 2: Handle Razorpay flow if selected
            if (form.paymentMethod === 'razorpay' && data.razorpayOrder) {
                const options = {
                    key: data.razorpayKey,
                    amount: data.razorpayOrder.amount,
                    currency: data.razorpayOrder.currency,
                    name: "Vionara",
                    description: "Order Payment",
                    order_id: data.razorpayOrder.id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await verifyPayment({
                                orderId: dbOrder._id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });

                            if (verifyRes.data.success) {
                                setOrderStatus('success');
                                toast.success('Order placed successfully! 🎉');
                                if (!isBuyNow) clearCartItems();
                                setTimeout(() => router.push('/profile'), 1200);
                            } else {
                                throw new Error(verifyRes.data.message || "Payment verification failed");
                            }
                        } catch (err) {
                            setOrderStatus('idle');
                            toast.error(err.message || "Payment verification failed");
                        }
                    },
                    prefill: {
                        name: form.fullName,
                        email: form.email,
                        contact: form.phone
                    },
                    theme: { color: "#D4AF37" }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    setOrderStatus('idle');
                    toast.error("Payment failed. Please try again.");
                });
                rzp.open();
            } else {
                // Cash on Delivery
                setOrderStatus('success');
                toast.success('Order placed successfully! 🎉');
                if (!isBuyNow) clearCartItems();
                setTimeout(() => router.push('/profile'), 1200);
            }
        } catch (error) {
            setOrderStatus('idle');
            toast.error(error.response?.data?.message || error.message || 'Failed to process order. Please try again.');
        }
    };

    // While hydrating, render nothing to avoid flash-of-empty-cart redirect.
    if (!hydrated) return null;

    if (!isBuyNow && cart.items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-ivory">
            <div className="bg-charcoal text-white py-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="font-heading text-3xl font-bold">Checkout</h1>
                    {/* Steps */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                        {['Shipping', 'Payment', 'Review'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step > i + 1 ? 'bg-gold text-white' : step === i + 1 ? 'bg-gold text-white' : 'bg-white/20 text-white/50'}`}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs tracking-wider ${step >= i + 1 ? 'text-white' : 'text-white/40'}`}>{s}</span>
                                {i < 2 && <div className="w-8 h-px bg-white/20 mx-1" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-3">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-semibold mb-4">Shipping Address</h2>

                                {/* ── Saved Addresses ─────────────────────────── */}
                                {savedAddresses.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Saved Addresses</p>
                                        <div className="space-y-3">
                                            {savedAddresses.map((addr) => (
                                                <div
                                                    key={addr._id}
                                                    onClick={() => handleSelectAddress(addr)}
                                                    className={`relative p-4 border cursor-pointer transition-all ${
                                                        selectedAddressId === addr._id
                                                            ? 'border-gold bg-gold/5 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {/* Selection indicator */}
                                                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        selectedAddressId === addr._id
                                                            ? 'border-gold bg-gold'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {selectedAddressId === addr._id && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-semibold text-charcoal">{addr.fullName}</p>
                                                        {addr.isDefault && (
                                                            <span className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">Default</span>
                                                        )}
                                                        <span className="text-xs text-gray-500">{addr.phone}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed pr-8">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                        <br />
                                                        {addr.city}, {addr.state} — {addr.pincode}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3 my-5">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Or edit below</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Manual Address Form ─────────────────────── */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Full Name *</label>
                                        <input name="fullName" value={form.fullName} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Phone *</label>
                                        <input name="phone" value={form.phone} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Address Line 1 *</label>
                                        <input name="addressLine1" value={form.addressLine1} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Address Line 2</label>
                                        <input name="addressLine2" value={form.addressLine2} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">City *</label>
                                        <input name="city" value={form.city} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">State *</label>
                                        <input name="state" value={form.state} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pincode *</label>
                                        <input name="pincode" value={form.pincode} onChange={(e) => { handleChange(e); setSelectedAddressId(null); }} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} className="btn-gold w-full mt-6">Continue to Payment</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-semibold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'razorpay', label: 'Razorpay (UPI, Cards, Wallets, Net Banking)', desc: 'Pay securely with Razorpay' },
                                        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                                    ].map((method) => (
                                        <label key={method.id} className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${form.paymentMethod === method.id ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="paymentMethod" value={method.id} checked={form.paymentMethod === method.id} onChange={handleChange} className="accent-gold" />
                                            <div>
                                                <p className="text-sm font-medium">{method.label}</p>
                                                <p className="text-xs text-gray-400">{method.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStep(1)} className="btn-outline-gold flex-1">Back</button>
                                    <button onClick={() => setStep(3)} className="btn-gold flex-1">Review Order</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 border border-gray-100">
                                <h2 className="font-heading text-lg font-semibold mb-4">Order Review</h2>
                                <div className="space-y-3 mb-4">
                                    <div className="bg-ivory p-3">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Shipping to</p>
                                        <p className="text-sm font-medium mt-1">{form.fullName}</p>
                                        <p className="text-xs text-gray-500">{form.addressLine1}, {form.city}, {form.state} - {form.pincode}</p>
                                    </div>
                                    <div className="bg-ivory p-3">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Payment</p>
                                        <p className="text-sm font-medium mt-1">{form.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {displayItems.map((item, index) => {
                                        const productImg = isBuyNow ? item.image : item.product.images?.[0];
                                        const productName = isBuyNow ? item.name : item.product.name;
                                        const productPrice = isBuyNow ? item.price : item.product.price;

                                        return (
                                            <div key={isBuyNow ? `buynow-${index}` : item._id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                                                <img src={productImg} alt="" className="w-12 h-12 object-cover bg-ivory" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{productName}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <span className="text-sm font-medium">₹{(productPrice * item.quantity).toLocaleString('en-IN')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStep(2)} className="btn-outline-gold flex-1">Back</button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={orderStatus !== 'idle'}
                                        id="place-order-btn"
                                        className={`btn-gold flex-1 flex items-center justify-center gap-2 transition-all ${
                                            orderStatus === 'success' ? 'bg-green-600 border-green-600 cursor-default' : ''
                                        } ${orderStatus === 'loading' ? 'opacity-80 cursor-not-allowed' : ''}`}
                                    >
                                        {orderStatus === 'idle' && 'PLACE ORDER'}
                                        {orderStatus === 'loading' && (
                                            <>
                                                <HiOutlineRefresh size={18} className="animate-spin" />
                                                Processing...
                                            </>
                                        )}
                                        {orderStatus === 'success' && (
                                            <>
                                                <HiOutlineCheck size={18} />
                                                Order Placed!
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 border border-gray-100 sticky top-24">
                            <h3 className="font-heading text-lg font-semibold mb-4">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Subtotal ({displayItems.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
                                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
                                <div className="flex justify-between font-bold text-base border-t pt-3 mt-3"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
