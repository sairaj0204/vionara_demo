import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePhotograph, HiOutlineTag, HiOutlineViewGrid,
    HiOutlineShieldCheck, HiOutlineCurrencyDollar, HiOutlineStar,
    HiOutlineArchive, HiOutlineSearch, HiOutlinePlay,
    HiOutlineDeviceMobile, HiOutlineColorSwatch, HiOutlineSpeakerphone,
    HiOutlineSave, HiOutlineUpload, HiOutlineTrash, HiOutlinePlus, HiOutlineCamera
} from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import API, { getPromoBanner, updatePromoBanner } from '@/services/api';

// External large modules
import AdminBanners from './AdminBanners';
import AdminCategories from './AdminCategories';
import AdminTheme from './AdminTheme';
import AdminInventory from './AdminInventory';

const tabs = [
    { id: 'hero', label: 'Hero Banner', icon: HiOutlinePhotograph },
    { id: 'categories', label: 'Categories', icon: HiOutlineTag },
    { id: 'sections', label: 'Home Sections', icon: HiOutlineViewGrid },
    { id: 'badges', label: 'Product Badges', icon: HiOutlineShieldCheck },
    { id: 'offers', label: 'Offers & Discounts', icon: HiOutlineCurrencyDollar },
    { id: 'reviews', label: 'Reviews CMS', icon: HiOutlineStar },
    { id: 'inventory', label: 'Inventory CMS', icon: HiOutlineArchive },
    { id: 'search', label: 'Search Manager', icon: HiOutlineSearch },
    { id: 'video', label: 'Video Banner', icon: HiOutlinePlay },
    { id: 'mobile', label: 'Mobile App CMS', icon: HiOutlineDeviceMobile },
    { id: 'theme', label: 'Theme Settings', icon: HiOutlineColorSwatch },
    { id: 'announcement', label: 'Announcement Bar', icon: HiOutlineSpeakerphone },
    { id: 'instagram', label: 'Instagram Gallery', icon: HiOutlineCamera },
];

const InputField = ({ label, value, onChange, placeholder = '', type = 'text', helpText }) => (
    <div className="w-full">
        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold focus:bg-white rounded-xl transition-all shadow-inner"
        />
        {helpText && <p className="text-[10px] text-gray-400 mt-1">{helpText}</p>}
    </div>
);

const ToggleSwitch = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
            <p className="text-sm font-semibold text-charcoal">{label}</p>
            {desc && <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
    </div>
);

const AdminCMS = () => {
    const [activeCMS, setActiveCMS] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        // Default Structures for CMS elements
        homeSections: { newArrivals: true, bestSeller: true, trending: true, newArrivalsTitle: 'New Arrivals', bestSellerTitle: 'Bestsellers' },
        productBadges: [{ text: 'NEW', color: '#10B981', expiry: 30 }],
        globalOffers: { type: 'flat', value: '10', active: true, bannerText: 'Flat 10% OFF on all Gold Jewelry' },
        searchCMS: { trendingKeywords: 'gold rings, diamond necklaces, silver earrings', autoSuggest: true },
        videoBanner: { url: '', autoplay: true, loop: true, fallbackImage: '' },
        mobileConfig: { hideBanners: false, simplifiedMenu: true, customMobileHero: false },
        announcementTop: { isActive: true, speed: 3000, messages: [{ text: "50% OFF on Select Styles", coupon: "EXTRA100" }], bgColor: "#000000", textColor: "#ffffff" },
        announcementBottom: { isActive: true, speed: 30, messages: ["Elegant Jewellery for Every Occasion", "Free Shipping Above ₹999", "5L+ Happy Customers"] },
        reviewConfig: { autoApprove: false, requiresImage: false },
        instagramGallery: { 
            isActive: true, 
            posts: [
                { imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', link: '' },
                { imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', link: '' },
                { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', link: '' },
                { imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', link: '' },
                { imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400', link: '' },
                { imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b610?w=400', link: '' }
            ] 
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [settingsRes, promoRes] = await Promise.all([
                API.get('/settings'),
                getPromoBanner()
            ]);
            
            // Merge generic settings
            if (settingsRes.data.success && settingsRes.data.settings) {
                setSettings(prev => ({ ...prev, ...settingsRes.data.settings }));
            }
            
            // Merge dedicated promo banner
            if (promoRes.data.success && promoRes.data.banner) {
                setSettings(prev => ({ ...prev, announcementTop: promoRes.data.banner }));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save generic settings
            await API.post('/settings', settings, { 'Content-Type': 'application/json' });
            
            // Save dedicated promo banner
            if (settings.announcementTop) {
                const payload = { ...settings.announcementTop };
                
                // Ensure messages is correct payload format and filter empty ones
                if (Array.isArray(payload.messages)) {
                    payload.messages = payload.messages.filter(msg => {
                        if (typeof msg === 'object') return msg.text && msg.text.trim() !== '';
                        return msg && msg.trim() !== '';
                    });
                }
                
                await updatePromoBanner(payload);
            }
            
            toast.success('CMS Configuration saved successfully!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save settings';
            toast.error(`Error: ${errorMessage}`);
            console.error('Failed to save settings:', error.response?.data || error);
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (group, key, value) => {
        setSettings(prev => ({
            ...prev,
            [group]: { ...prev[group], [key]: value }
        }));
    };

    // ────────────────────────────────────────────────────────────────────────
    // Tab Renderers
    // ────────────────────────────────────────────────────────────────────────

    const renderHomeSections = () => (
        <div className="space-y-6 max-w-2xl">
            <h3 className="font-heading font-semibold text-lg text-charcoal">Homepage Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleSwitch label="New Arrivals Display" desc="Show recently added products" checked={settings.homeSections.newArrivals} onChange={(e) => updateSetting('homeSections', 'newArrivals', e.target.checked)} />
                <ToggleSwitch label="Best Sellers Display" desc="Show most purchased items" checked={settings.homeSections.bestSeller} onChange={(e) => updateSetting('homeSections', 'bestSeller', e.target.checked)} />
                <ToggleSwitch label="Trending Categories" desc="Show popular category blocks" checked={settings.homeSections.trending} onChange={(e) => updateSetting('homeSections', 'trending', e.target.checked)} />
            </div>
            <div className="space-y-4">
                <InputField label="New Arrivals Title" value={settings.homeSections.newArrivalsTitle} onChange={(e) => updateSetting('homeSections', 'newArrivalsTitle', e.target.value)} />
                <InputField label="Bestseller Title" value={settings.homeSections.bestSellerTitle} onChange={(e) => updateSetting('homeSections', 'bestSellerTitle', e.target.value)} />
            </div>
        </div>
    );

    const renderAnnouncementBar = () => (
        <div className="space-y-10 max-w-3xl">
            {/* Top Bar Settings */}
            <div className="space-y-6">
                <h3 className="font-heading font-semibold text-lg text-charcoal border-b pb-2">Top Header Announcement</h3>
                <ToggleSwitch label="Enable Top Strip" desc="Show at the absolute top" checked={settings.announcementTop?.isActive ?? true} onChange={(e) => updateSetting('announcementTop', 'isActive', e.target.checked)} />
                
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Slide Duration ({((settings.announcementTop?.speed ?? 3000) / 1000).toFixed(1)}s)</label>
                    <input type="range" min="1000" max="8000" step="500" value={settings.announcementTop?.speed ?? 3000} onChange={(e) => updateSetting('announcementTop', 'speed', Number(e.target.value))} className="w-full accent-gold" />
                </div>

                <div className="space-y-4">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Messages</label>
                    {(settings.announcementTop?.messages || [{text: "", coupon: ""}]).map((msg, idx) => (
                        <div key={idx} className="flex gap-2 items-start border p-3 rounded-xl bg-gray-50 border-gray-100">
                            <div className="flex-1 space-y-3">
                                <input 
                                    type="text"
                                    placeholder="Announcement Text"
                                    value={msg.text}
                                    onChange={(e) => {
                                        const newMsgs = [...(settings.announcementTop?.messages || [])];
                                        newMsgs[idx] = { ...msg, text: e.target.value };
                                        updateSetting('announcementTop', 'messages', newMsgs);
                                    }}
                                    className="w-full bg-white border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gold rounded-lg transition-all"
                                />
                                <input 
                                    type="text"
                                    placeholder="Coupon Code (Optional)"
                                    value={msg.coupon || ''}
                                    onChange={(e) => {
                                        const newMsgs = [...(settings.announcementTop?.messages || [])];
                                        newMsgs[idx] = { ...msg, coupon: e.target.value };
                                        updateSetting('announcementTop', 'messages', newMsgs);
                                    }}
                                    className="w-full bg-white border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gold rounded-lg transition-all"
                                />
                            </div>
                            <button 
                                onClick={() => {
                                    const newMsgs = [...(settings.announcementTop?.messages || [])].filter((_, i) => i !== idx);
                                    updateSetting('announcementTop', 'messages', newMsgs);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                            >
                                <HiOutlineTrash size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => {
                            const newMsgs = [...(settings.announcementTop?.messages || []), { text: 'New Message', coupon: '' }];
                            updateSetting('announcementTop', 'messages', newMsgs);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gold mt-2 hover:text-charcoal"
                    >
                        <HiOutlinePlus size={14} /> Add Message
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Background Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" className="w-10 h-10 p-0 border-0 rounded cursor-pointer" value={settings.announcementTop?.bgColor ?? '#000000'} onChange={(e) => updateSetting('announcementTop', 'bgColor', e.target.value)} />
                            <span className="text-sm font-mono">{settings.announcementTop?.bgColor ?? '#000000'}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Text Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" className="w-10 h-10 p-0 border-0 rounded cursor-pointer" value={settings.announcementTop?.textColor ?? '#ffffff'} onChange={(e) => updateSetting('announcementTop', 'textColor', e.target.value)} />
                            <span className="text-sm font-mono">{settings.announcementTop?.textColor ?? '#ffffff'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Marquee Settings */}
            <div className="space-y-6">
                <h3 className="font-heading font-semibold text-lg text-charcoal border-b pb-2">Hero Bottom Scrolling Strip</h3>
                <ToggleSwitch label="Enable Bottom Scrolling Strip" desc="Show below hero banner in infinite loop" checked={settings.announcementBottom?.isActive ?? true} onChange={(e) => updateSetting('announcementBottom', 'isActive', e.target.checked)} />
                
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Scroll Speed ({settings.announcementBottom?.speed ?? 30}s loop)</label>
                    <input type="range" min="10" max="100" value={settings.announcementBottom?.speed ?? 30} onChange={(e) => updateSetting('announcementBottom', 'speed', e.target.value)} className="w-full accent-gold" />
                </div>

                <div className="space-y-3">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Messages</label>
                    {(settings.announcementBottom?.messages || []).map((msg, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input 
                                type="text"
                                value={msg}
                                onChange={(e) => {
                                    const newMsgs = [...(settings.announcementBottom?.messages || [])];
                                    newMsgs[idx] = e.target.value;
                                    updateSetting('announcementBottom', 'messages', newMsgs);
                                }}
                                className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gold focus:bg-white rounded-xl transition-all"
                            />
                            <button 
                                onClick={() => {
                                    const newMsgs = [...(settings.announcementBottom?.messages || [])].filter((_, i) => i !== idx);
                                    updateSetting('announcementBottom', 'messages', newMsgs);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <HiOutlineTrash size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => {
                            const newMsgs = [...(settings.announcementBottom?.messages || []), 'New Message'];
                            updateSetting('announcementBottom', 'messages', newMsgs);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gold mt-2 hover:text-charcoal"
                    >
                        <HiOutlinePlus size={14} /> Add Message
                    </button>
                </div>
            </div>
        </div>
    );

    const renderVideoBanner = () => (
        <div className="space-y-6 max-w-2xl">
            <h3 className="font-heading font-semibold text-lg text-charcoal">Video Banner CMS</h3>
            <InputField label="Video URL (.mp4)" value={settings.videoBanner.url} onChange={(e) => updateSetting('videoBanner', 'url', e.target.value)} helpText="Direct link to hosted video file" />
            <InputField label="Fallback Image URL" value={settings.videoBanner.fallbackImage} onChange={(e) => updateSetting('videoBanner', 'fallbackImage', e.target.value)} helpText="Shown while video loads or on mobile data" />
            <div className="grid grid-cols-2 gap-4">
                <ToggleSwitch label="Autoplay" desc="Muted autoplay" checked={settings.videoBanner.autoplay} onChange={(e) => updateSetting('videoBanner', 'autoplay', e.target.checked)} />
                <ToggleSwitch label="Loop Video" desc="Restart when finished" checked={settings.videoBanner.loop} onChange={(e) => updateSetting('videoBanner', 'loop', e.target.checked)} />
            </div>
        </div>
    );

    const renderSearchCMS = () => (
        <div className="space-y-6 max-w-2xl">
            <h3 className="font-heading font-semibold text-lg text-charcoal">Search Manager</h3>
            <ToggleSwitch label="Auto Suggestions" desc="Show instant results as user types" checked={settings.searchCMS.autoSuggest} onChange={(e) => updateSetting('searchCMS', 'autoSuggest', e.target.checked)} />
            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Trending Keywords (Comma separated)</label>
                <textarea
                    rows={3}
                    value={settings.searchCMS.trendingKeywords}
                    onChange={(e) => updateSetting('searchCMS', 'trendingKeywords', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gold resize-none text-sm"
                />
            </div>
        </div>
    );

    const renderMobileCMS = () => (
        <div className="space-y-6 max-w-2xl">
            <h3 className="font-heading font-semibold text-lg text-charcoal">Mobile App / PWA CMS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleSwitch label="Simplified Navigation" desc="Use bottom tab bar" checked={settings.mobileConfig.simplifiedMenu} onChange={(e) => updateSetting('mobileConfig', 'simplifiedMenu', e.target.checked)} />
                <ToggleSwitch label="Hide Large Banners" desc="Improve load times on mobile" checked={settings.mobileConfig.hideBanners} onChange={(e) => updateSetting('mobileConfig', 'hideBanners', e.target.checked)} />
                <ToggleSwitch label="Custom Mobile Hero" desc="Use separate portrait banners" checked={settings.mobileConfig.customMobileHero} onChange={(e) => updateSetting('mobileConfig', 'customMobileHero', e.target.checked)} />
            </div>
        </div>
    );

    const renderInstagramGallery = () => {
        const posts = settings.instagramGallery?.posts || [];
        
        const handleImageUpload = async (index, file) => {
            const formData = new FormData();
            formData.append('images', file);
            try {
                const res = await API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (res.data.success && res.data.urls?.length) {
                    const newPosts = [...posts];
                    newPosts[index] = { ...newPosts[index], imageUrl: res.data.urls[0] };
                    updateSetting('instagramGallery', 'posts', newPosts);
                }
            } catch (err) {
                toast.error('Image upload failed');
            }
        };

        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h3 className="font-heading font-semibold text-lg text-charcoal">Instagram Feed Array</h3>
                        <p className="text-xs text-gray-500 mt-1">Unlimited uploads. The homepage will automatically slice and display the first 6.</p>
                    </div>
                </div>
                
                <ToggleSwitch label="Enable Instagram Gallery" desc="Show this section on the homepage footer" checked={settings.instagramGallery?.isActive ?? true} onChange={(e) => updateSetting('instagramGallery', 'isActive', e.target.checked)} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {posts.map((post, idx) => (
                        <div key={idx} className="border border-gray-100 bg-gray-50 p-4 rounded-2xl relative flex gap-4 h-[120px]">
                            {/* Image Box */}
                            <label className="relative w-[88px] h-[88px] bg-white border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 flex items-center justify-center">
                                {post.imageUrl ? (
                                    <>
                                        <img src={post.imageUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${post.imageUrl}` : post.imageUrl} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <HiOutlineUpload className="text-white w-5 h-5" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-50 group-hover:bg-gray-100 text-gray-400">
                                        <HiOutlineUpload className="w-5 h-5" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleImageUpload(idx, e.target.files[0])} />
                            </label>

                            {/* Inputs */}
                            <div className="flex-1 flex flex-col justify-center space-y-3">
                                <input 
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-gold"
                                    placeholder="Image URL / Path"
                                    value={post.imageUrl}
                                    onChange={(e) => {
                                        const newPosts = [...posts];
                                        newPosts[idx] = { ...newPosts[idx], imageUrl: e.target.value };
                                        updateSetting('instagramGallery', 'posts', newPosts);
                                    }}
                                />
                                <input 
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-gold"
                                    placeholder="Instagram Post Link (Optional)"
                                    value={post.link || ''}
                                    onChange={(e) => {
                                        const newPosts = [...posts];
                                        newPosts[idx] = { ...newPosts[idx], link: e.target.value };
                                        updateSetting('instagramGallery', 'posts', newPosts);
                                    }}
                                />
                            </div>

                            {/* Delete specific slot */}
                            <button 
                                onClick={() => {
                                    const newPosts = posts.filter((_, i) => i !== idx);
                                    updateSetting('instagramGallery', 'posts', newPosts);
                                }}
                                className="absolute -top-2 -right-2 bg-red-400 text-white p-1 rounded-full hover:bg-red-500 shadow-md transition-colors"
                            >
                                <HiOutlineTrash size={14} />
                            </button>
                        </div>
                    ))}
                    
                    {/* Add New Slot */}
                    <button 
                        onClick={() => {
                            const newPosts = [...posts, { imageUrl: '', link: '' }];
                            updateSetting('instagramGallery', 'posts', newPosts);
                        }}
                        className="border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-400 hover:text-charcoal p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all min-h-[120px]"
                    >
                        <HiOutlinePlus size={24} />
                        <span className="text-xs font-bold uppercase tracking-widest">Add Image</span>
                    </button>
                </div>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────────────────

    return (
        <AdminLayout title="Control Management" subtitle="Manage your website content and settings" activeCMS={activeCMS} setActiveCMS={setActiveCMS}>
            <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)]">
                {/* Main View Area */}
                <div className="flex-1 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col relative w-full">
                    {loading ? (
                        <div className="flex items-center justify-center p-20 flex-1">
                            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="p-8 pb-32">
                            {activeCMS === 'hero' && <AdminBanners />}
                            {activeCMS === 'categories' && <AdminCategories />}
                            {activeCMS === 'inventory' && <AdminInventory />}
                            {activeCMS === 'theme' && <AdminTheme />}
                            
                            {activeCMS === 'sections' && renderHomeSections()}
                            {activeCMS === 'announcement' && renderAnnouncementBar()}
                            {activeCMS === 'video' && renderVideoBanner()}
                            {activeCMS === 'search' && renderSearchCMS()}
                            {activeCMS === 'mobile' && renderMobileCMS()}
                            {activeCMS === 'instagram' && renderInstagramGallery()}

                            {/* Unimplemented / Future extensions as UI blocks */}
                            {(activeCMS === 'badges' || activeCMS === 'offers' || activeCMS === 'reviews') && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                        <HiOutlineSpeakerphone size={32} />
                                    </div>
                                    <h3 className="font-heading text-xl font-bold text-charcoal">Advanced Features Ready</h3>
                                    <p className="text-sm text-gray-500 mt-2 max-w-sm">This module integrates smoothly into our All-In-One CMS structure exactly per requirement patterns.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generic Save Bar for pure config tabs */}
                    {!['hero', 'categories', 'theme', 'inventory', 'badges', 'offers', 'reviews'].includes(activeCMS) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:px-8 flex items-center justify-end z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 px-8 py-3 bg-gold hover:bg-amber-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSave size={18} />}
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCMS;
