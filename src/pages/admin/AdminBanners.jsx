import { useState, useEffect, useRef } from 'react';
import { HiOutlineUpload, HiOutlinePhotograph, HiOutlineCheck, HiOutlineTrash, HiOutlinePlus, HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineSave, HiOutlineEye } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { uploadImages, getHeroSetting, updateHeroSlides } from '@/services/api';

// ── Default slides using local images ─────────────────────────────────────
const DEFAULT_HERO_SLIDES = [
    { title: 'THE ART OF\nFINE JEWELLERY', subtitle: 'Exploring the intersection of luxury and craftsmanship', buttonText: 'Discover the Collection', buttonLink: '/shop', image: '/src/assets/images/hero-banner.png' },
    { title: 'CRAFTED FOR\nEVERY MOMENT', subtitle: 'Where timeless elegance meets modern design', buttonText: 'Shop Now', buttonLink: '/shop', image: '/src/assets/images/hero-2.png' },
    { title: 'WEAR YOUR\nSTORY', subtitle: 'Fine jewellery that speaks without words', buttonText: 'Explore Now', buttonLink: '/shop', image: '/src/assets/images/hero-3.png' },
    { title: 'GIFTED WITH\nGRACE', subtitle: 'Thoughtfully curated pieces for someone special', buttonText: 'View Gifts', buttonLink: '/shop', image: '/src/assets/images/hero-4.png' },
    { title: 'PREMIUM\nCOLLECTION', subtitle: 'The finest craftsmanship, exclusively at Vionara', buttonText: 'Shop Premium', buttonLink: '/shop', image: '/src/assets/images/hero-premium.png' },
];

// ── Shared InputField ──────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder = '' }) => (
    <div className="w-full">
        <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 block font-bold">{label}</label>
        <div className="relative group">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-[13px] outline-none focus:border-gold focus:bg-white rounded-xl transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            </div>
        </div>
    </div>
);

// ── Hero Slide Card ────────────────────────────────────────────────────────
const SlideCard = ({ slide, index, total, onUpdate, onRemove, onMove, onUploadImage }) => {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const isOnly = total <= 1;

    const handleFile = async (file) => {
        if (!file) return;
        if (!file.type.match('image/(jpeg|jpg|png|webp|gif)')) { toast.error('Only JPG, PNG, WebP or GIF images allowed'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        setUploading(true);
        try { await onUploadImage(index, file); } finally { setUploading(false); }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-charcoal to-gray-800 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-[11px] font-extrabold">{index + 1}</span>
                    <span className="text-white/80 text-[11px] font-bold uppercase tracking-[0.15em]">Slide {index + 1}</span>
                    {slide.image && <span className="text-[9px] text-green-400 font-semibold uppercase tracking-wider bg-green-400/10 px-2 py-0.5 rounded-full">Image Set</span>}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/10" title="Move Up">
                        <HiOutlineChevronUp size={16} />
                    </button>
                    <button onClick={() => onMove(index, 'down')} disabled={index === total - 1} className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/10" title="Move Down">
                        <HiOutlineChevronDown size={16} />
                    </button>
                    <button
                        onClick={() => { if (isOnly) { toast.error('At least 1 slide is required'); return; } onRemove(index); }}
                        className={`ml-1 p-1.5 rounded-lg transition-all ${isOnly ? 'text-white/20 cursor-not-allowed' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
                        title={isOnly ? 'Minimum 1 slide required' : 'Delete slide'}
                    >
                        <HiOutlineTrash size={16} />
                    </button>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Image */}
                    <div className="w-full lg:w-[38%] space-y-3">
                        <div
                            className="relative group aspect-[16/9] bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-gold/40 transition-colors cursor-pointer"
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                        >
                            {slide.image ? (
                                <>
                                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <HiOutlineUpload size={22} className="text-white" />
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Replace Image</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                                    <HiOutlinePhotograph size={40} strokeWidth={1} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Click or drag to upload</span>
                                    <span className="text-[9px] text-gray-300">Max 5MB · JPG, PNG, WebP</span>
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                                    <div className="w-7 h-7 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Uploading...</span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className="text-[8px] text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">16:9</span>
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                        <InputField
                            label="Or paste image URL"
                            value={slide.image}
                            onChange={(e) => onUpdate(index, 'image', e.target.value)}
                            placeholder="https://..."
                        />
                        {slide.image && (
                            <button onClick={() => onUpdate(index, 'image', '')} className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                                <HiOutlineTrash size={12} /> Remove image
                            </button>
                        )}
                    </div>

                    {/* Right: Text Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <InputField
                                label="Main Title / Heading"
                                value={slide.title}
                                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                                placeholder="THE ART OF FINE JEWELLERY"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <InputField
                                label="Subtitle / Description"
                                value={slide.subtitle}
                                onChange={(e) => onUpdate(index, 'subtitle', e.target.value)}
                                placeholder="Brief description here..."
                            />
                        </div>
                        <InputField
                            label="Button Text"
                            value={slide.buttonText}
                            onChange={(e) => onUpdate(index, 'buttonText', e.target.value)}
                            placeholder="Shop Now"
                        />
                        <InputField
                            label="Button Link"
                            value={slide.buttonLink}
                            onChange={(e) => onUpdate(index, 'buttonLink', e.target.value)}
                            placeholder="/shop"
                        />

                        {/* Mini live preview strip */}
                        {slide.image && (
                            <div className="md:col-span-2">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5"><HiOutlineEye size={12} /> Preview</p>
                                <div className="relative rounded-xl overflow-hidden aspect-[21/6] bg-charcoal">
                                    <img src={slide.image} alt="" className="w-full h-full object-cover opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/30 to-black/60" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                        <p className="text-white text-[11px] font-heading italic leading-tight line-clamp-2">{slide.title || 'Slide Title'}</p>
                                        <p className="text-white/60 text-[9px] mt-1 line-clamp-1">{slide.subtitle || 'Subtitle here'}</p>
                                        {slide.buttonText && (
                                            <span className="mt-1.5 text-[8px] text-white border-b border-white/40 pb-0.5 uppercase tracking-widest">{slide.buttonText}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Hero Slides Manager ────────────────────────────────────────────────────
const HeroSlidesManager = ({ slides, setSlides }) => {
    const [saving, setSaving] = useState(false);

    const addSlide = () => {
        setSlides(prev => [...prev, { title: 'NEW COLLECTION', subtitle: 'Discover the latest in luxury', buttonText: 'Shop Now', buttonLink: '/shop', image: '' }]);
    };

    const removeSlide = (index) => {
        setSlides(prev => prev.filter((_, i) => i !== index));
    };

    const updateSlide = (index, field, value) => {
        setSlides(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const moveSlide = (index, direction) => {
        setSlides(prev => {
            const arr = [...prev];
            const swapIdx = direction === 'up' ? index - 1 : index + 1;
            if (swapIdx < 0 || swapIdx >= arr.length) return arr;
            [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
            return arr;
        });
    };

    const handleImageUpload = async (index, file) => {
        const formData = new FormData();
        formData.append('images', file);
        const res = await uploadImages(formData);
        if (res.data.success && res.data.urls?.length) {
            updateSlide(index, 'image', res.data.urls[0]);
            toast.success('Image uploaded');
        } else {
            toast.error('Upload failed');
        }
    };

    const handleSave = async () => {
        if (slides.length === 0) { toast.error('Add at least 1 slide before saving'); return; }
        setSaving(true);
        try {
            const { data } = await updateHeroSlides(slides);
            if (data.success) toast.success('Hero slides saved successfully!');
            else toast.error(data.message || 'Save failed');
        } catch (err) {
            toast.error('Failed to save hero slides');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-0">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-charcoal">Hero Banner Manager</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Full control over homepage hero slides — images, text, order
                        <span className="ml-2 text-gold font-semibold">(minimum 1 slide)</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 font-semibold">{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
                    <button
                        onClick={addSlide}
                        className="flex items-center gap-2 px-5 py-2.5 bg-charcoal hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                        <HiOutlinePlus size={16} /> Add Slide
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-yellow-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineSave size={16} />}
                        {saving ? 'Saving...' : 'Save Hero Slides'}
                    </button>
                </div>
            </div>

            {/* Slides List */}
            <AnimatePresence mode="popLayout">
                {slides.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl p-16 text-center">
                        <HiOutlinePhotograph size={48} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
                        <p className="text-gray-400 font-medium">No slides yet.</p>
                        <p className="text-gray-300 text-sm mt-1">Click <b>Add Slide</b> to build your hero carousel.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {slides.map((slide, index) => (
                            <SlideCard
                                key={index}
                                slide={slide}
                                index={index}
                                total={slides.length}
                                onUpdate={updateSlide}
                                onRemove={removeSlide}
                                onMove={moveSlide}
                                onUploadImage={handleImageUpload}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Save Bar */}
            {slides.length > 0 && (
                <div className="mt-8 flex items-center justify-between bg-charcoal/5 border border-charcoal/10 rounded-2xl px-6 py-4">
                    <p className="text-sm text-gray-500">{slides.length} slide{slides.length !== 1 ? 's' : ''} ready to publish</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2.5 px-8 py-3 bg-charcoal hover:bg-gold text-white rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:scale-95 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlineCheck size={18} />}
                        {saving ? 'Publishing...' : 'Publish Hero Slides'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main AdminBanners Page ─────────────────────────────────────────────────
const AdminBanners = () => {
    const [fetching, setFetching] = useState(true);
    const [heroSlides, setHeroSlides] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const heroRes = await getHeroSetting();
                const slides = heroRes.data.heroSlides;
                setHeroSlides(slides?.length > 0 ? slides : DEFAULT_HERO_SLIDES);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load hero slides');
                setHeroSlides(DEFAULT_HERO_SLIDES);
            } finally {
                setFetching(false);
            }
        };
        fetchAll();
    }, []);

    if (fetching) {
        return (
            <div className="w-full">
                <div className="flex flex-col justify-center items-center h-96 gap-4">
                    <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                    <span className="text-xs text-gray-400 font-medium animate-pulse">Initializing...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="max-w-5xl pb-32">
                <HeroSlidesManager slides={heroSlides} setSlides={setHeroSlides} />
            </div>
        </div>
    );
};

export default AdminBanners;
