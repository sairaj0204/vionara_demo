import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineCheck, HiOutlineCalendar, HiOutlineCurrencyRupee } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

const initialCoupons = [
    { _id: '1', code: 'WELCOME10', description: '10% off for new customers', discountType: 'percentage', discountValue: 10, minPurchase: 5000, maxDiscount: 5000, validFrom: '2025-01-01', validTo: '2027-12-31', usedCount: 42, maxUses: 500, isActive: true },
    { _id: '2', code: 'VIONARA20', description: '20% off all products', discountType: 'percentage', discountValue: 20, minPurchase: 15000, maxDiscount: 15000, validFrom: '2025-06-01', validTo: '2027-12-31', usedCount: 18, maxUses: 200, isActive: true },
    { _id: '3', code: 'FLAT5000', description: '₹5000 off orders above ₹50K', discountType: 'fixed', discountValue: 5000, minPurchase: 50000, maxDiscount: 5000, validFrom: '2025-01-01', validTo: '2027-12-31', usedCount: 7, maxUses: 100, isActive: true },
    { _id: '4', code: 'BRIDAL30', description: '30% off bridal collection', discountType: 'percentage', discountValue: 30, minPurchase: 75000, maxDiscount: 25000, validFrom: '2026-01-01', validTo: '2026-06-30', usedCount: 3, maxUses: 50, isActive: true },
    { _id: '5', code: 'FESTIVE15', description: 'Festive season 15% off', discountType: 'percentage', discountValue: 15, minPurchase: 10000, maxDiscount: 10000, validFrom: '2025-10-01', validTo: '2025-11-30', usedCount: 89, maxUses: 100, isActive: false },
];

const emptyForm = { code: '', description: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxDiscount: '', validFrom: '', validTo: '', maxUses: '', isActive: true };

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState(initialCoupons);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const openAdd = () => { setEditingCoupon(null); setForm({ ...emptyForm }); setShowModal(true); };
    const openEdit = (c) => { setEditingCoupon(c); setForm({ ...c, discountValue: c.discountValue.toString(), minPurchase: c.minPurchase.toString(), maxDiscount: c.maxDiscount.toString(), maxUses: c.maxUses.toString() }); setShowModal(true); };

    const handleSave = () => {
        if (!form.code || !form.discountValue) { toast.error('Fill required fields'); return; }
        if (editingCoupon) {
            setCoupons(coupons.map(c => c._id === editingCoupon._id ? { ...c, ...form, discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxDiscount: Number(form.maxDiscount), maxUses: Number(form.maxUses) } : c));
            toast.success('Coupon updated');
        } else {
            setCoupons([{ ...form, _id: Date.now().toString(), discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxDiscount: Number(form.maxDiscount), maxUses: Number(form.maxUses), usedCount: 0 }, ...coupons]);
            toast.success('Coupon created');
        }
        setShowModal(false);
    };

    const handleDelete = (id) => { setCoupons(coupons.filter(c => c._id !== id)); toast.success('Coupon deleted'); };
    const toggleActive = (id) => { setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c)); };

    return (
        <AdminLayout title="Coupons & Discounts" subtitle={`${coupons.length} coupon codes`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">{coupons.filter(c => c.isActive).length} Active</span>
                    <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">{coupons.filter(c => !c.isActive).length} Inactive</span>
                </div>
                <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-gold text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors">
                    <HiOutlinePlus size={14} />Create Coupon
                </button>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((c, i) => (
                    <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`bg-white rounded-xl border p-5 relative overflow-hidden ${c.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                        {/* Decorative edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-l-xl" />
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-charcoal text-gold font-mono font-bold text-sm px-3 py-1 rounded tracking-wider">{c.code}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Expired'}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><HiOutlinePencil size={14} /></button>
                                <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><HiOutlineTrash size={14} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-4">
                            <div className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[10px] text-gray-400 uppercase">Discount</p>
                                <p className="font-bold text-charcoal mt-0.5">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue.toLocaleString('en-IN')}`}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[10px] text-gray-400 uppercase">Min Order</p>
                                <p className="font-bold text-charcoal mt-0.5">₹{c.minPurchase.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[10px] text-gray-400 uppercase">Used</p>
                                <p className="font-bold text-charcoal mt-0.5">{c.usedCount}/{c.maxUses}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[10px] text-gray-400 uppercase">Expires</p>
                                <p className="font-bold text-charcoal mt-0.5">{new Date(c.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            </div>
                        </div>

                        {/* Usage Bar */}
                        <div className="mt-3">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-md p-6 mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading text-lg font-semibold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-charcoal"><HiOutlineX size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Code *</label><input name="code" value={form.code} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg font-mono uppercase" placeholder="e.g. SUMMER25" /></div>
                                <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Description</label><input name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Type</label><select name="discountType" value={form.discountType} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Value *</label><input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Min Purchase</label><input name="minPurchase" type="number" value={form.minPurchase} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Max Discount</label><input name="maxDiscount" type="number" value={form.maxDiscount} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valid From</label><input name="validFrom" type="date" value={form.validFrom} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Valid To</label><input name="validTo" type="date" value={form.validTo} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Max Uses</label><input name="maxUses" type="number" value={form.maxUses} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-gold w-4 h-4" /><span className="text-sm">Active</span></label>
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button onClick={handleSave} className="flex items-center gap-1.5 px-5 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-amber-600"><HiOutlineCheck size={16} />{editingCoupon ? 'Update' : 'Create'}</button>
                                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminCoupons;
