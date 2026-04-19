import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import { motion, AnimatePresence } from 'framer-motion';

import ProductCard from '@/components/product/ProductCard';
import { getProducts } from '@/services/api';
import { HiAdjustments, HiX } from 'react-icons/hi';
import axios from 'axios';

const Shop = ({ searchQuery: searchQueryProp = '' }) => {
    const router = useRouter();
    const searchQuery = searchQueryProp || (typeof router?.query?.search === 'string' ? router.query.search : '');
    const [priceRange, setPriceRange] = useState([250, 200000]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMaterial, setSelectedMaterial] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bannerData, setBannerData] = useState(null);

    useEffect(() => {
        if (sortBy === 'newest' && !searchQuery && selectedCategory === 'all') {
            axios.get('/api/settings/new-arrivals-banner').then(res => {
                if(res.data.success) setBannerData(res.data.banner);
            }).catch(console.error);
        } else {
            setBannerData(null);
        }
    }, [sortBy, searchQuery, selectedCategory]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    search: searchQuery,
                    category: selectedCategory !== 'all' ? selectedCategory : undefined,
                    material: selectedMaterial !== 'all' ? selectedMaterial : undefined,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    sort: sortBy,
                    limit: 50 // Fetch enough to filter comfortably on frontend or let backend handle pagination
                };
                // Clean up undefined params
                Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

                const { data } = await getProducts(params);
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, selectedCategory, selectedMaterial, priceRange, sortBy]);

    const materials = ['all', 'Alloy', 'Brass', 'Copper', 'Gold Plated', 'Silver Plated', 'Oxidized Metal'];

    return (
        <div className="min-h-screen bg-white">
            
                <title>{searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory !== 'all' ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} | Vionara` : 'Shop Fine Jewellery | Vionara'}</title>
                <meta name="description" content="Browse our exclusive collection of luxury lab-grown diamond rings, earrings, necklaces, and bangles." />
            

            {/* Header Section */}
            {bannerData ? (
                <div 
                    className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] bg-cover bg-center flex flex-col items-center justify-center text-center overflow-hidden"
                    style={{ backgroundImage: `url(${bannerData.image})` }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8 }}
                        className="relative z-10 font-heading text-white px-4"
                    >
                        <p className="text-gold text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 font-bold">COLLECTION</p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {bannerData.title}
                        </h1>
                        <p className="text-gray-200 text-sm sm:text-base font-light mb-4 tracking-wide max-w-lg mx-auto" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                            {bannerData.subtitle}
                        </p>
                        {!loading && (
                            <p className="text-white/80 text-xs sm:text-sm tracking-widest uppercase mt-4">
                                {products.length} Products
                            </p>
                        )}
                    </motion.div>
                </div>
            ) : (
                <div className="bg-charcoal text-white py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Collection</p>
                            <h1 className="font-heading text-3xl lg:text-4xl font-bold">
                                {searchQuery ? `Results for "${searchQuery}"` : 'All Jewellery'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-2">{products.length} products</p>
                        </motion.div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Sort & Filter Bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-sm text-charcoal hover:text-gold transition-colors font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
                    >
                        <HiAdjustments size={18} />
                        <span className="inline">Filters</span>
                    </button>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm border border-gray-200 px-3 py-2 outline-none focus:border-gold bg-transparent"
                        id="sort-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>

                {/* Main Content Layout */}
                <div className="w-full relative">
                    
                    {/* Filter Overlay */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer" 
                                onClick={() => setShowFilters(false)} 
                            />
                        )}
                    </AnimatePresence>

                    {/* Sidebar Filters Drawer */}
                    <div 
                        className={`
                            fixed top-0 left-0 h-full w-[300px] bg-white z-50 p-6 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto
                            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    >
                        <div className="w-full space-y-8">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-5">
                                <h3 className="font-heading text-xl font-semibold text-charcoal tracking-wide uppercase">Filters</h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-charcoal hover:rotate-90">
                                    <HiX size={22} />
                                </button>
                            </div>

                            {/* Category */}
                            <div>
                                <h4 className="text-xs tracking-wider uppercase font-medium mb-3">Category</h4>
                                <div className="space-y-2">
                                    {['all', 'rings', 'earrings', 'necklaces', 'bangles'].map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="accent-gold"
                                            />
                                            <span className="text-sm capitalize group-hover:text-gold transition-colors">
                                                {cat === 'all' ? 'All Categories' : cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Material */}
                            <div>
                                <h4 className="text-xs tracking-wider uppercase font-medium mb-3">Material</h4>
                                <div className="space-y-2">
                                    {materials.map((mat) => (
                                        <label key={mat} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="material"
                                                checked={selectedMaterial === mat}
                                                onChange={() => setSelectedMaterial(mat)}
                                                className="accent-gold"
                                            />
                                            <span className="text-sm group-hover:text-gold transition-colors">
                                                {mat === 'all' ? 'All Materials' : mat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="text-xs tracking-wider uppercase font-medium mb-3">Price Range</h4>
                                <input
                                    type="range"
                                    min="250"
                                    max="200000"
                                    step="5000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([250, Number(e.target.value)])}
                                    className="w-full accent-gold"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    ₹250 – ₹{priceRange[1].toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid Area */}
                    <div className="w-full transition-all duration-300">
                        {/* Promotional Banner */}
                        <div className="mb-8 w-full h-40 md:h-48 rounded-lg overflow-hidden relative bg-charcoal flex items-center shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 to-transparent"></div>
                            <div className="relative z-10 px-8 md:px-10 max-w-lg">
                                <span className="text-gold text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Premium Artificial Jewellery</span>
                                <h2 className="text-white font-heading text-xl md:text-2xl lg:text-3xl font-semibold leading-tight mb-2">
                                    {selectedCategory === 'all' ? 'Explore Our Collection' : `Stunning ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                                </h2>
                                <p className="text-gray-300 text-xs md:text-sm hidden sm:block">
                                    Discover elegantly crafted pieces designed to add refined charm to your everyday moments, affordably.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-300">
                                {products.map((product, i) => (
                                    <ProductCard key={product._id} product={product} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="font-heading text-xl text-gray-400">No products found</p>
                                <p className="text-sm text-gray-300 mt-2">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
