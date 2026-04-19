import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineEye, HiOutlineX, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineShoppingBag, HiOutlineRefresh } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { getAllUsersAdmin } from '@/services/api';
// Assuming we might need a specific user endpoint later for full details, 
// for now we'll use the data returned from getAllUsersAdmin which might not have full order history.
// We'll mock the order history if it's not present or use what's there.

const statusColor = { delivered: 'bg-emerald-100 text-emerald-700', shipped: 'bg-blue-100 text-blue-700', processing: 'bg-amber-100 text-amber-700', confirmed: 'bg-purple-100 text-purple-700', cancelled: 'bg-red-100 text-red-700' };

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await getAllUsersAdmin();
            if (data.success) {
                // Map API data to our component requirements
                const mappedUsers = data.users.map(u => ({
                    id: u._id,
                    name: u.name || 'Unknown User',
                    email: u.email || 'No email',
                    phone: u.phone || 'No phone',
                    avatar: (u.name ? u.name.charAt(0).toUpperCase() : '?'),
                    orders: u.orderCount || 0,
                    totalSpent: u.totalSpent || 0,
                    joined: u.createdAt || new Date(),
                    address: typeof u.address === 'string' ? u.address : (u.address?.city || 'No address provided'),
                    role: u.role,
                    orderHistory: u.recentOrders || []
                }));
                // Filter out admins if we only want to see customers
                setCustomers(mappedUsers.filter(u => u.role !== 'admin'));
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const filtered = customers.filter(c =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout title="Customers" subtitle={`${customers.length} registered customers`}>
            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold" />
                </div>
                <button
                    onClick={fetchCustomers}
                    disabled={loading}
                    className="p-2 border border-gray-200 rounded-lg hover:border-gold text-gray-600 hover:text-gold transition-colors"
                    title="Refresh Customers"
                >
                    <HiOutlineRefresh className={loading ? 'animate-spin' : ''} size={18} />
                </button>
            </div>

            {/* Loading State */}
            {loading && customers.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                    <p className="text-gray-500">No customers found matching your search.</p>
                </div>
            ) : (
                /* Customer Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedCustomer(c)}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">{c.avatar}</div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-sm group-hover:text-gold transition-colors truncate">{c.name}</h3>
                                    <p className="text-[10px] text-gray-400">Since {new Date(c.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                </div>
                                <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineEye size={14} /></button>
                            </div>
                            <div className="space-y-2 text-xs text-gray-500">
                                <p className="flex items-center gap-2 truncate" title={c.email}><HiOutlineMail size={13} className="text-gray-300 min-w-[13px]" />{c.email}</p>
                                <p className="flex items-center gap-2"><HiOutlinePhone size={13} className="text-gray-300 min-w-[13px]" />{c.phone}</p>
                            </div>
                            <div className="flex justify-between mt-4 pt-3 border-t border-gray-50 text-xs">
                                <span><strong className="text-charcoal">{c.orders}</strong> <span className="text-gray-400">orders</span></span>
                                <span className="font-medium text-charcoal">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={() => setSelectedCustomer(null)}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-lg p-6 mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading text-lg font-semibold">Customer Profile</h2>
                                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-charcoal transition-colors"><HiOutlineX size={20} /></button>
                            </div>

                            {/* Profile */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">{selectedCustomer.avatar}</div>
                                <div>
                                    <h3 className="font-heading font-semibold text-lg">{selectedCustomer.name}</h3>
                                    <p className="text-xs text-gray-400">Customer since {new Date(selectedCustomer.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">ID: {selectedCustomer.id.substring(0, 8)}</span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-3"><HiOutlineMail size={16} className="text-gold" /><a href={`mailto:${selectedCustomer.email}`} className="text-sm hover:underline">{selectedCustomer.email}</a></div>
                                <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-3"><HiOutlinePhone size={16} className="text-gold" /><a href={`tel:${selectedCustomer.phone}`} className="text-sm hover:underline">{selectedCustomer.phone}</a></div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"><HiOutlineLocationMarker size={16} className="text-gold min-w-[16px]" /><span className="text-sm">{selectedCustomer.address}</span></div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-gold/5 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gold">{selectedCustomer.orders}</p><p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Orders</p></div>
                                <div className="bg-gold/5 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gold">₹{(selectedCustomer.totalSpent / 1000).toFixed(0)}K</p><p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Spent</p></div>
                                <div className="bg-gold/5 rounded-lg p-3 text-center"><p className="text-lg font-bold text-gold">₹{selectedCustomer.orders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.orders).toLocaleString('en-IN') : 0}</p><p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Avg Order</p></div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5 font-medium"><HiOutlineShoppingBag size={12} /> Recent Orders</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {selectedCustomer.orderHistory && selectedCustomer.orderHistory.length > 0 ? (
                                        selectedCustomer.orderHistory.map(order => (
                                            <div key={order._id || order.id} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-3">
                                                <div>
                                                    <p className="text-xs font-medium font-mono text-charcoal">#{((order._id || order.id || '').substring(0, 8))}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{new Date(order.createdAt || order.date).toLocaleDateString()} · {order.items?.length || 1} items</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-medium text-charcoal mb-1">₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</p>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center justify-center font-medium capitalize outline outline-1 outline-offset-0 ${(statusColor[order.orderStatus || order.status] || 'bg-gray-100 text-gray-700 outline-gray-200')}`}>
                                                        {order.orderStatus || order.status || 'Processing'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-400">No recent orders found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminCustomers;
