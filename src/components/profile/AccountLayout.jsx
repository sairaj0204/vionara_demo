import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlineShoppingBag,
    HiOutlineHeart,
    HiOutlineLogout,
    HiOutlineCreditCard,
    HiOutlineGift,
    HiOutlineViewGrid,
    HiChevronRight,
    HiMenuAlt2,
    HiX,
    HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import { MdOutlineRingVolume } from 'react-icons/md';

const navItems = [
    { path: '/account',        label: 'Overview',               icon: HiOutlineViewGrid },
    { path: '/profile',        label: 'Personal Information',   icon: HiOutlineUser },
    { path: '/saved-payments', label: 'Saved Payment Methods',  icon: HiOutlineCreditCard },
    { path: '/addresses',      label: 'Address Book',           icon: HiOutlineLocationMarker },
    { path: '/wishlist',       label: 'Wishlist',               icon: HiOutlineHeart },
    { path: '/my-orders',      label: 'Order History',          icon: HiOutlineShoppingBag },
    { path: '/gift-card',      label: 'Gift Card Balance',      icon: HiOutlineGift },
    { path: '/ring-size',      label: 'Ring Size',              icon: MdOutlineRingVolume },
    { path: '/help-center',    label: 'Help Center',            icon: HiOutlineQuestionMarkCircle },
];

const ACTIVE_BG = '#8B2C2C';

const AccountLayout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const pathname = usePathname() || '';
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return null;

    const activeItem = navItems.find((i) => i.path === pathname);
    const pageLabel = activeItem?.label || title || 'Account Overview';

    const handleLogout = () => { logout(); router.push('/'); };

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', 'Poppins', sans-serif" }}>

            {/* ── Breadcrumb + Title Bar ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #EEE', padding: '16px 0' }}>
                <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Link href="/" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>Home</Link>
                        <span style={{ color: '#CCC', fontSize: 12 }}>/</span>
                        <Link href="/account" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>My Account</Link>
                        <span style={{ color: '#CCC', fontSize: 12 }}>/</span>
                        <span style={{ fontSize: 12, color: '#8B2C2C', fontWeight: 500 }}>{pageLabel}</span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', 'Inter', serif",
                        fontSize: 22,
                        fontWeight: 600,
                        color: '#1a1a1a',
                        margin: 0,
                        letterSpacing: '-0.01em',
                    }}>
                        My Account
                    </h1>
                </div>
            </div>

            {/* ── Mobile Menu Bar ── */}
            <div style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                background: '#fff',
                borderBottom: '1px solid #EEE',
            }}
                className="mob-bar">
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{pageLabel}</span>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}
                >
                    {mobileOpen ? <HiX size={18} /> : <HiMenuAlt2 size={18} />}
                    Menu
                </button>
            </div>

            {/* ── Mobile Dropdown ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', background: '#fff', borderBottom: '1px solid #EEE', display: 'none' }}
                        className="mob-bar"
                    >
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 20px', textDecoration: 'none',
                                        background: isActive ? ACTIVE_BG : 'transparent',
                                        color: isActive ? '#fff' : '#444',
                                        fontSize: 14, fontWeight: isActive ? 600 : 400,
                                        borderBottom: '1px solid #F5F5F5',
                                    }}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 20px', width: '100%', border: 'none',
                            background: 'transparent', color: '#D00', fontSize: 14, cursor: 'pointer',
                        }}>
                            <HiOutlineLogout size={16} /> Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Body ── */}
            <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                {/* ── SIDEBAR ── */}
                <aside style={{ width: 248, flexShrink: 0 }} className="desktop-sidebar">
                    {/* User greeting */}
                    <div style={{
                        padding: '16px 18px',
                        background: '#fff',
                        border: '1px solid #E8E0E0',
                        borderRadius: 8,
                        marginBottom: 8,
                    }}>
                        <p style={{ fontSize: 12, color: '#999', margin: '0 0 2px' }}>Hello,</p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: '#AAA', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>

                    {/* Nav menu */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #E8E0E0',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        textDecoration: 'none',
                                        background: isActive ? ACTIVE_BG : 'transparent',
                                        color: isActive ? '#fff' : '#444',
                                        fontSize: 13.5,
                                        fontWeight: isActive ? 600 : 400,
                                        borderBottom: idx < navItems.length - 1 ? '1px solid #F5EFEF' : 'none',
                                        transition: 'background 0.18s, color 0.18s',
                                        borderRadius: isActive ? 0 : 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = '#FBF3F3';
                                            e.currentTarget.style.color = '#8B2C2C';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = '#444';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Icon size={16} style={{ opacity: isActive ? 1 : 0.55 }} />
                                        {item.label}
                                    </div>
                                    <HiChevronRight size={14} style={{ opacity: 0.4 }} />
                                </Link>
                            );
                        })}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 16px', width: '100%', border: 'none',
                                background: 'transparent', color: '#C0392B',
                                fontSize: 13.5, cursor: 'pointer',
                                borderTop: '1px solid #F5EFEF',
                                transition: 'background 0.18s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FBF3F3'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <HiOutlineLogout size={16} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* ── CONTENT ── */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-sidebar { display: none !important; }
                    .mob-bar { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default AccountLayout;
