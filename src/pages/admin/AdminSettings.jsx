import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCheck, HiOutlineGlobeAlt, HiOutlineCreditCard,
    HiOutlineTruck, HiOutlineMail, HiOutlineUser, HiOutlineLockClosed
} from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">{label}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
);

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('store');
    const [loading, setLoading] = useState(false);
    
    // Store states
    const [store, setStore] = useState({ name: 'Vionara Jewellery', email: 'hello@vionara.com', phone: '+91 98765 43210', website: 'https://vionara.com', address: 'Vionara Jewellery Pvt. Ltd., Mumbai, Maharashtra, India', currency: 'INR', gstNumber: '27XXXXX1234X1ZB', logo: '' });
    const [payment, setPayment] = useState({ razorpayKeyId: 'rzp_test_xxxxxxxxxx', razorpayKeySecret: '••••••••••••••••', razorpayEnabled: true, codEnabled: true, codMinOrder: '500', codMaxOrder: '100000' });
    const [shipping, setShipping] = useState({ shiprocketEmail: '', shiprocketPassword: '', shiprocketEnabled: false, freeShippingThreshold: '5000', defaultWeight: '100', pickupPincode: '400001' });
    const [email, setEmail] = useState({ smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '', orderConfirmation: true, shippingUpdates: true, promotionalEmails: false });
    const [adminProfile, setAdminProfile] = useState({ name: 'Admin', email: 'admin@vionara.com', currentPassword: '', newPassword: '', confirmPassword: '' });

    const tabs = [
        { id: 'store', label: 'Store', icon: HiOutlineGlobeAlt },
        { id: 'payment', label: 'Payment', icon: HiOutlineCreditCard },
        { id: 'shipping', label: 'Shipping', icon: HiOutlineTruck },
        { id: 'email', label: 'Email', icon: HiOutlineMail },
        { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    ];

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    const merged = data.settings;
                    if (merged.store) setStore({ ...store, ...merged.store });
                    if (merged.payment) setPayment({ ...payment, ...merged.payment });
                    if (merged.shipping) setShipping({ ...shipping, ...merged.shipping });
                    if (merged.email) setEmail({ ...email, ...merged.email });
                    if (merged.adminProfile) setAdminProfile({ ...adminProfile, ...merged.adminProfile });
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                store,
                payment,
                shipping,
                email,
                adminProfile
            };
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('Settings saved successfully');
            } else {
                toast.error(data.message || 'Failed to save settings');
            }
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Settings" subtitle="Manage your store configuration">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tab Navigation */}
                <div className="lg:w-48 flex-shrink-0">
                    <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-gold/10 text-gold font-medium border border-gold/20' : 'text-gray-500 hover:text-charcoal hover:bg-gray-100'}`}>
                                <tab.icon size={16} />{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl border border-gray-100 p-6">

                        {/* STORE TAB */}
                        {activeTab === 'store' && (
                            <>
                                <h3 className="font-heading font-semibold mb-5">Store Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Store Name" value={store.name} onChange={e => setStore({ ...store, name: e.target.value })} />
                                    <InputField label="Email" value={store.email} onChange={e => setStore({ ...store, email: e.target.value })} type="email" />
                                    <InputField label="Phone" value={store.phone} onChange={e => setStore({ ...store, phone: e.target.value })} />
                                    <InputField label="Website" value={store.website} onChange={e => setStore({ ...store, website: e.target.value })} type="url" />
                                    <InputField label="GST Number" value={store.gstNumber} onChange={e => setStore({ ...store, gstNumber: e.target.value })} />
                                    <InputField label="Currency" value={store.currency} onChange={e => setStore({ ...store, currency: e.target.value })} />
                                    <div className="sm:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Address</label><textarea value={store.address} onChange={e => setStore({ ...store, address: e.target.value })} rows={2} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                </div>
                            </>
                        )}

                        {/* PAYMENT TAB */}
                        {activeTab === 'payment' && (
                            <>
                                <h3 className="font-heading font-semibold mb-5">Payment Gateway</h3>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">Rz</div><div><p className="font-medium text-sm">Razorpay</p><p className="text-[10px] text-gray-400">UPI, Cards, Wallets, Net Banking</p></div></div>
                                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={payment.razorpayEnabled} onChange={e => setPayment({ ...payment, razorpayEnabled: e.target.checked })} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-checked:bg-gold rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></label>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InputField label="Key ID" value={payment.razorpayKeyId} onChange={e => setPayment({ ...payment, razorpayKeyId: e.target.value })} placeholder="rzp_test_..." />
                                            <InputField label="Key Secret" value={payment.razorpayKeySecret} onChange={e => setPayment({ ...payment, razorpayKeySecret: e.target.value })} type="password" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div><p className="font-medium text-sm">Cash on Delivery</p><p className="text-[10px] text-gray-400">Pay at the time of delivery</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={payment.codEnabled} onChange={e => setPayment({ ...payment, codEnabled: e.target.checked })} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-checked:bg-gold rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Min Order (₹)" value={payment.codMinOrder} onChange={e => setPayment({ ...payment, codMinOrder: e.target.value })} type="number" />
                                            <InputField label="Max Order (₹)" value={payment.codMaxOrder} onChange={e => setPayment({ ...payment, codMaxOrder: e.target.value })} type="number" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* SHIPPING TAB */}
                        {activeTab === 'shipping' && (
                            <>
                                <h3 className="font-heading font-semibold mb-5">Shipping Configuration</h3>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">SR</div><div><p className="font-medium text-sm">Shiprocket</p><p className="text-[10px] text-gray-400">Automated shipping & tracking</p></div></div>
                                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={shipping.shiprocketEnabled} onChange={e => setShipping({ ...shipping, shiprocketEnabled: e.target.checked })} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-checked:bg-gold rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></label>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InputField label="Email" value={shipping.shiprocketEmail} onChange={e => setShipping({ ...shipping, shiprocketEmail: e.target.value })} type="email" placeholder="registered@email.com" />
                                            <InputField label="Password" value={shipping.shiprocketPassword} onChange={e => setShipping({ ...shipping, shiprocketPassword: e.target.value })} type="password" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <InputField label="Free Shipping Above (₹)" value={shipping.freeShippingThreshold} onChange={e => setShipping({ ...shipping, freeShippingThreshold: e.target.value })} type="number" />
                                        <InputField label="Default Weight (g)" value={shipping.defaultWeight} onChange={e => setShipping({ ...shipping, defaultWeight: e.target.value })} type="number" />
                                        <InputField label="Pickup Pincode" value={shipping.pickupPincode} onChange={e => setShipping({ ...shipping, pickupPincode: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* EMAIL TAB */}
                        {activeTab === 'email' && (
                            <>
                                <h3 className="font-heading font-semibold mb-5">Email Configuration</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <InputField label="SMTP Host" value={email.smtpHost} onChange={e => setEmail({ ...email, smtpHost: e.target.value })} />
                                    <InputField label="SMTP Port" value={email.smtpPort} onChange={e => setEmail({ ...email, smtpPort: e.target.value })} />
                                    <InputField label="SMTP User" value={email.smtpUser} onChange={e => setEmail({ ...email, smtpUser: e.target.value })} />
                                    <InputField label="SMTP Password" value={email.smtpPass} onChange={e => setEmail({ ...email, smtpPass: e.target.value })} type="password" />
                                </div>
                                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Notification Preferences</h4>
                                <div className="space-y-3">
                                    {[{ key: 'orderConfirmation', label: 'Order Confirmation', desc: 'Send email on new orders' }, { key: 'shippingUpdates', label: 'Shipping Updates', desc: 'Notify on shipment status changes' }, { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Marketing & offers' }].map(n => (
                                        <div key={n.key} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div><p className="text-sm font-medium">{n.label}</p><p className="text-[10px] text-gray-400">{n.desc}</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={email[n.key]} onChange={e => setEmail({ ...email, [n.key]: e.target.checked })} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-checked:bg-gold rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" /></label>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <>
                                <h3 className="font-heading font-semibold mb-5">Admin Profile</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">{adminProfile.name.charAt(0)}</div>
                                    <div><p className="font-medium">{adminProfile.name}</p><p className="text-xs text-gray-400">{adminProfile.email}</p></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <InputField label="Name" value={adminProfile.name} onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })} />
                                    <InputField label="Email" value={adminProfile.email} onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })} type="email" />
                                </div>
                                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><HiOutlineLockClosed size={12} /> Change Password</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InputField label="Current Password" value={adminProfile.currentPassword} onChange={e => setAdminProfile({ ...adminProfile, currentPassword: e.target.value })} type="password" />
                                    <InputField label="New Password" value={adminProfile.newPassword} onChange={e => setAdminProfile({ ...adminProfile, newPassword: e.target.value })} type="password" />
                                    <InputField label="Confirm Password" value={adminProfile.confirmPassword} onChange={e => setAdminProfile({ ...adminProfile, confirmPassword: e.target.value })} type="password" />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                            <button onClick={handleSave} disabled={loading} className={`flex items-center gap-1.5 px-5 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <HiOutlineCheck size={16} />{loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
