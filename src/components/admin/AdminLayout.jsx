import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineChartBar, HiOutlineCube, HiOutlineClipboardList,
    HiOutlineUsers, HiOutlineTag, HiOutlineTrendingUp,
    HiOutlineArchive, HiOutlineCog, HiOutlineArrowLeft,
    HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineBell,
    HiOutlinePhotograph, HiOutlineColorSwatch, HiOutlineTemplate,
    HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineSupport
} from 'react-icons/hi';

const navItems = [
    { icon: HiOutlineChartBar, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: HiOutlineCube, label: 'Products', path: '/admin/products' },
    { icon: HiOutlineClipboardList, label: 'Orders', path: '/admin/orders' },
    { icon: HiOutlineUsers, label: 'Customers', path: '/admin/customers' },
    { icon: HiOutlineSupport, label: 'Support', path: '/admin/support-tickets' },
    { icon: HiOutlineTag, label: 'Coupons', path: '/admin/coupons' },
    { icon: HiOutlineTrendingUp, label: 'Analytics', path: '/admin/analytics' },
    { icon: HiOutlineArchive, label: 'Inventory', path: '/admin/inventory' },
    { icon: HiOutlineTemplate, label: 'Control', path: '/admin/cms' },
    { icon: HiOutlineCog, label: 'Settings', path: '/admin/settings' },
];

const AdminLayout = ({ children, title, subtitle, activeCMS, setActiveCMS }) => {
    const pathname = usePathname() || '';
    const router = useRouter();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cmsOpen, setCmsOpen] = useState(pathname.startsWith('/admin/cms'));

    const handleLogout = () => { logout(); router.push('/'); };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-charcoal text-white flex-shrink-0 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="font-heading text-lg font-bold tracking-wider text-gold">VIONARA</h2>
                        <p className="text-[10px] text-gray-500 tracking-wider uppercase mt-0.5">Admin Panel</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto w-full overflow-x-hidden">
                    {navItems.map((item) => {
                        const isCms = item.label === 'Control';
                        const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
                        
                        if (isCms) {
                            return (
                                <div key={item.path}>
                                    <div
                                        onClick={() => {
                                            if (pathname !== '/admin/cms') router.push('/admin/cms');
                                            setCmsOpen(!cmsOpen);
                                        }}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${isActive ? 'bg-gold/15 text-gold font-medium border border-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} />
                                            <span>Control</span>
                                        </div>
                                        {cmsOpen ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />}
                                    </div>
                                    {cmsOpen && pathname.startsWith('/admin/cms') && (
                                        <div className="ml-7 mt-1.5 space-y-1 border-l border-white/10 pl-3">
                                            {[
                                                { id: 'hero', label: 'Hero Banner' },
                                                { id: 'categories', label: 'Categories' },
                                                { id: 'sections', label: 'Home Sections' },
                                                { id: 'badges', label: 'Product Badges', path: '/admin/cms/product-badges' },
                                                { id: 'offers', label: 'Offers & Discounts', path: '/admin/cms/offers' },
                                                { id: 'reviews', label: 'Reviews CMS', path: '/admin/cms/reviews' },
                                                { id: 'inventory', label: 'Inventory CMS' },
                                                { id: 'search', label: 'Search Manager' },
                                                { id: 'video', label: 'Video Banner' },
                                                { id: 'mobile', label: 'Mobile CMS' },
                                                { id: 'theme', label: 'Theme Settings' },
                                                { id: 'announcement', label: 'Announcement Bar' }
                                            ].map(sub => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => {
                                                        if (sub.path) {
                                                            router.push(sub.path);
                                                        } else {
                                                            if (pathname !== '/admin/cms') router.push('/admin/cms');
                                                            if (setActiveCMS) setActiveCMS(sub.id);
                                                        }
                                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-200 ${(sub.path ? pathname === sub.path : pathname === '/admin/cms' && activeCMS === sub.id) ? 'bg-gold text-white font-medium shadow-sm' : 'text-gray-400 hover:text-gold hover:bg-white/5'}`}
                                                >
                                                    {sub.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                    ? 'bg-gold/15 text-gold font-medium border border-gold/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-white/10 space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gold hover:bg-white/5 transition-colors">
                        <HiOutlineArrowLeft size={16} />
                        <span>Back to Store</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors">
                        <HiOutlineLogout size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-charcoal">
                                <HiOutlineMenu size={22} />
                            </button>
                            <div>
                                <h1 className="font-heading text-lg lg:text-xl font-bold text-charcoal">{title || 'Dashboard'}</h1>
                                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative text-gray-400 hover:text-charcoal transition-colors">
                                <HiOutlineBell size={20} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full">3</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-medium text-charcoal">{user?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-400">Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
