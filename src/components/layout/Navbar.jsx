import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineLocationMarker, HiOutlineCamera } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getSearchSuggestions, getPromoBanner } from '../../services/api';
import ImageSearchDrawer from '../ui/ImageSearchDrawer';
import axios from 'axios';

const navLinks = [
    { name: 'New Arrivals', path: '/shop?sort=newest' },
    { name: 'Best Seller', path: '/shop?sort=popular' },
    { name: 'Rings', path: '/collections/rings' },
    { name: 'Earrings', path: '/collections/earrings' },
    { name: 'Necklaces', path: '/collections/necklaces' },
    { name: 'Bracelets', path: '/collections/bangles' },
    { name: 'Mangalsutra', path: '/collections/necklaces?tag=mangalsutra' },
    { name: 'About Us', path: '/about' },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [pincode, setPincode] = useState('');
    const [locationLabel, setLocationLabel] = useState('');
    const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | success | error
    const [showPincodeInput, setShowPincodeInput] = useState(false);
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [topBar, setTopBar] = useState({ isActive: true, speed: 3000, messages: [{ text: "50% OFF on Select Styles", coupon: "EXTRA100" }], bgColor: "#000000", textColor: "#ffffff" });
    const [topBarIndex, setTopBarIndex] = useState(0);
    const { getCartCount } = useCart();
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const searchRef = useRef(null);

    // Load saved pincode + location from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('vionara_pincode_data');
        if (saved) {
            try {
                const { pincode: p, label } = JSON.parse(saved);
                if (p) { setPincode(p); setLocationLabel(label || p); setLocationStatus('success'); }
            } catch { /* ignore corrupt data */ }
        }

        // Fetch Top Promotional Banner
        getPromoBanner().then(res => {
            if (res.data.success && res.data.banner) {
                // If it's an old banner without messages, make it an array so UI doesn't crash prior to db flush
                const bData = res.data.banner;
                if (!bData.messages) {
                    bData.messages = [{ text: bData.text || '50% OFF on Select Styles', coupon: bData.coupon || '' }];
                }
                setTopBar(bData);
            }
        }).catch(err => console.error(err));
    }, []);

    // Sliding logic for top banner
    useEffect(() => {
        if (!topBar?.messages || topBar.messages.length <= 1) return;
        const interval = setInterval(() => {
            setTopBarIndex((prev) => (prev + 1) % topBar.messages.length);
        }, topBar.speed || 3000);
        return () => clearInterval(interval);
    }, [topBar]);

    // Auto-fetch location when 6 digits are entered
    useEffect(() => {
        if (pincode.length !== 6) {
            if (pincode.length < 6) setLocationStatus('idle');
            return;
        }
        const fetchLocation = async () => {
            setLocationStatus('loading');
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await res.json();
                if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                    const po = data[0].PostOffice[0];
                    const label = `${po.District}, ${po.State}`;
                    setLocationLabel(label);
                    setLocationStatus('success');
                    localStorage.setItem('vionara_pincode_data', JSON.stringify({ pincode, label }));
                    // Auto-close after a short delay
                    setTimeout(() => setShowPincodeInput(false), 900);
                } else {
                    setLocationLabel('');
                    setLocationStatus('error');
                }
            } catch {
                setLocationLabel('');
                setLocationStatus('error');
            }
        };
        fetchLocation();
    }, [pincode]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const { data } = await getSearchSuggestions(searchQuery);
                if (data.success) {
                    setSuggestions(data.suggestions);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/shop?search=${searchQuery}`);
            setSearchQuery('');
            setSuggestions([]);
        }
    };

    return (
        <>
            <header className={`fixed top-0 left-0 z-50 transition-all duration-300 w-full max-w-full overflow-x-hidden ${scrolled ? 'shadow-sm' : ''}`}>
            {/* ─── Top Header Announcement Bar ─── */}
            {topBar?.isActive && topBar?.messages?.length > 0 && (
                <div className="overflow-hidden relative flex justify-center items-center h-[38px] w-full" style={{ backgroundColor: topBar.bgColor }} id="announcement-bar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={topBarIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute flex items-center text-[13px] tracking-wide font-light whitespace-nowrap"
                            style={{ color: topBar.textColor }}
                        >
                            <span className="text-gold mr-2.5 text-[14px]">⚡</span>
                            <span>{topBar.messages[topBarIndex]?.text}</span>
                            {topBar.messages[topBarIndex]?.coupon && (
                                <span className="ml-3 bg-[#e53935] text-white text-[10px] font-bold px-2 py-[2px] rounded-sm tracking-wider leading-none flex items-center">
                                    {topBar.messages[topBarIndex].coupon}
                                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* ─── Main Header ─── */}
            <div className="bg-white border-b border-[#eee]">
                {/* Top Header Row: Logo + Pincode + Search + Icons */}
                <div className="max-w-[1520px] mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-[72px] gap-6">
                        {/* Logo - Left */}
                        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden text-charcoal"
                                id="mobile-menu-btn"
                            >
                                {mobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
                            </button>
                            <Link href="/" className="flex items-center" id="logo-link">
                                <h1 className="font-heading text-xl lg:text-2xl font-semibold tracking-[0.18em] text-charcoal">
                                    VIONARA
                                </h1>
                            </Link>
                            {/* Pincode Selector - inline next to logo (Desktop) */}
                            <button
                                onClick={() => setShowPincodeInput(!showPincodeInput)}
                                className="hidden lg:inline-flex items-center gap-[6px] text-[14px] font-normal text-[#6f6f6f] hover:text-[#000] cursor-pointer transition-colors ml-6"
                            >
                                <HiOutlineLocationMarker size={16} className={locationStatus === 'success' ? 'text-gold' : 'text-[#e53935]'} />
                                <span className={locationStatus === 'success' ? 'text-charcoal font-medium' : ''}>
                                    {locationStatus === 'success' ? `📍 ${pincode} · ${locationLabel}` : 'Update Delivery Pincode'}
                                </span>
                                <span className="text-[10px] ml-0.5">▼</span>
                            </button>
                        </div>

                        {/* Search Bar - Center (Desktop) - Pill shape like Palmonas */}
                        <div className="hidden lg:flex flex-1 max-w-xl relative" ref={searchRef}>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search for Jewellery..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    id="search-input"
                                    className="w-full bg-[#ece7dd] border-none rounded-full py-2.5 px-12 text-[13px] outline-none focus:bg-white focus:shadow-sm transition-all placeholder:text-gray-400"
                                />
                                <HiOutlineSearch size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <button 
                                    onClick={() => setShowImageSearch(true)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                                    title="Search by Image"
                                >
                                    <HiOutlineCamera size={18} />
                                </button>
                            </div>

                            {/* Search Suggestions */}
                            {searchQuery.length >= 2 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl rounded-xl border border-gray-100 max-h-[70vh] overflow-y-auto z-50">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="py-2">
                                            {suggestions.map((item) => (
                                                <Link
                                                    key={item._id}
                                                    href={`/product/${item.slug}`}
                                                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="w-11 h-11 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                                                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[13px] font-medium text-charcoal truncate">{item.name}</h4>
                                                        <p className="text-[12px] text-gold font-semibold mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <div className="p-3 bg-gray-50 text-center rounded-b-xl">
                                                <Link
                                                    href={`/shop?search=${searchQuery}`}
                                                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                                                    className="text-[11px] font-bold tracking-widest uppercase text-charcoal hover:text-gold"
                                                >
                                                    View all results for "{searchQuery}"
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5 text-center text-sm text-gray-500">
                                            No products found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Icons */}
                        {/* Right Icons — compact, no labels on desktop for clean look */}
                        <div className="flex items-center gap-4 lg:gap-5 flex-shrink-0">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="lg:hidden text-charcoal hover:text-gold transition-colors"
                            >
                                <HiOutlineSearch size={22} />
                            </button>
                            <Link href={user ? '/profile' : '/auth'} className="hidden sm:flex items-center text-charcoal hover:text-gold transition-colors" id="user-icon">
                                <HiOutlineUser size={22} />
                            </Link>
                            <Link href="/wishlist" className="flex items-center text-charcoal hover:text-gold transition-colors relative" id="wishlist-icon">
                                <HiOutlineHeart size={22} />
                            </Link>
                            <Link href="/cart" className="flex items-center text-charcoal hover:text-gold transition-colors relative" id="cart-icon">
                                <div className="relative">
                                    <HiOutlineShoppingBag size={22} />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-gold text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pincode Input Dropdown */}
                <AnimatePresence>
                    {showPincodeInput && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 border-t border-gray-100 overflow-hidden"
                        >
                            <div className="max-w-md mx-auto px-4 py-3 space-y-2">
                                <div className="flex items-center gap-3">
                                    <HiOutlineLocationMarker size={18} className="text-gold flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit delivery pincode"
                                        value={pincode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setPincode(val);
                                            setLocationStatus('idle');
                                            setLocationLabel('');
                                            localStorage.removeItem('vionara_pincode_data');
                                        }}
                                        maxLength={6}
                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
                                        autoFocus
                                    />
                                    {locationStatus === 'loading' && (
                                        <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin flex-shrink-0" />
                                    )}
                                    {locationStatus !== 'loading' && (
                                        <button
                                            onClick={() => setShowPincodeInput(false)}
                                            className="text-xs font-medium uppercase tracking-wider text-gold hover:text-gold-dark transition-colors flex-shrink-0"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                                {/* Status feedback */}
                                {locationStatus === 'loading' && (
                                    <p className="text-xs text-gray-400 pl-7 animate-pulse">Fetching location...</p>
                                )}
                                {locationStatus === 'success' && locationLabel && (
                                    <p className="text-xs text-green-600 font-medium pl-7">📍 {pincode} → {locationLabel}</p>
                                )}
                                {locationStatus === 'error' && (
                                    <p className="text-xs text-red-500 pl-7">Invalid pincode — please check and try again</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Navigation Menu ─── */}
                <nav className="hidden lg:block border-t border-[#e5dfd5]">
                    <div className="max-w-[1520px] mx-auto px-4">
                        <div className="flex items-center justify-center gap-9 h-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    className="text-[12px] tracking-[0.08em] uppercase text-gray-600 hover:text-charcoal transition-colors font-normal relative after:absolute after:bottom-[-12px] after:left-0 after:w-0 after:h-[1.5px] after:bg-charcoal hover:after:w-full after:transition-all after:duration-300"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* ─── Mobile Search Dropdown ─── */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 py-3">
                                <div className="pill-search">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearch}
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setShowImageSearch(true);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gold transition-colors"
                                        >
                                            <HiOutlineCamera size={20} />
                                        </button>
                                        <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]); }}>
                                            <HiOutlineX size={18} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Mobile Menu ─── */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-0 top-[100px] bg-white z-50 lg:hidden overflow-y-auto"
                        >
                            <div className="px-6 py-6 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.path}
                                        className="block text-sm tracking-wider uppercase py-3.5 border-b border-gray-100 text-charcoal hover:text-gold transition-colors font-medium pl-3 border-l-2 border-l-transparent hover:border-l-gold"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="pt-4 space-y-3">
                                    <Link href="/wishlist" className="block text-sm tracking-wider uppercase py-3.5 border-b border-gray-100 pl-3 text-gray-600 hover:text-gold">
                                        Wishlist
                                    </Link>
                                    <Link href={user ? '/profile' : '/auth'} className="block text-sm tracking-wider uppercase py-3.5 border-b border-gray-100 pl-3 text-gray-600 hover:text-gold">
                                        {user ? 'My Account' : 'Login / Signup'}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>

        {/* Spacer to prevent content from hiding behind fixed header */}
        <div className="h-[120px] lg:h-[148px]" />

        <ImageSearchDrawer 
            isOpen={showImageSearch} 
            onClose={() => setShowImageSearch(false)} 
        />
    </>
    );
};

export default Navbar;
