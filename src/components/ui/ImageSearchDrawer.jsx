import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineCamera,
    HiOutlineUpload,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlinePhotograph,
} from 'react-icons/hi';
import { searchByImageApi } from '../../services/api';
import ProductCard from '../product/ProductCard';

/* ─── Jewellery ring SVG used as the empty-state illustration ─── */
const JewelIllustration = () => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 opacity-30">
        <circle cx="60" cy="70" r="32" stroke="#7a1f1f" strokeWidth="6" />
        <ellipse cx="60" cy="38" rx="16" ry="10" stroke="#7a1f1f" strokeWidth="4" />
        <path d="M44 38 L52 54 M76 38 L68 54" stroke="#7a1f1f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="38" r="5" fill="#7a1f1f" opacity="0.5" />
    </svg>
);

/* ─── Shimmer skeleton for loading state ─── */
const Shimmer = () => (
    <div className="grid grid-cols-2 gap-3 p-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════ */
/*  ImageSearchDrawer — Right-side premium sliding panel      */
/* ═══════════════════════════════════════════════════════════ */
const ImageSearchDrawer = ({ isOpen, onClose }) => {
    // 'upload' | 'preview' | 'results'
    const [view, setView] = useState('upload');
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isFallback, setIsFallback] = useState(false);

    const fileInputRef = useRef(null);
    const drawerRef = useRef(null);

    /* ── Reset on open/close ── */
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setView('upload');
                setImagePreview(null);
                setResults([]);
                setIsSearching(false);
                setErrorMsg('');
                setIsDragging(false);
                setIsFallback(false);
            }, 350); // after exit animation
        }
    }, [isOpen]);

    /* ── ESC key closes drawer ── */
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    /* ── Prevent body scroll when drawer is open ── */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* ── File validation & preview ── */
    const processFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) {
            setErrorMsg('Please upload a valid image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg('File size must not exceed 2 MB.');
            return;
        }
        setErrorMsg('');
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setView('preview');
    }, []);

    const handleFileChange = (e) => processFile(e.target.files[0]);

    /* ── Drag & Drop handlers ── */
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    /* ── Image search API call ── */
    const handleSearch = async () => {
        if (!imagePreview) return;
        setIsSearching(true);
        setErrorMsg('');
        try {
            console.log('[ImageSearchDrawer] Calling searchByImageApi with image length:', imagePreview.length);
            const res = await searchByImageApi({ image: imagePreview });
            console.log('[ImageSearchDrawer] API response:', res.data);

            if (res.data?.success) {
                const products = res.data.products || [];
                setResults(products);
                setView('results');
                setIsFallback(!!res.data.fallback);
                if (res.data.fallback) {
                    console.log('[ImageSearchDrawer] Showing fallback products:', res.data.message);
                } else {
                    console.log('[ImageSearchDrawer] AI labels found:', res.data.aiLabels);
                }
            } else {
                setErrorMsg(res.data?.message || 'Could not process the image. Please try again.');
            }
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                'Image search failed. Please ensure the API key is configured.'
            );
        } finally {
            setIsSearching(false);
        }
    };

    /* ─── Backdrop overlay variants ─── */
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    /* ─── Drawer panel variants ─── */
    const drawerVariants = {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { type: 'tween', duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
        exit: { x: '100%', transition: { type: 'tween', duration: 0.28, ease: [0.55, 0, 1, 0.45] } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[200] bg-black/45 backdrop-blur-[3px]"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* ── Drawer Panel ── */}
                    <motion.aside
                        key="drawer"
                        ref={drawerRef}
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed top-0 right-0 z-[201] h-full w-full sm:w-[430px] bg-white flex flex-col"
                        style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.14)' }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search by Image drawer"
                    >
                        {/* ══ HEADER ══ */}
                        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-100">
                            <div className="flex-1 pr-4">
                                {/* Back breadcrumb for non-upload views */}
                                {view !== 'upload' && (
                                    <button
                                        onClick={() => { setView('upload'); setImagePreview(null); setResults([]); setErrorMsg(''); }}
                                        className="flex items-center gap-1 text-[11px] tracking-widest uppercase text-[#7a1f1f]/70 hover:text-[#7a1f1f] font-medium mb-2 transition-colors"
                                    >
                                        ← Back
                                    </button>
                                )}
                                <h2
                                    className="font-heading text-[#7a1f1f] leading-snug"
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: view === 'results' ? '1.1rem' : '1.05rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {view === 'results'
                                        ? 'Similar Jewellery Found'
                                        : 'Search With A Pic And Find The Same Or Similar Jewelleries'}
                                </h2>
                                {view === 'results' && (
                                    <p className="text-xs text-gray-400 mt-1 font-light tracking-wide">
                                        Showing curations based on your image
                                    </p>
                                )}
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                id="image-search-drawer-close"
                                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#7a1f1f]/8 hover:text-[#7a1f1f] transition-all duration-200"
                                aria-label="Close drawer"
                            >
                                <HiOutlineX size={19} />
                            </button>
                        </div>

                        {/* ══ SCROLLABLE BODY ══ */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">

                            {/* ─── VIEW: Upload ─── */}
                            {view === 'upload' && (
                                <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-6">

                                    {/* Jewel illustration / drop‑zone hint */}
                                    <div className="flex flex-col items-center gap-3">
                                        <JewelIllustration />
                                        <p className="text-[13px] text-gray-400 font-light tracking-wide text-center">
                                            Upload a jewellery photo to find<br />matching or similar pieces instantly
                                        </p>
                                    </div>

                                    {/* Drag & Drop zone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 py-12 px-6 transition-all duration-300 ${
                                            isDragging
                                                ? 'border-[#7a1f1f] bg-[#7a1f1f]/5 scale-[1.01]'
                                                : 'border-gray-200 bg-gray-50/60 hover:border-[#7a1f1f]/50 hover:bg-[#7a1f1f]/3'
                                        }`}
                                    >
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isDragging
                                                    ? 'bg-[#7a1f1f]/10 scale-110'
                                                    : 'bg-white shadow-sm'
                                            }`}
                                        >
                                            <HiOutlinePhotograph
                                                size={26}
                                                className={isDragging ? 'text-[#7a1f1f]' : 'text-gray-400'}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-medium text-gray-600">
                                                {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
                                            </p>
                                            <p className="text-[12px] text-gray-400 mt-0.5">or click to browse</p>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-[11px] text-gray-400 tracking-widest uppercase">or</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>

                                    {/* Upload Pic button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        id="image-search-upload-btn"
                                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full border border-[#7a1f1f] text-[#7a1f1f] text-[13px] font-medium tracking-wide hover:bg-[#7a1f1f] hover:text-white transition-all duration-300 group"
                                    >
                                        <HiOutlineUpload
                                            size={17}
                                            className="group-hover:scale-110 transition-transform duration-300"
                                        />
                                        Upload Pic
                                    </button>

                                    {/* Helper text */}
                                    <p className="text-[11.5px] text-gray-400 text-center -mt-2">
                                        The file size should not exceed&nbsp;<strong className="font-medium text-gray-500">2 MB</strong>
                                    </p>

                                    {/* Error message */}
                                    {errorMsg && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[12px] text-red-500 text-center -mt-2"
                                        >
                                            {errorMsg}
                                        </motion.p>
                                    )}

                                    {/* Tips */}
                                    <div className="w-full rounded-xl border border-gray-100 bg-[#fdf9f4] px-5 py-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7a1f1f]/70 mb-2.5">
                                            Tips for better results
                                        </p>
                                        {[
                                            'Use a clear, well-lit photo',
                                            'Focus on a single piece of jewellery',
                                            'Avoid busy backgrounds',
                                        ].map((tip) => (
                                            <div key={tip} className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[#7a1f1f]/50 text-[10px]">✦</span>
                                                <span className="text-[12px] text-gray-500">{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── VIEW: Preview ─── */}
                            {view === 'preview' && (
                                <div className="flex flex-col items-center px-6 pt-8 pb-8 gap-6">

                                    {/* Image Preview */}
                                    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-md group">
                                        <img
                                            src={imagePreview}
                                            alt="Selected jewellery"
                                            className="w-full object-cover max-h-72 transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                        {/* Change image overlay button */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#7a1f1f] text-[11px] font-medium rounded-full px-3 py-1.5 shadow-sm hover:bg-white transition-all duration-200"
                                        >
                                            <HiOutlineRefresh size={13} />
                                            Change
                                        </button>
                                        {/* Ready badge */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-green-600 text-[11px] font-semibold rounded-full px-3 py-1.5 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                            Image ready
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    {/* Error */}
                                    {errorMsg && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[12px] text-red-500 text-center w-full"
                                        >
                                            {errorMsg}
                                        </motion.p>
                                    )}

                                    {/* Search button */}
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        id="image-search-submit-btn"
                                        className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-[13px] font-semibold tracking-widest uppercase transition-all duration-300 shadow-md ${
                                            isSearching
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                                : 'bg-[#7a1f1f] text-white hover:bg-[#5e1818] hover:shadow-lg hover:shadow-[#7a1f1f]/25 active:scale-[0.98]'
                                        }`}
                                    >
                                        {isSearching ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                                Analysing Image…
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineSearch size={16} />
                                                Find Similar Jewellery
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => { setView('upload'); setImagePreview(null); setErrorMsg(''); }}
                                        disabled={isSearching}
                                        className="text-[12px] font-medium text-gray-400 hover:text-[#7a1f1f] transition-colors tracking-wide"
                                    >
                                        Choose a different image
                                    </button>
                                </div>
                            )}

                            {/* ─── VIEW: Results ─── */}
                            {view === 'results' && (
                                <div className="flex flex-col">
                                    {/* Reference image strip */}
                                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-[#fdf9f4]">
                                        <img
                                            src={imagePreview}
                                            alt="Reference"
                                            className="w-11 h-11 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] text-gray-400 font-light">
                                                {isFallback ? 'Showing popular jewellery' : 'Your reference image'}
                                            </p>
                                            <p className="text-[13px] font-medium text-charcoal truncate">
                                                {results.length} {isFallback ? 'popular' : 'similar'} {results.length === 1 ? 'piece' : 'pieces'} {isFallback ? '' : 'found'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => { setView('upload'); setImagePreview(null); setResults([]); }}
                                            className="text-[11px] font-semibold tracking-widest uppercase text-[#7a1f1f] hover:underline flex-shrink-0"
                                        >
                                            New Search
                                        </button>
                                    </div>

                                    {/* Products grid */}
                                    {results.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 p-4">
                                            {results.map((product, index) => (
                                                <div
                                                    key={product._id}
                                                    onClick={onClose}
                                                    className="cursor-pointer"
                                                >
                                                    <ProductCard product={product} index={index} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
                                            <JewelIllustration />
                                            <p className="text-[13px] text-gray-400 text-center font-light">
                                                No matching jewellery found.<br />Try a clearer or closer image.
                                            </p>
                                            <button
                                                onClick={() => { setView('upload'); setImagePreview(null); }}
                                                className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#7a1f1f] hover:underline"
                                            >
                                                <HiOutlineRefresh size={14} />
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ══ FOOTER BRANDING ══ */}
                        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-center gap-1.5">
                            <span className="text-[10px] tracking-widest uppercase text-gray-300 font-light">
                                Visual Search powered by
                            </span>
                            <span
                                className="text-[10px] tracking-widest uppercase font-semibold"
                                style={{ color: '#7a1f1f', opacity: 0.5, fontFamily: "'Playfair Display', serif" }}
                            >
                                Vionara AI
                            </span>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default ImageSearchDrawer;
