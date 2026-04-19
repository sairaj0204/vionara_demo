import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAnalytics } from '@/services/api';
import toast from 'react-hot-toast';

const COLORS = ['#D4AF37', '#B8860B', '#DAA520', '#CFB53B'];

const AdminAnalytics = () => {
    const [period, setPeriod] = useState('9months');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const { data } = await getAnalytics({ period });
                if (data.success) {
                    setAnalytics(data.analytics);
                }
            } catch (error) {
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [period]);

    if (loading && !analytics) {
        return (
            <AdminLayout title="Analytics" subtitle="Detailed store performance insights">
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    const {
        revenueTrend = [],
        customerGrowth = [],
        bestSellers = [],
        categoryRevenue = [],
        avgOrderValue = 0,
    } = analytics || {};

    const totalRevenue = revenueTrend.reduce((s, m) => s + m.revenue, 0);
    const totalOrders = revenueTrend.reduce((s, m) => s + m.orders, 0);

    return (
        <AdminLayout title="Analytics" subtitle="Detailed store performance insights">
            {/* Period Selector + KPIs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg border border-gray-100 p-3 text-center"><p className="text-lg font-bold text-charcoal">₹{(totalRevenue / 100000).toFixed(1)}L</p><p className="text-[10px] text-gray-400 uppercase">Total Revenue</p></div>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 text-center"><p className="text-lg font-bold text-charcoal">{totalOrders}</p><p className="text-[10px] text-gray-400 uppercase">Total Orders</p></div>
                    <div className="bg-white rounded-lg border border-gray-100 p-3 text-center"><p className="text-lg font-bold text-charcoal">₹{avgOrderValue.toLocaleString('en-IN')}</p><p className="text-[10px] text-gray-400 uppercase">Avg Order</p></div>
                </div>
                <div className="flex gap-1">
                    {[{ val: '7days', label: '7D' }, { val: '30days', label: '30D' }, { val: '9months', label: '9M' }, { val: '1year', label: '1Y' }].map(p => (
                        <button key={p.val} onClick={() => setPeriod(p.val)} className={`text-xs px-3 py-1.5 rounded-lg border ${period === p.val ? 'bg-gold text-white border-gold' : 'bg-white border-gray-200 hover:border-gold'}`}>{p.label}</button>
                    ))}
                </div>
            </div>

            {/* Revenue + Orders Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Revenue Trend</h3>
                    <p className="text-xs text-gray-400 mb-4">Monthly revenue overview</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={revenueTrend}>
                            <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                            <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Orders Volume</h3>
                    <p className="text-xs text-gray-400 mb-4">Monthly order count</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                            <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Customer Growth + Category Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Customer Growth</h3>
                    <p className="text-xs text-gray-400 mb-4">Total and new customers over time</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={customerGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                            <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="newCustomers" stroke="#1A1A1A" strokeWidth={2} dot={{ r: 3 }} name="New Customers" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Revenue by Category</h3>
                    <p className="text-xs text-gray-400 mb-4">Sales distribution</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart><Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="revenue">
                            {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie><Tooltip formatter={(v) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} /></PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                        {categoryRevenue.map((cat, i) => (
                            <div key={cat._id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-gray-500 capitalize">{cat._id}</span></div>
                                <span className="font-medium">₹{(cat.revenue / 1000).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bar Chart Fixed + Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">Orders Trend</h3>
                    <p className="text-xs text-gray-400 mb-4">Orders volume</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }} />
                            <Bar dataKey="orders" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-heading font-semibold text-charcoal mb-4">Best Selling Products</h3>
                    <div className="space-y-3">
                        {bestSellers.map((p, i) => (
                            <div key={p._id} className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-gold/10 text-gold rounded text-[10px] flex items-center justify-center font-bold flex-shrink-0">#{i + 1}</span>
                                <img src={p.images?.[0]} alt="" className="w-8 h-8 object-cover rounded bg-ivory flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 capitalize">{p.category}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-medium">₹{p.price.toLocaleString('en-IN')}</p>
                                    <p className="text-[10px] text-gray-400">{p.sold} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
