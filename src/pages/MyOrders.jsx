import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTruck } from 'react-icons/hi';
import { getUserOrders } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import AccountLayout from '@/components/profile/AccountLayout';

// StatusBadge component remains unchanged here...
const StatusBadge = ({ status }) => {
    // Normalization logic for safely mapping backend legacy + new lowercase states
    let s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'ordered') s = 'paid';
    if (s === 'packed') s = 'processing';

    const statusConfig = {
        'pending': { bg: 'bg-gray-100', text: 'text-gray-700', icon: HiOutlineClock },
        'paid': { bg: 'bg-blue-100', text: 'text-blue-700', icon: HiOutlineCheckCircle },
        'processing': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: HiOutlineShoppingBag },
        'shipped': { bg: 'bg-purple-100', text: 'text-purple-700', icon: HiOutlineTruck },
        'delivered': { bg: 'bg-green-100', text: 'text-green-700', icon: HiOutlineCheckCircle },
        'cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: HiOutlineXCircle },
        'failed': { bg: 'bg-red-100', text: 'text-red-700', icon: HiOutlineXCircle },
    };
    const config = statusConfig[s] || statusConfig['pending'];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${config.bg} ${config.text}`}>
            <Icon size={14} />
            {s}
        </span>
    );
};

const MyOrders = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            if (router) {
                router.push('/auth');
            } else if (typeof window !== 'undefined') {
                window.location.assign('/auth');
            }
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await getUserOrders();
                if (data.success) {
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    if (!user) return null;

    return (
        <AccountLayout title="My Orders">
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-dash border-gray-200">
                    <HiOutlineShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="font-heading text-lg font-medium mb-1 text-charcoal">No orders found</h2>
                    <p className="text-gray-500 mb-6 text-sm">Looks like you haven't placed any orders yet.</p>
                    <Link href="/shop" className="btn-gold px-8 py-2.5 inline-block text-sm">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={order._id}
                            className="bg-white border border-gray-100 rounded-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow"
                        >
                            <div className="bg-gray-50/50 px-5 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Order ID</p>
                                        <p className="text-sm font-medium text-charcoal">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Date</p>
                                        <p className="text-sm font-medium text-charcoal">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total</p>
                                        <p className="text-sm font-medium text-gold">₹{order.totalPrice?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <StatusBadge status={order.orderStatus} />
                            </div>

                            <div className="p-5">
                                <div className="space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-ivory rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</h4>
                                                <div className="mt-1 flex items-center gap-4 text-[13px] text-gray-500">
                                                    <span>Size: {item.size || 'N/A'}</span>
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-sm font-medium text-charcoal">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.orderItems?.map((item, idx) => (
                                         <div key={idx} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-ivory rounded-sm flex-shrink-0 border border-gray-100 overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</h4>
                                                <div className="mt-1 flex items-center gap-4 text-[13px] text-gray-500">
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-sm font-medium text-charcoal">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end">
                                    <Link href={`/track-order?id=${order.orderNumber}`} className="text-xs font-semibold text-gold hover:text-amber-600 tracking-wider uppercase">
                                        View Tracking Summary →
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
};

export default MyOrders;
