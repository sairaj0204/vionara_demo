import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineExclamation, HiOutlineCheck, HiOutlineDownload } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import { demoProducts } from '@/utils/data';
import toast from 'react-hot-toast';

const AdminInventory = () => {
    const [products, setProducts] = useState(demoProducts.map(p => ({ ...p })));
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [editedStocks, setEditedStocks] = useState({});

    const filtered = products.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        if (filter === 'low') return matchSearch && p.stock <= 10;
        if (filter === 'out') return matchSearch && p.stock === 0;
        if (filter === 'in') return matchSearch && p.stock > 10;
        return matchSearch;
    }).sort((a, b) => a.stock - b.stock);

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalStock = products.reduce((s, p) => s + p.stock, 0);

    const handleStockChange = (id, value) => setEditedStocks({ ...editedStocks, [id]: Number(value) });

    const saveStock = (id) => {
        if (editedStocks[id] !== undefined) {
            setProducts(products.map(p => p._id === id ? { ...p, stock: editedStocks[id] } : p));
            const newEdited = { ...editedStocks };
            delete newEdited[id];
            setEditedStocks(newEdited);
            toast.success('Stock updated');
        }
    };

    const bulkUpdateAll = () => {
        setProducts(products.map(p => editedStocks[p._id] !== undefined ? { ...p, stock: editedStocks[p._id] } : p));
        setEditedStocks({});
        toast.success('All stock levels updated');
    };

    return (
        <AdminLayout title="Inventory" subtitle={`${products.length} products tracked`}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 border border-gray-100 p-6 text-center">
                        <p className="text-3xl font-bold text-gray-800">{totalStock}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1 font-medium">Total Units</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 border border-gray-100 p-6 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{products.filter(p => p.stock > 10).length}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1 font-medium">In Stock</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 border border-gray-100 p-6 text-center">
                        <p className="text-3xl font-bold text-orange-500">{lowStockCount}</p>
                        <p className="text-xs text-orange-400 uppercase tracking-wide mt-1 font-medium">Low Stock</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 border border-gray-100 p-6 text-center">
                        <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
                        <p className="text-xs text-red-500 uppercase tracking-wide mt-1 font-medium">Out of Stock</p>
                    </motion.div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                        <div className="relative flex-1 max-w-xs">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gold shadow-sm transition-colors bg-white" />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {[{ val: 'all', label: 'All' }, { val: 'low', label: 'Low Stock' }, { val: 'out', label: 'Out of Stock' }, { val: 'in', label: 'In Stock' }].map(f => (
                                <button key={f.val} onClick={() => setFilter(f.val)} className={`text-xs px-4 py-2.5 whitespace-nowrap rounded-xl border transition-all duration-200 font-medium ${filter === f.val ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:border-gray-300 hover:bg-gray-50'}`}>{f.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        {Object.keys(editedStocks).length > 0 && (
                            <button onClick={bulkUpdateAll} className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all">
                                <HiOutlineCheck size={16} />Save All ({Object.keys(editedStocks).length})
                            </button>
                        )}
                        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all text-gray-700">
                            <HiOutlineDownload size={16} />Export CSV
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-4 font-semibold w-64">Product</th>
                                    <th className="px-5 py-4 font-semibold">SKU</th>
                                    <th className="px-5 py-4 font-semibold">Category</th>
                                    <th className="px-5 py-4 font-semibold">Price</th>
                                    <th className="px-5 py-4 font-semibold text-center w-48">Current Stock</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                    <th className="px-5 py-4 font-semibold text-center">Update Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, index) => {
                                    const editedVal = editedStocks[p._id];
                                    const isDirty = editedVal !== undefined;
                                    return (
                                        <tr
                                            key={p._id}
                                            className={`border-b border-gray-100 transition-all duration-200 hover:bg-gray-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={p.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-lg shadow-sm bg-gray-50 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{p.material}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.sku}</td>
                                            <td className="px-5 py-4">
                                                <span className="text-[11px] font-medium tracking-wide uppercase bg-gray-100 text-gray-600 px-3 py-1 rounded-md">{p.category}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-700">₹{p.price.toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="flex-1 max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner shrink-0">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{
                                                                width: `${Math.min(p.stock * 2.5, 100)}%`,
                                                                backgroundImage: 'linear-gradient(to right, #ef4444, #eab308, #22c55e)'
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 w-8 text-right shrink-0">{p.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {p.stock === 0
                                                    ? <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-bold inline-flex items-center gap-1 justify-center shadow-sm min-w-[70px]"><HiOutlineExclamation size={12} />Out</span>
                                                    : p.stock <= 5 ? <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[11px] font-bold inline-block shadow-sm min-w-[70px]">Critical</span>
                                                    : p.stock <= 10 ? <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[11px] font-bold inline-block shadow-sm min-w-[70px]">Low</span>
                                                    : <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[11px] font-bold inline-block shadow-sm min-w-[70px]">Good</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={isDirty ? editedVal : p.stock}
                                                        onChange={e => handleStockChange(p._id, e.target.value)}
                                                        className={`w-16 text-center border rounded-lg py-1.5 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-gray-200 ${isDirty ? 'border-gray-800 bg-gray-50 text-gray-900 shadow-sm' : 'border-gray-200 text-gray-700'}`}
                                                    />
                                                    {isDirty && (
                                                        <button onClick={() => saveStock(p._id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 hover:shadow-md transition-all">
                                                            <HiOutlineCheck size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-sm">No products match your current filter.</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminInventory;
