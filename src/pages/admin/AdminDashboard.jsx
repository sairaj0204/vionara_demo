import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HiCurrencyRupee, HiShoppingCart, HiOutlineCube, HiUserGroup, HiTrendingUp, HiArrowSmRight, HiOutlinePhotograph, HiOutlineAnnotation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { getDashboardStats } from '@/services/api';

const statusColor = {
    delivered: 'bg-emerald-100 text-emerald-700', shipped: 'bg-blue-100 text-blue-700',
    processing: 'bg-amber-100 text-amber-700', confirmed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
};

const CATEGORY_COLORS = {
    'rings': '#D4AF37',
    'earrings': '#B8860B',
    'necklaces': '#DAA520',
    'bangles': '#CFB53B'
};

const AdminDashboard = () => {
    const [statsData, setStatsData] = useState(null);
    const [pendingTickets, setPendingTickets] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('vionara_token');
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    getDashboardStats(),
                    fetch('/api/admin/support-tickets?status=pending&limit=1', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(r => r.json())
                ]);

                if (statsRes.data.success) {
                    setStatsData(statsRes.data.stats);
                }
                if (ticketsRes.success) {
                    setPendingTickets(ticketsRes.summary?.pending || 0);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <AdminLayout title="Dashboard" subtitle="Loading your store overview...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!statsData) return <AdminLayout title="Dashboard"><p>No data available</p></AdminLayout>;

    // Prepare data for UI
    const { totalRevenue, totalOrders, totalProducts, totalCustomers, lowStockProducts, recentOrders, monthlySales, categoryStats } = statsData;

    const stats = [
        { icon: HiCurrencyRupee, label: 'Total Revenue', value: `₹${(totalRevenue || 0).toLocaleString('en-IN')}`, change: '+0%', changeType: 'neutral', iconBg: 'bg-emerald-50 text-emerald-600' },
        { icon: HiShoppingCart, label: 'Total Orders', value: totalOrders.toString(), change: '+0%', changeType: 'neutral', iconBg: 'bg-blue-50 text-blue-600' },
        { icon: HiOutlineCube, label: 'Products', value: totalProducts.toString(), change: '+0%', changeType: 'neutral', iconBg: 'bg-purple-50 text-purple-600' },
        { icon: HiOutlineAnnotation, label: 'Support (Pending)', value: pendingTickets.toString(), change: 'Hot', changeType: 'urgent', iconBg: 'bg-red-50 text-red-600' },
    ];

    // Format category data for PieChart
    const totalSoldItems = categoryStats.reduce((acc, cat) => acc + (cat.count || 0), 0);
    const formattedCategoryData = categoryStats.map(cat => ({
        name: cat._id || 'Unknown',
        value: totalSoldItems ? Math.round((cat.count / totalSoldItems) * 100) : 0,
        color: CATEGORY_COLORS[cat._id?.toLowerCase()] || '#999'
    })).filter(cat => cat.value > 0);

    const formatMonth = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + '-01');
        return date.toLocaleString('default', { month: 'short' });
    };

    const formattedSalesData = monthlySales.map(m => ({
        month: formatMonth(m._id),
        revenue: m.revenue,
        orders: m.orders
    }));

    return (
        <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your store overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                                <HiTrendingUp size={10} />{stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                    Quick Management
                </h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium text-charcoal hover:border-gold hover:shadow-sm transition-all">
                        <HiOutlineCube className="text-gold" size={16} />
                        Add New Product
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium text-charcoal hover:border-gold hover:shadow-sm transition-all">
                        <HiShoppingCart className="text-blue-500" size={16} />
                        Manage Orders
                    </Link>
                    <Link href="/admin/banners" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium text-charcoal hover:border-gold hover:shadow-sm transition-all">
                        <HiOutlinePhotograph className="text-purple-500" size={16} />
                        Update Banners
                    </Link>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-heading font-semibold text-charcoal">Revenue Overview</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly revenue trend</p>
                        </div>
                        <Link href="/admin/analytics" className="text-xs text-gold hover:text-amber-600 flex items-center gap-1">
                            View Details <HiArrowSmRight size={14} />
                        </Link>
                    </div>
                    {formattedSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={formattedSalesData}>
                                <defs>
                                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[260px] flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-lg">No revenue data available</div>
                    )}
                </div>

                {/* Category Pie */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Products by Category</h3>
                    <p className="text-xs text-gray-400 mb-4">Inventory distribution</p>
                    {formattedCategoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={formattedCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                        {formattedCategoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {formattedCategoryData.map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs text-gray-500 capitalize">{cat.name} ({cat.value}%)</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-lg mt-2">No category data</div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-charcoal">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-xs text-gold hover:text-amber-600 flex items-center gap-1">
                            View All <HiArrowSmRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3 text-right">Total</th><th className="pb-3 text-center">Status</th>
                            </tr></thead>
                            <tbody>
                                {recentOrders && recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3">
                                                <p className="font-mono text-xs font-medium">#{order._id.substring(0, 8)}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-gold/10 text-gold rounded-full flex items-center justify-center text-[10px] font-bold">
                                                        {order.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-xs">{order.user?.name || 'Guest User'}</p>
                                                        <p className="text-[10px] text-gray-400">{order.items?.length || 0} items</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right font-medium text-xs">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 text-center">
                                                <span className={`text-[10px] px-2 py-1 rounded-full capitalize font-medium ${statusColor[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-6 text-center text-sm text-gray-400">No recent orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-semibold text-charcoal">Low Stock Alert</h3>
                            <Link href="/admin/inventory" className="text-xs text-gold hover:text-amber-600 flex items-center gap-1">
                                Manage <HiArrowSmRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {lowStockProducts && lowStockProducts.length > 0 ? (
                                lowStockProducts.map((prod) => (
                                    <div key={prod._id} className="flex items-center gap-3">
                                        <img src={prod.images?.[0] || 'https://via.placeholder.com/40'} alt={prod.name} className="w-9 h-9 object-cover rounded-md bg-ivory" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{prod.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${prod.stock <= 2 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(prod.stock * 10, 100)}%` }} />
                                                </div>
                                                <span className={`text-[10px] font-medium ${prod.stock <= 2 ? 'text-red-500' : 'text-amber-500'}`}>{prod.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">All products are well stocked</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
