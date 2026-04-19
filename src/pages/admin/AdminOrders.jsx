import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineEye, HiOutlineX, HiOutlineTruck, HiOutlineCheck } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '@/services/api';

const statusColor = { delivered: 'bg-emerald-100 text-emerald-700', shipped: 'bg-blue-100 text-blue-700', processing: 'bg-amber-100 text-amber-700', confirmed: 'bg-purple-100 text-purple-700', cancelled: 'bg-red-100 text-red-700' };
const allStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const validTransitions = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await getAllOrders();
            if (data.success) {
                // Ensure array format
                setOrders(Array.isArray(data.orders) ? data.orders : []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter(o => {
        const oId = o._id || o.id || '';
        const oStatus = o.orderStatus || o.status || '';
        const oCustomer = o.user?.name || o.customer || '';

        const matchStatus = filter === 'all' || oStatus === filter;
        const matchSearch = !search || oId.toLowerCase().includes(search.toLowerCase()) || oCustomer.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setIsUpdating(true);
            toast.loading('Updating status...', { id: 'status-update' });

            const { data } = await updateOrderStatus(orderId, { orderStatus: newStatus });

            if (data.success) {
                setOrders(orders.map(o => {
                    const id = o._id || o.id;
                    return id === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o;
                }));

                if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
                    setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, status: newStatus });
                }

                toast.success(`Order status updated to ${newStatus}`, { id: 'status-update' });
            }
        } catch (error) {
            console.error('Update status error:', error);
            const msg = error.response?.data?.message || 'Failed to update status';
            toast.error(msg, { id: 'status-update' });
        } finally {
            setIsUpdating(false);
        }
    };

    const getOrderId = (order) => order._id || order.id || 'N/A';
    const getCustomerName = (order) => order.user?.name || order.shippingAddress?.fullName || order.customer || 'Unknown';
    const getCustomerEmail = (order) => order.user?.email || order.email || '';
    const getCustomerPhone = (order) => order.shippingAddress?.phone || order.phone || '';
    const getOrderStatus = (order) => order.orderStatus || order.status || 'pending';
    const getOrderTotal = (order) => order.totalAmount || order.total || 0;
    const getOrderDate = (order) => {
        if (!order.createdAt && !order.date) return '';
        return new Date(order.createdAt || order.date).toLocaleDateString();
    };

    return (
        <AdminLayout title="Orders" subtitle={`${orders.length} total orders`}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-xs w-full">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold" />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                    {['all', ...allStatuses].map(s => (
                        <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 capitalize whitespace-nowrap rounded-lg border transition-colors ${filter === s ? 'bg-gold text-white border-gold' : 'bg-white border-gray-200 hover:border-gold text-gray-600'}`}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {allStatuses.map(s => {
                    const count = orders.filter(o => getOrderStatus(o) === s).length;
                    return (
                        <div key={s} className="bg-white rounded-lg border border-gray-100 p-3 text-center">
                            <p className="text-2xl font-bold text-charcoal">{count}</p>
                            <p className={`text-[10px] uppercase tracking-wider font-medium mt-0.5 ${statusColor[s]?.split(' ')[1] || 'text-gray-400'}`}>{s}</p>
                        </div>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b">
                            <th className="p-3">Order ID</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3 text-right">Total</th><th className="p-3">Payment</th><th className="p-3 text-center">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center bg-white">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(o => (
                                    <tr key={getOrderId(o)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-3 font-mono text-xs font-medium">#{getOrderId(o).substring(0, 8)}</td>
                                        <td className="p-3"><p className="text-xs font-medium">{getCustomerName(o)}</p><p className="text-[10px] text-gray-400">{getCustomerEmail(o)}</p></td>
                                        <td className="p-3 text-xs">{o.items?.length || o.orderItems?.length || 0} item{(o.items?.length || o.orderItems?.length) !== 1 ? 's' : ''}</td>
                                        <td className="p-3 text-right font-medium text-xs">₹{getOrderTotal(o).toLocaleString('en-IN')}</td>
                                        <td className="p-3"><span className="text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{o.paymentMethod || o.payment || 'N/A'}</span></td>
                                        <td className="p-3 text-center">
                                            {(() => {
                                                const currentStatus = getOrderStatus(o);
                                                const allowed = validTransitions[currentStatus] || [];
                                                const isLocked = ['delivered', 'cancelled'].includes(currentStatus);

                                                return (
                                                    <select
                                                        value={currentStatus}
                                                        onChange={(e) => handleStatusUpdate(getOrderId(o), e.target.value)}
                                                        disabled={isUpdating || isLocked}
                                                        className={`text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold border border-transparent shadow-sm outline-none cursor-pointer transition-all ${isLocked ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'} ${statusColor[currentStatus] || 'bg-gray-100'}`}
                                                    >
                                                        <option value={currentStatus}>{currentStatus}</option>
                                                        {allowed.map(s => <option key={s} value={s} className="bg-white text-charcoal">{s}</option>)}
                                                    </select>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-3 text-xs text-gray-400">{getOrderDate(o)}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => setSelectedOrder(o)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><HiOutlineEye size={14} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400 text-sm">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={() => setSelectedOrder(null)}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-lg p-6 mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading text-lg font-semibold">Order #{getOrderId(selectedOrder).substring(0, 8)}</h2>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-charcoal"><HiOutlineX size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Customer Details</h4>
                                    <p className="text-sm font-medium">{getCustomerName(selectedOrder)}</p>
                                    <p className="text-xs text-gray-500">{getCustomerEmail(selectedOrder)} · {getCustomerPhone(selectedOrder)}</p>

                                    {selectedOrder.shippingAddress && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            <p>{selectedOrder.shippingAddress.address}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pinCode}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Items</h4>
                                    {(selectedOrder.items || selectedOrder.orderItems || []).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                            <img src={item.image || item.product?.images?.[0] || 'https://via.placeholder.com/100'} alt="" className="w-10 h-10 object-cover rounded bg-ivory" />
                                            <div className="flex-1">
                                                <p className="text-xs font-medium">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">Qty: {item.qty || item.quantity || 1}</p>
                                            </div>
                                            <span className="text-xs font-medium">₹{((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment & Shipping */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase">Payment Method</p><p className="text-sm font-medium uppercase mt-0.5">{selectedOrder.paymentMethod || selectedOrder.payment || 'N/A'}</p></div>
                                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-[10px] text-gray-400 uppercase">Total Amount</p><p className="text-sm font-bold mt-0.5">₹{getOrderTotal(selectedOrder).toLocaleString('en-IN')}</p></div>
                                </div>

                                {(selectedOrder.awbCode || selectedOrder.trackingNumber || selectedOrder.trackingId) && (
                                    <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <HiOutlineTruck size={16} className="text-blue-600" />
                                            <div>
                                                <p className="text-xs font-medium text-blue-700">
                                                    {selectedOrder.courierName || 'Shiprocket Courier'} — {selectedOrder.awbCode || selectedOrder.trackingNumber}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.trackingUrl && (
                                            <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline">
                                                Track
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Status Update */}
                                <div className="border-t border-gray-100 pt-4">
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 block">Update Status</label>
                                    <div className="flex gap-2">
                                        {(() => {
                                            const currentStatus = getOrderStatus(selectedOrder);
                                            const allowed = validTransitions[currentStatus] || [];
                                            const isLocked = ['delivered', 'cancelled'].includes(currentStatus);

                                            return (
                                                <select
                                                    value={currentStatus}
                                                    onChange={(e) => handleStatusUpdate(getOrderId(selectedOrder), e.target.value)}
                                                    disabled={isUpdating || isLocked}
                                                    className={`flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold capitalize ${isLocked ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                                >
                                                    <option value={currentStatus}>{currentStatus}</option>
                                                    {allowed.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            );
                                        })()}
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="px-4 py-2 bg-gray-100 text-charcoal rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminOrders;
