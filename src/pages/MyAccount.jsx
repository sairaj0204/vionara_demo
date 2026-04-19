import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineViewGrid, HiOutlineUser, HiOutlineCreditCard,
    HiOutlineLocationMarker, HiOutlineHeart, HiOutlineShoppingBag,
    HiOutlineGift, HiOutlineStar, HiOutlinePencil, HiOutlineLogout,
    HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTruck,
    HiPlus, HiCheck, HiX, HiMenuAlt3,
} from 'react-icons/hi';
import { MdOutlineRingVolume } from 'react-icons/md';
import { getUserOrders, updateProfile, changePasswordApi, addAddress, updateAddressApi, setAddressDefaultApi, deleteAddress } from '@/services/api';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════
   THEME — Vionara Gold / Charcoal 
   ═══════════════════════════════════════════════════════════ */
const T = {
    primary: '#8B2C2C',
    primaryHover: '#742424',
    gold: '#C9A646',
    goldDark: '#A78A30',
    bg: '#F9F8F6',
    white: '#FFFFFF',
    border: '#E8E2DA',
    borderLight: '#F0EBE4',
    text: '#1a1a1a',
    textMuted: '#777',
    textLight: '#AAA',
    font: "'Inter', 'Poppins', sans-serif",
    heading: "'Playfair Display', serif",
};

/* ═══════════════════════════════════════════════════════════
   SIDEBAR ITEMS
   ═══════════════════════════════════════════════════════════ */
const SECTIONS = [
    { id: 'overview',    label: 'Overview',              icon: HiOutlineViewGrid },
    { id: 'personal',    label: 'Personal Information',  icon: HiOutlineUser },
    { id: 'payments',    label: 'Saved Payment Methods', icon: HiOutlineCreditCard },
    { id: 'addresses',   label: 'Address Book',          icon: HiOutlineLocationMarker },
    { id: 'wishlist',    label: 'Wishlist',              icon: HiOutlineHeart },
    { id: 'orders',      label: 'Order History',         icon: HiOutlineShoppingBag },
    { id: 'giftcard',    label: 'Gift Card Balance',     icon: HiOutlineGift },
    { id: 'membership',  label: 'Vionara Pass',          icon: HiOutlineStar },
    { id: 'ringsize',    label: 'Ring Size',             icon: MdOutlineRingVolume },
];

/* ═══════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════ */
const inputStyle = {
    width: '100%', border: `1px solid ${T.border}`, borderRadius: 6,
    padding: '10px 14px', fontSize: 14, color: T.text, outline: 'none',
    background: T.white, fontFamily: T.font, transition: 'border-color 0.2s', boxSizing: 'border-box',
};
const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600, color: T.textMuted,
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
};
const sectionTitle = (text, sub) => (
    <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: T.heading, fontSize: 20, fontWeight: 600, color: T.text, margin: '0 0 4px' }}>{text}</h2>
        {sub && <p style={{ fontSize: 13, color: T.textLight, margin: 0 }}>{sub}</p>}
    </div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION: OVERVIEW
   ═══════════════════════════════════════════════════════════ */
const OverviewSection = ({ user, setActive }) => {
    const fmt = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return d; }
    };
    const rows = [
        ['Name', user.name],
        ['Email Address', user.email],
        ['Phone Number', user.phone || '—'],
        ['Date of Birth', fmt(user.dob)],
        ['Anniversary', fmt(user.anniversary)],
    ];
    return (
        <>
            {sectionTitle('Account Overview', 'View and manage your personal details')}
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: `1px solid ${T.borderLight}`, background: '#FDFBF8',
                }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text }}>Personal Information</h3>
                    <button onClick={() => setActive('personal')} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
                        background: 'transparent', border: `1px solid ${T.gold}`, borderRadius: 5,
                        color: T.gold, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        fontFamily: T.font, transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.gold; }}
                    >
                        <HiOutlinePencil size={13} /> Edit Details
                    </button>
                </div>
                <div style={{ padding: '4px 20px 12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {rows.map(([label, value], i) => (
                                <tr key={i}>
                                    <td style={{ padding: '13px 0', fontSize: 14, color: T.textMuted, fontWeight: 400, width: 180, borderBottom: `1px solid ${T.borderLight}`, whiteSpace: 'nowrap' }}>{label}</td>
                                    <td style={{ padding: '13px 0 13px 8px', fontSize: 14, color: '#bbb', borderBottom: `1px solid ${T.borderLight}` }}>:</td>
                                    <td style={{ padding: '13px 0 13px 16px', fontSize: 14, color: value && value !== '—' ? T.text : '#CCC', fontWeight: value && value !== '—' ? 500 : 400, borderBottom: `1px solid ${T.borderLight}` }}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════
   SECTION: PERSONAL INFORMATION (with inline edit)
   ═══════════════════════════════════════════════════════════ */
const PersonalInfoSection = ({ user, refreshUser }) => {
    const [editing, setEditing] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', dob: user.dob || '', anniversary: user.anniversary || '' });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleSave = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await updateProfile(form); await refreshUser(); setEditing(false); toast.success('Profile updated'); }
        catch { toast.error('Failed to update'); }
        finally { setLoading(false); }
    };

    const handlePwSave = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
        setLoading(true);
        try { await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); setChangingPw(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <>
            {sectionTitle('Personal Information', 'Manage your profile details')}
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.borderLight}`, background: '#FDFBF8' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text }}>Profile Details</h3>
                    {!editing && (
                        <button onClick={() => setEditing(true)} style={{ fontSize: 12.5, fontWeight: 600, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>Edit</button>
                    )}
                </div>
                <div style={{ padding: 20 }}>
                    {!editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
                            {[['Full Name', user.name], ['Email Address', user.email], ['Phone Number', user.phone || 'Not added'], ['Date of Birth', user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : '—'], ['Anniversary', user.anniversary ? new Date(user.anniversary).toLocaleDateString('en-IN') : '—']].map(([lbl, val], i) => (
                                <div key={i}>
                                    <p style={{ fontSize: 11, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 600 }}>{lbl}</p>
                                    <p style={{ fontSize: 14, color: T.text, fontWeight: 500, margin: 0 }}>{val}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} /></div>
                                <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+91 XXXXX XXXXX" /></div>
                                <div><label style={labelStyle}>Email (read-only)</label><input value={user.email} disabled style={{ ...inputStyle, background: '#F5F5F5', color: '#aaa', cursor: 'not-allowed' }} /></div>
                                <div><label style={labelStyle}>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Anniversary</label><input type="date" value={form.anniversary} onChange={e => setForm({ ...form, anniversary: e.target.value })} style={inputStyle} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: `1px solid ${T.borderLight}` }}>
                                <button type="submit" disabled={loading} style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>{loading ? 'Saving…' : 'Save Changes'}</button>
                                <button type="button" onClick={() => setEditing(false)} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '10px 18px', fontSize: 13, color: T.textMuted, cursor: 'pointer', fontFamily: T.font }}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Security */}
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.borderLight}`, background: '#FDFBF8' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.text }}>Security</h3>
                    {!changingPw && <button onClick={() => setChangingPw(true)} style={{ fontSize: 12.5, fontWeight: 600, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.font }}>Change Password</button>}
                </div>
                <div style={{ padding: 20 }}>
                    {!changingPw ? (
                        <><p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 4px' }}>Keep your account secure with a strong password.</p><p style={{ fontSize: 13, color: T.textLight, margin:0 }}>••••••••</p></>
                    ) : (
                        <form onSubmit={handlePwSave} style={{ maxWidth: 400 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                                <div><label style={labelStyle}>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required style={inputStyle} /></div>
                                <div><label style={labelStyle}>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Confirm New Password</label><input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={6} style={inputStyle} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" disabled={loading} style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>{loading ? 'Updating…' : 'Update Password'}</button>
                                <button type="button" onClick={() => { setChangingPw(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '10px 18px', fontSize: 13, color: T.textMuted, cursor: 'pointer', fontFamily: T.font }}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════
   SECTION: ORDER HISTORY
   ═══════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
    const cfg = {
        'Ordered': { bg: '#EFF6FF', txt: '#1D4ED8', icon: HiOutlineClock },
        'Packed': { bg: '#FEF9C3', txt: '#A16207', icon: HiOutlineShoppingBag },
        'Shipped': { bg: '#F3E8FF', txt: '#7C3AED', icon: HiOutlineTruck },
        'Out for Delivery': { bg: '#FFF7ED', txt: '#C2410C', icon: HiOutlineTruck },
        'Delivered': { bg: '#F0FDF4', txt: '#15803D', icon: HiOutlineCheckCircle },
        'Cancelled': { bg: '#FEF2F2', txt: '#B91C1C', icon: HiOutlineXCircle },
    };
    const c = cfg[status] || cfg['Ordered'];
    const Icon = c.icon;
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.txt, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Icon size={13} />{status}</span>;
};

const OrdersSection = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserOrders().then(({ data }) => { if (data.success) setOrders(data.orders || []); }).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <>
            {sectionTitle('Order History', 'Track and manage your orders')}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 28, height: 28, border: `2px solid ${T.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FBF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <HiOutlineShoppingBag size={36} style={{ color: '#D1C4A8' }} />
                    </div>
                    <h3 style={{ fontFamily: T.heading, fontSize: 18, fontWeight: 500, color: T.text, margin: '0 0 8px' }}>No Order Details Yet!</h3>
                    <p style={{ color: T.textMuted, fontSize: 13, margin: '0 0 20px' }}>Looks like you haven't placed any orders yet.</p>
                    <Link href="/shop" style={{
                        display: 'inline-block', padding: '10px 28px', background: T.primary, color: '#fff',
                        borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: T.font, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>Continue Shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderBottom: `1px solid ${T.borderLight}`, background: '#FDFBF8' }}>
                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                    {[['Order ID', `#${order._id.slice(-8).toUpperCase()}`], ['Date', new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })], ['Total', `₹${(order.totalPrice || order.totalAmount || 0).toLocaleString('en-IN')}`]].map(([l, v], i) => (
                                        <div key={i}><p style={{ fontSize: 10, color: T.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 2px' }}>{l}</p><p style={{ fontSize: 13, fontWeight: 600, color: i === 2 ? T.gold : T.text, margin: 0 }}>{v}</p></div>
                                    ))}
                                </div>
                                <StatusBadge status={order.orderStatus || 'Ordered'} />
                            </div>
                            <div style={{ padding: 18 }}>
                                {(order.items || order.orderItems || []).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '8px 0', borderBottom: idx < (order.items || order.orderItems || []).length - 1 ? `1px solid ${T.borderLight}` : 'none' }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 6, background: '#F9F6F1', border: `1px solid ${T.borderLight}`, overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 500, color: T.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                            <p style={{ fontSize: 12, color: T.textMuted, margin: '3px 0 0' }}>Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}</p>
                                        </div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>₹{item.price?.toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                                <div style={{ paddingTop: 12, marginTop: 8, borderTop: `1px solid ${T.borderLight}`, textAlign: 'right' }}>
                                    <Link href={`/track-order?id=${order.orderNumber}`} style={{ fontSize: 12, fontWeight: 600, color: T.gold, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>View Tracking →</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

/* ═══════════════════════════════════════════════════════════
   SECTION: ADDRESS BOOK
   ═══════════════════════════════════════════════════════════ */
const AddressSection = ({ user, refreshUser }) => {
    const [mode, setMode] = useState('list'); // list | add | edit
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const emptyForm = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };
    const [form, setForm] = useState(emptyForm);
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    const reset = () => { setForm(emptyForm); setMode('list'); setEditId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (mode === 'edit') await updateAddressApi(editId, form);
            else await addAddress({ ...form, isDefault: !user.addresses?.length });
            await refreshUser(); reset(); toast.success(mode === 'edit' ? 'Address updated' : 'Address added');
        } catch { toast.error('Failed to save'); } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try { await deleteAddress(id); await refreshUser(); toast.success('Deleted'); } catch { toast.error('Failed'); }
    };

    const handleDefault = async (id) => {
        try { await setAddressDefaultApi(id); await refreshUser(); toast.success('Default updated'); } catch { toast.error('Failed'); }
    };

    return (
        <>
            {sectionTitle('Address Book', 'Manage your delivery addresses')}
            {mode === 'list' ? (
                <>
                    <button onClick={() => setMode('add')} style={{
                        width: '100%', marginBottom: 16, border: `2px dashed ${T.border}`, borderRadius: 8,
                        padding: '14px', color: T.gold, fontWeight: 600, fontSize: 13, background: 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontFamily: T.font, transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = '#FDFBF2'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <HiPlus size={18} /> Add New Address
                    </button>
                    {!user.addresses?.length ? (
                        <div style={{ textAlign: 'center', padding: 40, background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textLight, fontSize: 13 }}>No addresses saved yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {user.addresses.map(addr => (
                                <div key={addr._id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <div style={{ marginTop: 2 }}>
                                                {addr.isDefault ? <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.gold, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiCheck size={12} /></div> : <HiOutlineLocationMarker size={20} style={{ color: '#CCC' }} />}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{addr.fullName}</span>
                                                    {addr.isDefault && <span style={{ background: '#F5F0E4', color: T.goldDark, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Default</span>}
                                                    <span style={{ fontSize: 13, color: T.textMuted }}>{addr.phone}</span>
                                                </div>
                                                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>
                                                    {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                                                    {addr.city}, {addr.state} — <span style={{ fontWeight: 600, color: T.text }}>{addr.pincode}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <button onClick={() => { setForm(addr); setEditId(addr._id); setMode('edit'); }} style={{ fontSize: 11, fontWeight: 600, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Edit</button>
                                                <button onClick={() => handleDelete(addr._id)} style={{ fontSize: 11, fontWeight: 600, color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delete</button>
                                            </div>
                                            {!addr.isDefault && <button onClick={() => handleDefault(addr._id)} style={{ fontSize: 11, color: '#4A90D9', background: 'none', border: 'none', cursor: 'pointer' }}>Set as Default</button>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: '0 0 18px', fontFamily: T.font }}>{mode === 'edit' ? 'Edit Address' : 'Add New Address'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                            <div><label style={labelStyle}>Full Name</label><input name="fullName" value={form.fullName} onChange={handleChange} required style={inputStyle} /></div>
                            <div><label style={labelStyle}>Phone</label><input name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} /></div>
                            <div><label style={labelStyle}>Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} required style={inputStyle} /></div>
                            <div><label style={labelStyle}>City</label><input name="city" value={form.city} onChange={handleChange} required style={inputStyle} /></div>
                        </div>
                        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Address Line 1</label><input name="addressLine1" value={form.addressLine1} onChange={handleChange} required style={inputStyle} placeholder="House/Flat No., Building Name, Street" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            <div><label style={labelStyle}>Address Line 2 (Optional)</label><input name="addressLine2" value={form.addressLine2} onChange={handleChange} style={inputStyle} placeholder="Landmark, Area" /></div>
                            <div><label style={labelStyle}>State</label><input name="state" value={form.state} onChange={handleChange} required style={inputStyle} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: `1px solid ${T.borderLight}` }}>
                            <button type="submit" disabled={loading} style={{ background: T.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>{loading ? 'Saving…' : 'Save Address'}</button>
                            <button type="button" onClick={reset} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '10px 18px', fontSize: 13, color: T.textMuted, cursor: 'pointer', fontFamily: T.font }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

/* ═══════════════════════════════════════════════════════════
   SECTION: WISHLIST
   ═══════════════════════════════════════════════════════════ */
const WishlistSection = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addItem } = useCart();

    const handleMove = (p) => { addItem(p, 1); removeFromWishlist(p._id); toast.success('Moved to cart'); };

    return (
        <>
            {sectionTitle('Wishlist', `${wishlist.length} saved item${wishlist.length !== 1 ? 's' : ''}`)}
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 8 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FBF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <HiOutlineHeart size={36} style={{ color: '#D1C4A8' }} />
                    </div>
                    <h3 style={{ fontFamily: T.heading, fontSize: 18, fontWeight: 500, color: T.text, margin: '0 0 8px' }}>Your Wishlist is Empty</h3>
                    <p style={{ color: T.textMuted, fontSize: 13, margin: '0 0 20px' }}>Save pieces you love and come back to them later.</p>
                    <Link href="/shop" style={{ display: 'inline-block', padding: '10px 28px', background: T.primary, color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: T.font, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Explore Collection</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                    {wishlist.map((p, i) => (
                        <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', aspectRatio: '4/5', background: '#F9F6F1', overflow: 'hidden' }}>
                                <Link href={`/product/${p.slug}`}><img src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} /></Link>
                                <button onClick={() => { removeFromWishlist(p._id); toast.success('Removed'); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#999' }}><HiX size={13} /></button>
                            </div>
                            <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <p style={{ fontSize: 10, color: T.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{p.category}</p>
                                <p style={{ fontSize: 13, fontWeight: 500, color: T.text, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 10px', marginTop: 'auto' }}>₹{p.price?.toLocaleString('en-IN')}</p>
                                <button onClick={() => handleMove(p)} style={{
                                    width: '100%', padding: '8px 0', border: `1px solid ${T.border}`, background: 'transparent',
                                    borderRadius: 5, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                                    color: T.text, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                                >
                                    <HiOutlineShoppingBag size={13} /> Move to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </>
    );
};

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER SECTIONS
   ═══════════════════════════════════════════════════════════ */
const PlaceholderSection = ({ icon: Icon, title, subtitle, description }) => (
    <>
        {sectionTitle(title, subtitle)}
        <div style={{ textAlign: 'center', padding: '50px 20px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FBF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon size={36} style={{ color: '#D1C4A8' }} />
            </div>
            <h3 style={{ fontFamily: T.heading, fontSize: 18, fontWeight: 500, color: T.text, margin: '0 0 8px' }}>{title}</h3>
            <p style={{ color: T.textMuted, fontSize: 13, margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>
        </div>
    </>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const MyAccount = () => {
    const { user, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [active, setActive] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            if (router) {
                router.push('/auth');
            } else if (typeof window !== 'undefined') {
                window.location.assign('/auth');
            }
        }
    }, [user, router]);
    if (!user) return null;

    const handleLogout = () => {
        logout();
        if (router) {
            router.push('/');
        } else if (typeof window !== 'undefined') {
            window.location.assign('/');
        }
    };

    const activeLabel = SECTIONS.find(s => s.id === active)?.label || 'Overview';

    const renderContent = () => {
        switch (active) {
            case 'overview':   return <OverviewSection user={user} setActive={setActive} />;
            case 'personal':   return <PersonalInfoSection user={user} refreshUser={refreshUser} />;
            case 'orders':     return <OrdersSection user={user} />;
            case 'addresses':  return <AddressSection user={user} refreshUser={refreshUser} />;
            case 'wishlist':   return <WishlistSection />;
            case 'payments':   return <PlaceholderSection icon={HiOutlineCreditCard} title="Saved Payment Methods" subtitle="Manage your saved cards" description="No saved payment methods yet. Your cards will appear here after checkout." />;
            case 'giftcard':   return <PlaceholderSection icon={HiOutlineGift} title="Gift Card Balance" subtitle="Redeem and manage gift cards" description="You don't have any active gift cards. Redeem a gift card at checkout." />;
            case 'membership': return <PlaceholderSection icon={HiOutlineStar} title="Vionara Pass" subtitle="Your membership details" description="Join the Vionara Pass program for exclusive benefits, early access, and special rewards." />;
            case 'ringsize':   return <PlaceholderSection icon={MdOutlineRingVolume} title="Ring Size" subtitle="Your ring size preference" description="Save your ring size for a seamless shopping experience. Coming soon." />;
            default:           return <OverviewSection user={user} setActive={setActive} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.font }}>

            {/* ── LUXURY TOP BANNER ── */}
            <div style={{ 
                background: 'linear-gradient(135deg, #000000 0%, #1A120B 100%)',
                padding: '45px 0',
                borderBottom: `2px solid ${T.gold}`
            }}>
                <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontFamily: T.heading, fontSize: 34, fontWeight: 400, color: '#FFFFFF', margin: '0 0 14px', letterSpacing: '0.04em' }}>My Account</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link href="/" style={{ fontSize: 11, color: '#A0A0A0', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, fontFamily: T.font, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FFF'} onMouseLeave={e => e.currentTarget.style.color = '#A0A0A0'}>Home</Link>
                        <span style={{ color: '#666', fontSize: 10 }}>&gt;</span>
                        <button onClick={() => setActive('overview')} style={{ fontSize: 11, color: '#A0A0A0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FFF'} onMouseLeave={e => e.currentTarget.style.color = '#A0A0A0'}>My Account</button>
                        <span style={{ color: '#666', fontSize: 10 }}>&gt;</span>
                        <span style={{ fontSize: 11, color: T.gold, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: T.font }}>{activeLabel}</span>
                    </div>
                </div>
            </div>

            {/* ── MOBILE TOGGLE ── */}
            <div className="mob-toggle" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: T.white, borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{activeLabel}</span>
                <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: T.font }}>
                    {mobileOpen ? <HiX size={18} /> : <HiMenuAlt3 size={18} />} Menu
                </button>
            </div>

            {/* ── MOBILE DROPDOWN ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', background: T.white, borderBottom: `1px solid ${T.border}` }} className="mob-toggle">
                        {SECTIONS.map(s => {
                            const isA = active === s.id;
                            const Icon = s.icon;
                            return (
                                <button key={`mob-${s.id}-${isA}`} onClick={() => { setActive(s.id); setMobileOpen(false); }} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', width: '100%',
                                    border: 'none', background: isA ? T.primary : 'transparent', color: isA ? '#fff' : '#444',
                                    fontSize: 14, fontWeight: isA ? 600 : 400, cursor: 'pointer', fontFamily: T.font,
                                    borderBottom: `1px solid ${T.borderLight}`, textAlign: 'left',
                                }}>
                                    <Icon size={16} /> {s.label}
                                </button>
                            );
                        })}
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', width: '100%', border: 'none', background: 'transparent', color: '#D00', fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
                            <HiOutlineLogout size={16} /> Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── BODY ── */}
            <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                {/* ── SIDEBAR ── */}
                <aside className="account-desk-sidebar" style={{ width: 248, flexShrink: 0 }}>
                    {/* User greeting */}
                    <div style={{ padding: '16px 18px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 8 }}>
                        <p style={{ fontSize: 12, color: T.textLight, margin: '0 0 2px' }}>Hello,</p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: T.textLight, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>

                    {/* Nav */}
                    <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                        {SECTIONS.map((s, idx) => {
                            const isA = active === s.id;
                            const Icon = s.icon;
                            return (
                                <button key={`${s.id}-${isA}`} onClick={() => setActive(s.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%',
                                        border: 'none', textAlign: 'left', fontFamily: T.font,
                                        background: isA ? T.primary : 'transparent',
                                        color: isA ? '#fff' : '#444',
                                        fontSize: 13.5, fontWeight: isA ? 600 : 400,
                                        borderBottom: idx < SECTIONS.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                                        cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isA) { e.currentTarget.style.background = '#FBF3F3'; e.currentTarget.style.color = T.primary; } }}
                                    onMouseLeave={e => { if (!isA) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#444'; } }}
                                >
                                    <Icon size={16} style={{ opacity: isA ? 1 : 0.5 }} />
                                    {s.label}
                                </button>
                            );
                        })}
                        <button onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%',
                                border: 'none', textAlign: 'left', fontFamily: T.font,
                                background: 'transparent', color: '#C0392B', fontSize: 13.5, cursor: 'pointer',
                                borderTop: `1px solid ${T.borderLight}`, transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FBF3F3'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <HiOutlineLogout size={16} /> Logout
                        </button>
                    </div>
                </aside>

                {/* ── CONTENT ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        {renderContent()}
                    </motion.div>
                </main>
            </div>

            {/* ── RESPONSIVE CSS ── */}
            <style>{`
                @media (max-width: 768px) {
                    .account-desk-sidebar { display: none !important; }
                    .mob-toggle { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default MyAccount;
