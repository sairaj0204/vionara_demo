import { useState, useEffect } from 'react';
import { useRouter } from 'next/compat/router';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { getCategoryBySlug, getProducts } from '@/services/api';

const CategoryPage = ({ params }) => {
    const router = useRouter();
    const slug = params?.category || (typeof router?.query?.category === 'string' ? router.query.category : '');
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, prodRes] = await Promise.all([
                    getCategoryBySlug(slug).catch(() => ({ data: { success: false } })),
                    getProducts({ category: slug }).catch(() => ({ data: { success: false, products: [] } }))
                ]);
                
                if (catRes.data && catRes.data.success) {
                    setCategory(catRes.data.category);
                }
                
                if (prodRes.data && prodRes.data.success) {
                    const filtered = prodRes.data.products.filter(p => {
                        if (!p) return false;

                        const pCat =
                            p.category?.name?.toLowerCase?.() ||
                            p.category?.toLowerCase?.() ||
                            p.categorySlug?.toLowerCase?.() ||
                            '';

                        const s = slug.toLowerCase();

                        return (
                            pCat === s ||
                            p.tags?.some(tag => tag?.toLowerCase() === s)
                        );
                    });
                    setProducts(filtered);
                }
            } catch (error) {
                console.error("Error fetching category data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) {
            return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
        }
        return url;
    };

    const title = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
    const rawBanner = category?.banner || category?.thumbnail || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600';
    const bannerImg = getImageUrl(rawBanner);

    return (
        <div className="min-h-screen bg-white">
            {/* Category Banner */}
            <div className="relative h-64 lg:h-80 overflow-hidden">
                <img
                    src={bannerImg}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Collection</p>
                        <h1 className="font-heading text-4xl lg:text-5xl text-white font-bold">{title}</h1>
                        {!loading && <p className="text-white/70 text-sm mt-2">{products.length} products</p>}
                    </motion.div>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {products.map((product, i) => (
                            <ProductCard key={product._id} product={product} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        No products found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
