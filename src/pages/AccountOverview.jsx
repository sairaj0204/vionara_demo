import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePencil, HiX, HiOutlineCheck } from 'react-icons/hi';
import AccountLayout from '@/components/profile/AccountLayout';
import { updateProfile } from '@/services/api';
import toast from 'react-hot-toast';

/* ─── Inline Edit Modal ─────────────────────────────────── */
const EditModal = ({ user, onClose, onSaved }) => {
    const [form, setForm] = useState({
        name:        user?.name        || '',
        phone:       user?.phone       || '',
        dob:         user?.dob         || '',
        anniversary: user?.anniversary || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(form);
            onSaved();
            toast.success('Profile updated!');
            onClose();
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        border: '1px solid #DDD',
        borderRadius: 6,
        padding: '9px 12px',
        fontSize: 14,
        color: '#1a1a1a',
        outline: 'none',
        boxSizing: 'border-box',
        background: '#FAFAFA',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s',
    };

    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 600,
        color: '#888',
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        marginBottom: 6,
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20,
                }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        background: '#fff',
                        borderRadius: 10,
                        width: '100%',
                        maxWidth: 480,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid #F0E8E8',
                    }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a1a', fontFamily: 'inherit' }}>
                            Edit Personal Details
                        </h3>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#888', padding: 4, borderRadius: 4,
                            display: 'flex', alignItems: 'center',
                        }}>
                            <HiX size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Full Name *</label>
                                <input
                                    name="name" type="text" required
                                    value={form.name} onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={(e) => { e.target.style.borderColor = '#8B2C2C'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#DDD'; }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input
                                    name="phone" type="tel"
                                    value={form.phone} onChange={handleChange}
                                    style={inputStyle} placeholder="+91 XXXXX XXXXX"
                                    onFocus={(e) => { e.target.style.borderColor = '#8B2C2C'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#DDD'; }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Date of Birth</label>
                                <input
                                    name="dob" type="date"
                                    value={form.dob} onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={(e) => { e.target.style.borderColor = '#8B2C2C'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#DDD'; }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Anniversary Date</label>
                                <input
                                    name="anniversary" type="date"
                                    value={form.anniversary} onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={(e) => { e.target.style.borderColor = '#8B2C2C'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#DDD'; }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email" value={user?.email || ''} disabled
                                    style={{ ...inputStyle, background: '#F5F5F5', color: '#AAA', cursor: 'not-allowed' }}
                                />
                                <p style={{ fontSize: 11, color: '#BBB', margin: '4px 0 0' }}>Email cannot be changed</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #F5F5F5', marginTop: 8 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    background: loading ? '#CCC' : '#8B2C2C',
                                    color: '#fff', border: 'none', borderRadius: 6,
                                    padding: '10px 0', fontSize: 14, fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    fontFamily: 'inherit',
                                    transition: 'background 0.18s',
                                }}
                                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#7a2424'; }}
                                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#8B2C2C'; }}
                            >
                                {loading ? 'Saving…' : <><HiOutlineCheck size={15} /> Save Changes</>}
                            </button>
                            <button
                                type="button" onClick={onClose}
                                style={{
                                    padding: '10px 18px', border: '1px solid #DDD',
                                    borderRadius: 6, background: '#fff', fontSize: 14,
                                    color: '#555', cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F5'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/* ─── Info Row ───────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
    <tr>
        <td style={{
            padding: '13px 0',
            fontSize: 14,
            color: '#666',
            fontWeight: 400,
            width: 200,
            verticalAlign: 'top',
            borderBottom: '1px solid #F5F0F0',
            whiteSpace: 'nowrap',
        }}>
            {label}
        </td>
        <td style={{
            padding: '13px 0 13px 8px',
            fontSize: 14,
            color: '#888',
            fontWeight: 300,
            borderBottom: '1px solid #F5F0F0',
        }}>
            :
        </td>
        <td style={{
            padding: '13px 0 13px 16px',
            fontSize: 14,
            color: value ? '#1a1a1a' : '#CCC',
            fontWeight: value ? 500 : 400,
            borderBottom: '1px solid #F5F0F0',
        }}>
            {value || '—'}
        </td>
    </tr>
);

/* ─── Page ───────────────────────────────────────────────── */
const AccountOverview = () => {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!user) router.push('/auth');
    }, [user, router]);

    if (!user) return null;

    const fmt = (d) => {
        if (!d) return null;
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch { return d; }
    };

    return (
        <AccountLayout>
            {/* Section title */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{
                    fontFamily: "'Playfair Display', 'Inter', serif",
                    fontSize: 20, fontWeight: 600,
                    color: '#1a1a1a', margin: '0 0 4px',
                }}>
                    Account Overview
                </h2>
                <p style={{ fontSize: 13, color: '#AAA', margin: 0 }}>
                    View and manage your personal details
                </p>
            </div>

            {/* Personal Information Box */}
            <div style={{
                background: '#fff',
                border: '1px solid #E5CFCF',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 20,
            }}>
                {/* Box header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid #F5EFEF',
                    background: '#FBF8F8',
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1a1a1a',
                        letterSpacing: '0.01em',
                    }}>
                        Personal Information
                    </h3>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 14px',
                            background: 'transparent',
                            border: '1px solid #8B2C2C',
                            borderRadius: 5,
                            color: '#8B2C2C',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                            letterSpacing: '0.02em',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#8B2C2C';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#8B2C2C';
                        }}
                    >
                        <HiOutlinePencil size={13} />
                        Edit Details
                    </button>
                </div>

                {/* Info table */}
                <div style={{ padding: '4px 20px 8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <InfoRow label="Name"            value={user.name} />
                            <InfoRow label="Date of Birth"   value={fmt(user.dob)} />
                            <InfoRow label="Anniversary"     value={fmt(user.anniversary)} />
                            <InfoRow label="Phone Number"    value={user.phone} />
                            <InfoRow label="Email Address"   value={user.email} />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <EditModal
                    user={user}
                    onClose={() => setShowModal(false)}
                    onSaved={refreshUser}
                />
            )}
        </AccountLayout>
    );
};

export default AccountOverview;
