import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCamera, HiOutlineUpload, HiOutlineX, HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi';
import { searchByImageApi } from '../../services/api';
import ProductCard from '../product/ProductCard';

const PLACEHOLDER_IMAGE = "/default-girl.jpg";

const ImageSearchModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('options'); // 'options', 'camera', 'preview', 'results'
    const [imagePreview, setImagePreview] = useState(null);
    const [stream, setStream] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    // Reset state when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            setView('options');
            setImagePreview(null);
            setResults([]);
            setIsSearching(false);
            stopCamera();
        }
    }, [isOpen]);

    // Handle camera lifecycle
    useEffect(() => {
        if (view === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [view]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please try uploading an image instead.');
            setView('options');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(imageUrl);
        setView('preview');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setView('preview');
        }
    };

    const handleSearch = async () => {
        if (!imagePreview) return;
        setIsSearching(true);
        try {
            const res = await searchByImageApi({ image: imagePreview });
            if (res.data?.success) {
                setResults(res.data.products || []);
                setView('results');
            } else {
                alert(res.data?.message || 'Error occurred while searching.');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert(error.response?.data?.message || 'Failed to search by image. Please ensure API key is configured.');
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 z-10 bg-white">
                        <h2 className="text-xl font-heading font-bold text-charcoal tracking-wide">
                            {view === 'results' ? 'Similar Curations Found' : 'Search by Image'}
                        </h2>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <HiOutlineX size={24} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        
                        {/* VIEW: Options */}
                        {view === 'options' && (
                            <div className="flex flex-col p-6 items-center w-full min-h-[400px]">
                                
                                {/* NEW: Top large preview area for placeholder */}
                                <div className="w-full max-w-sm aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 relative bg-gray-50">
                                    <img 
                                        src={PLACEHOLDER_IMAGE} 
                                        alt="Jewellery Placeholder" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                                    {/* Subtle Jewellery Icons around image */}
                                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gold shadow">✨</div>
                                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-charcoal shadow">💍</div>
                                </div>

                                {/* EXISTING LAYOUT: Two dashed buttons side by side */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                                    <button 
                                        onClick={() => setView('camera')}
                                        className="flex-1 w-full flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center shadow-sm">
                                            <HiOutlineCamera size={30} className="text-gray-400 group-hover:text-gold transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-charcoal mb-1">Scan with Camera</h3>
                                            <p className="text-sm text-gray-500">Take a photo of jewellery</p>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 w-full flex flex-col items-center justify-center p-8 gap-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gold hover:bg-gold/5 transition-all group"
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleFileUpload}
                                        />
                                        <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center shadow-sm">
                                            <HiOutlineUpload size={30} className="text-gray-400 group-hover:text-gold transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-charcoal mb-1">Upload Image</h3>
                                            <p className="text-sm text-gray-500">Choose from your gallery</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW: Camera */}
                        {view === 'camera' && (
                            <div className="relative w-full h-[500px] bg-black flex flex-col items-center justify-center">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                />
                                {/* Transparent overlay focus frame */}
                                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-gold rounded-tl-xl" />
                                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-gold rounded-tr-xl" />
                                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-gold rounded-bl-xl" />
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-gold rounded-br-xl" />
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 px-6 z-10">
                                    <button 
                                        onClick={() => setView('options')}
                                        className="h-14 px-6 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={captureImage}
                                        className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200" />
                                    </button>
                                    <div className="w-24 hidden sm:block" />
                                </div>
                            </div>
                        )}

                        {/* VIEW: Preview */}
                        {view === 'preview' && (
                            <div className="flex flex-col p-6 items-center min-h-[400px]">
                                
                                {/* REPLACED TOP IMAGE */}
                                <div className="relative w-full max-w-sm aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg border border-gray-100 mb-8">
                                    <img 
                                        src={imagePreview ? imagePreview : "/default-girl.jpg"} 
                                        alt="Selected Image" 
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        onError={(e) => { e.currentTarget.src = "/default-girl.jpg"; }}
                                    />
                                    <button 
                                        onClick={() => setView('options')}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-charcoal hover:bg-white shadow-sm transition-colors"
                                    >
                                        <HiOutlineRefresh size={20} />
                                    </button>
                                </div>
                                
                                {/* Existing Preview Buttons */}
                                <button 
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className={`w-full max-w-sm py-4 rounded-full flex items-center justify-center gap-2 text-[13px] font-bold tracking-wider uppercase transition-all shadow-md ${
                                        isSearching ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-charcoal text-white hover:bg-gold hover:shadow-lg'
                                    }`}
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                            Analyzing Image...
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineSearch size={18} />
                                            Search Similar Products
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setView('options')}
                                    disabled={isSearching}
                                    className="mt-4 text-sm font-medium text-gray-500 hover:text-gold transition-colors"
                                >
                                    Change Image
                                </button>
                            </div>
                        )}

                        {/* VIEW: Results */}
                        {view === 'results' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={imagePreview ? imagePreview : "/default-girl.jpg"} 
                                            alt="Reference" 
                                            className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100" 
                                            onError={(e) => { e.currentTarget.src = "/default-girl.jpg"; }}
                                        />
                                        <p className="text-sm font-medium text-gray-500">Based on your image</p>
                                    </div>
                                    <button 
                                        onClick={() => setView('options')}
                                        className="text-sm font-medium text-gold hover:underline"
                                    >
                                        Search Again
                                    </button>
                                </div>

                                {results.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {results.map((product, index) => (
                                            <ProductCard key={product._id} product={product} index={index} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No similar products found. Please try another image.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ImageSearchModal;
