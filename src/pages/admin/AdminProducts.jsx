'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch,
    HiOutlinePhotograph, HiOutlineUpload, HiOutlineX, HiOutlineCheck,
} from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
    getAllProductsAdmin, createProduct, updateProduct,
    deleteProduct, bulkUploadProducts, uploadImages, getCategories,
} from '@/services/api';
import Link from 'next/link';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = ['Rings', 'Earrings', 'Necklaces', 'Bangles', 'Bracelets', 'Mangalsutra'];
const MATERIALS = [
    'Alloy', 'Brass', 'Copper', 'Stainless Steel', 'Silver Plated',
    'Gold Plated', 'Rose Gold Plated', 'Oxidized Metal',
    'Artificial Jewellery', 'Kundan', 'Polki', 'American Diamond',
];
const EMPTY_FORM = {
    name: '', description: '', shortDescription: '', price: '', mrp: '',
    category: '', material: '', weight: '', stone: '', stoneWeight: '',
    stock: '', sku: '', images: [], imageUrl: '', publicId: '', size: '',
    isFeatured: false, isBestseller: false, isNewArrival: false, isActive: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compress an image File via a canvas to reduce upload payload.
 * Targets ≤1200px wide and quality 0.78 — cuts most JPEGs by 60-80 %.
 */
function compressImage(file, maxWidth = 1200, quality = 0.78) {
    return new Promise((resolve) => {
        // Skip tiny files and non-images
        if (file.size < 150_000 || !file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
                'image/jpeg',
                quality,
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
}

// ─── Field components ─────────────────────────────────────────────────────────
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-charcoal bg-white outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/10 placeholder:text-gray-300';
const labelCls = 'block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5';

function Field({ label, required, children }) {
    return (
        <div>
            <label className={labelCls}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
            {children}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const AdminProducts = () => {
    const [products, setProducts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [filter, setFilter]               = useState('all');
    const [showModal, setShowModal]         = useState(false);
    const [showBulk, setShowBulk]           = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm]                   = useState({ ...EMPTY_FORM });
    const [imagePreview, setImagePreview]   = useState([]);
    const [isSaving, setIsSaving]           = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [csvFile, setCsvFile]             = useState(null);
    const [isUploadingCsv, setIsUploadingCsv] = useState(false);
    const [cmsCategories, setCmsCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // ── Modal backdrop ref guard ──────────────────────────────────────────────
    // The backdrop onClick fires even when clicking inside if a child uses
    // stopPropagation inconsistently. A ref on the inner panel lets us detect
    // whether the click originated outside it — the only safe pattern.
    const modalPanelRef = useRef(null);

    const handleBackdropClick = useCallback((e) => {
        // Only close if the click target is the backdrop itself (not a child)
        if (modalPanelRef.current && !modalPanelRef.current.contains(e.target)) {
            // Don't close if an upload is in progress — prevents accidental loss
            if (isUploadingImages || isSaving) return;
            setShowModal(false);
        }
    }, [isUploadingImages, isSaving]);

    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchProducts();
        fetchCmsCategories();
    }, []);

    const fetchCmsCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data } = await getCategories();
            if (data.success && data.categories?.length > 0) {
                setCmsCategories(data.categories.map(c => ({ name: c.name, slug: c.slug, _id: c._id })));
            } else {
                setCmsCategories(DEFAULT_CATEGORIES.map(name => ({ name, slug: name.toLowerCase(), _id: name.toLowerCase() })));
            }
        } catch {
            setCmsCategories(DEFAULT_CATEGORIES.map(name => ({ name, slug: name.toLowerCase(), _id: name.toLowerCase() })));
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await getAllProductsAdmin();
            if (data.success) setProducts(data.products || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filtered = products.filter(p => {
        const catIdOrSlug = typeof p.category === 'object'
            ? (p.category?._id || p.category?.slug)
            : p.category;
        const matchCat    = filter === 'all' || catIdOrSlug === filter;
        const matchSearch = !search
            || p.name.toLowerCase().includes(search.toLowerCase())
            || p.sku?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // ── Form handlers ─────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Image upload with client-side compression
    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        // Reset input so the same file can be re-selected if needed
        e.target.value = '';
        if (files.length === 0) return;

        setIsUploadingImages(true);
        // Immediately show local previews (object URLs) so the user sees
        // something while the actual upload happens in the background
        const localPreviews = files.map(f => URL.createObjectURL(f));
        setImagePreview(prev => [...prev, ...localPreviews]);

        try {
            // 1. Compress all files in parallel (non-blocking canvas work)
            const compressed = await Promise.all(files.map(f => compressImage(f)));

            // 2. Build FormData and POST
            const formData = new FormData();
            compressed.forEach(f => formData.append('images', f));

            const { data } = await uploadImages(formData);

            if (data.success) {
                const cloudUrls = data.urls;
                const firstRes  = data.results[0];

                // Replace the temporary object-URL previews with real Cloudinary URLs
                setImagePreview(prev => {
                    const withoutLocals = prev.filter(url => !url.startsWith('blob:'));
                    return [...withoutLocals, ...cloudUrls];
                });
                setForm(prev => ({
                    ...prev,
                    images:    [...prev.images.filter(u => !u.startsWith('blob:')), ...cloudUrls],
                    imageUrl:  prev.imageUrl || firstRes.url,
                    publicId:  prev.publicId || firstRes.public_id,
                }));
                toast.success(`${cloudUrls.length} image${cloudUrls.length > 1 ? 's' : ''} uploaded`);
            }
        } catch (error) {
            // Roll back local previews on failure
            setImagePreview(prev => prev.filter(url => !url.startsWith('blob:')));
            toast.error(error.response?.data?.message || 'Image upload failed');
        } finally {
            setIsUploadingImages(false);
        }
    };

    const removeImage = (idx) => {
        setImagePreview(prev => prev.filter((_, i) => i !== idx));
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    // ── Modal open/close ──────────────────────────────────────────────────────
    const openAddModal = () => {
        setEditingProduct(null);
        setForm({ ...EMPTY_FORM });
        setImagePreview([]);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            ...product,
            category: typeof product.category === 'object'
                ? (product.category?._id || product.category?.slug || '')
                : product.category,
            price:    product.price?.toString()  || '',
            mrp:      product.mrp?.toString()    || '',
            stock:    product.stock?.toString()  || '0',
            imageUrl: product.imageUrl || product.images?.[0] || '',
            publicId: product.publicId || '',
        });
        setImagePreview(product.images || []);
        setShowModal(true);
    };

    const closeModal = () => {
        if (isUploadingImages || isSaving) return; // guard mid-flight operations
        setShowModal(false);
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.name || !form.price || !form.category || !form.material) {
            toast.error('Please fill all required fields (Name, Price, Category, Material)');
            return;
        }
        if (isUploadingImages) {
            toast.error('Please wait for images to finish uploading');
            return;
        }

        const productData = {
            ...form,
            price: Number(form.price),
            mrp:   Number(form.mrp)   || Number(form.price),
            stock: Number(form.stock) || 0,
        };

        try {
            setIsSaving(true);
            toast.loading(editingProduct ? 'Updating product…' : 'Adding product…', { id: 'save-product' });

            if (editingProduct) {
                const { data } = await updateProduct(editingProduct._id, productData);
                if (data.success) {
                    setProducts(prev => prev.map(p => p._id === editingProduct._id ? data.product : p));
                    toast.success('Product updated', { id: 'save-product' });
                }
            } else {
                const { data } = await createProduct(productData);
                if (data.success) {
                    setProducts(prev => [data.data ?? data.product, ...prev]);
                    toast.success('Product added successfully', { id: 'save-product' });
                }
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product', { id: 'save-product' });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Toggle status ─────────────────────────────────────────────────────────
    const handleToggleStatus = async (productId, field, value) => {
        try {
            const { data } = await updateProduct(productId, { [field]: value });
            if (data.success) {
                setProducts(prev => prev.map(p => p._id === productId ? data.product : p));
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product? This cannot be undone.')) return;
        try {
            toast.loading('Deleting…', { id: 'delete' });
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p._id !== id));
            toast.success('Product deleted', { id: 'delete' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product', { id: 'delete' });
        }
    };

    // ── Bulk CSV upload ───────────────────────────────────────────────────────
    const handleCsvSelect = (e) => {
        const file = e.target.files[0];
        if (file?.type === 'text/csv') {
            setCsvFile(file);
        } else {
            toast.error('Please select a valid CSV file');
            setCsvFile(null);
        }
    };

    const handleBulkUpload = async () => {
        if (!csvFile) { toast.error('Select a CSV file first'); return; }
        try {
            setIsUploadingCsv(true);
            toast.loading('Parsing CSV…', { id: 'bulk-upload' });
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const rows    = ev.target.result.split('\n');
                const headers = rows[0].split(',').map(h => h.trim());
                const newProducts = [];
                for (let i = 1; i < rows.length; i++) {
                    if (!rows[i].trim()) continue;
                    const values  = rows[i].split(',').map(v => v.trim());
                    const product = {};
                    headers.forEach((h, idx) => { product[h] = values[idx]; });
                    if (product.name && product.price && product.category) {
                        newProducts.push({
                            name:        product.name,
                            description: product.description || product.name,
                            price:       Number(product.price),
                            mrp:         Number(product.mrp) || Number(product.price),
                            stock:       Number(product.stock) || 0,
                            category:    product.category,
                            sku:         product.sku || '',
                            material:    product.material || 'Gold Plated',
                            images:      product.images ? product.images.split('|') : [],
                        });
                    }
                }
                if (newProducts.length === 0) {
                    toast.error('No valid products in CSV', { id: 'bulk-upload' });
                    return;
                }
                try {
                    const { data } = await bulkUploadProducts({ products: newProducts });
                    if (data.success) {
                        toast.success(`${data.products.length} products imported`, { id: 'bulk-upload' });
                        fetchProducts();
                        setShowBulk(false);
                        setCsvFile(null);
                    }
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Import failed', { id: 'bulk-upload' });
                }
            };
            reader.readAsText(csvFile);
        } catch {
            toast.error('Failed to parse CSV', { id: 'bulk-upload' });
        } finally {
            setIsUploadingCsv(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AdminLayout title="Products" subtitle={`${products.length} total products`}>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto flex-wrap">
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold transition-colors"
                        />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {['all', ...cmsCategories].map(cat => {
                            const val   = cat === 'all' ? 'all' : (cat._id || cat.slug);
                            const label = cat === 'all' ? 'All' : cat.name;
                            return (
                                <button
                                    key={val}
                                    onClick={() => setFilter(val)}
                                    className={`text-xs px-3 py-1.5 capitalize whitespace-nowrap rounded-lg border transition-colors
                                        ${filter === val ? 'bg-gold text-white border-gold' : 'bg-white border-gray-200 hover:border-gold text-gray-600'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => setShowBulk(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:border-gold transition-colors"
                    >
                        <HiOutlineUpload size={14} />Bulk Upload
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gold text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors"
                    >
                        <HiOutlinePlus size={14} />Add Product
                    </button>
                </div>
            </div>

            {/* ── Bulk upload panel ── */}
            <AnimatePresence>
                {showBulk && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white rounded-xl border border-gray-100 p-6 mb-6 overflow-hidden"
                    >
                        <h3 className="font-heading font-semibold mb-1">Bulk Upload Products</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            CSV headers: <code className="bg-gray-100 px-1 rounded">name, description, price, mrp, stock, category, sku, material, images</code> (images pipe-separated).
                        </p>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gold transition-colors relative">
                            <input type="file" accept=".csv" onChange={handleCsvSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <HiOutlineUpload size={28} className={`${csvFile ? 'text-gold' : 'text-gray-300'} mx-auto mb-2`} />
                            <p className="text-sm text-gray-500">{csvFile ? csvFile.name : 'Click or drag a CSV file here'}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleBulkUpload}
                                disabled={!csvFile || isUploadingCsv}
                                className="px-4 py-2 bg-gold text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUploadingCsv ? 'Importing…' : 'Upload & Import'}
                            </button>
                            <button onClick={() => { setShowBulk(false); setCsvFile(null); }} className="text-xs text-gray-400 hover:text-charcoal px-3">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Products table ── */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                                <th className="p-3 pl-4">Product</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Rating</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center">
                                    <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(p => (
                                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                                        <td className="p-3 pl-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.images?.[0] || 'https://placehold.co/80x80?text=No+Image'}
                                                    alt={p.name}
                                                    className="w-10 h-10 object-cover rounded-md bg-ivory shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-xs truncate max-w-[200px]">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{p.sku || 'No SKU'} · {p.material}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded">
                                                {typeof p.category === 'object' ? p.category?.name : (p.category || 'Unknown')}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs font-semibold">₹{(p.price || 0).toLocaleString('en-IN')}</span>
                                            {p.mrp > p.price && (
                                                <span className="text-[10px] text-gray-400 line-through ml-1">₹{p.mrp.toLocaleString('en-IN')}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium
                                                ${p.stock <= 5 ? 'bg-red-50 text-red-600' : p.stock <= 15 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-gray-500">
                                            {p.averageRating > 0 ? `${p.averageRating} ⭐ (${p.numReviews})` : '—'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {[
                                                    { field: 'isActive',    active: p.isActive,    labels: ['Active', 'Draft'],    on: 'bg-emerald-50 text-emerald-600', off: 'bg-red-50 text-red-600' },
                                                    { field: 'isFeatured',  active: p.isFeatured,  labels: ['Featured', 'Feature'], on: 'bg-gold/10 text-gold',           off: 'bg-gray-100 text-gray-400' },
                                                    { field: 'isBestseller',active: p.isBestseller,labels: ['Best', 'Best'],        on: 'bg-blue-50 text-blue-600',        off: 'bg-gray-100 text-gray-400' },
                                                ].map(({ field, active, labels, on, off }) => (
                                                    <button
                                                        key={field}
                                                        onClick={() => handleToggleStatus(p._id, field, !active)}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium transition-colors ${active ? on : off}`}
                                                    >
                                                        {active ? labels[0] : labels[1]}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 pr-4 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <button onClick={() => openEditModal(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><HiOutlinePencil size={14} /></button>
                                                <button onClick={() => handleDelete(p._id)}  className="p-1.5 hover:bg-red-50  rounded-lg text-red-500  transition-colors"><HiOutlineTrash  size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="p-10 text-center text-sm text-gray-400">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add / Edit modal ── */}
            <AnimatePresence>
                {showModal && (
                    // Backdrop — click outside the panel to close
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
                        onMouseDown={handleBackdropClick}
                    >
                        {/* Panel — ref used by handleBackdropClick to detect inside clicks */}
                        <motion.div
                            ref={modalPanelRef}
                            initial={{ y: 24, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0,  opacity: 1, scale: 1 }}
                            exit={{ y: 24, opacity: 0, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <h2 className="font-heading text-base font-semibold text-charcoal">
                                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {editingProduct ? 'Update product details below.' : 'Fill in the details to list a new product.'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-charcoal transition-colors"
                                >
                                    <HiOutlineX size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                                {/* ── Image upload ── */}
                                <div>
                                    <p className={labelCls}>Product Images</p>
                                    <div className="flex gap-3 flex-wrap">
                                        {/* Existing / uploaded thumbnails */}
                                        {imagePreview.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group shrink-0">
                                                {img.startsWith('blob:') ? (
                                                    // Local-preview placeholder while uploading
                                                    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                ) : (
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                )}
                                                {!img.startsWith('blob:') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <HiOutlineX size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* Upload trigger */}
                                        <label className={`w-20 h-20 shrink-0 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
                                            ${isUploadingImages ? 'border-gold bg-gold/5 cursor-wait' : 'border-gray-200 hover:border-gold bg-gray-50 hover:bg-gold/5'}`}>
                                            {isUploadingImages ? (
                                                <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <HiOutlinePhotograph size={18} className="text-gray-400" />
                                                    <span className="text-[9px] text-gray-400 mt-1">Add</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                disabled={isUploadingImages}
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {isUploadingImages && (
                                        <p className="text-[11px] text-gold mt-2 flex items-center gap-1.5">
                                            <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin inline-block" />
                                            Compressing & uploading images…
                                        </p>
                                    )}
                                </div>

                                {/* ── Section: Core info ── */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3">Core Info</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <Field label="Product Name" required>
                                                <input
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 22K Gold Rope Bracelet"
                                                    className={inputCls}
                                                />
                                            </Field>
                                        </div>
                                        <Field label="Price (₹)" required>
                                            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className={inputCls} placeholder="799" />
                                        </Field>
                                        <Field label="MRP (₹)">
                                            <input name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} className={inputCls} placeholder="999" />
                                        </Field>
                                        <Field label="Category" required>
                                            <div className="flex gap-2 items-center">
                                                <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                                                    <option value="" disabled>{loadingCategories ? 'Loading…' : 'Select category'}</option>
                                                    {!loadingCategories && cmsCategories.length === 0 && <option disabled>No categories yet</option>}
                                                    {cmsCategories.map(c => (
                                                        <option key={c._id || c.slug} value={c._id || c.slug}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <Link href="/admin/cms" target="_blank" className="shrink-0 text-[10px] text-blue-500 hover:underline whitespace-nowrap">+ New</Link>
                                            </div>
                                        </Field>
                                        <Field label="Material" required>
                                            <input
                                                list="materials-list"
                                                name="material"
                                                value={form.material}
                                                onChange={handleChange}
                                                placeholder="Type or pick…"
                                                className={inputCls}
                                            />
                                            <datalist id="materials-list">
                                                {MATERIALS.map(m => <option key={m} value={m} />)}
                                            </datalist>
                                        </Field>
                                        <Field label="Stock" required>
                                            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputCls} placeholder="0" />
                                        </Field>
                                        <Field label="SKU">
                                            <input name="sku" value={form.sku} onChange={handleChange} className={inputCls} placeholder="VIO-001" />
                                        </Field>
                                    </div>
                                </div>

                                {/* ── Section: Details ── */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3">Details</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Weight">
                                            <input name="weight" value={form.weight} onChange={handleChange} className={inputCls} placeholder="e.g. 3.2g" />
                                        </Field>
                                        <Field label="Stone">
                                            <input name="stone" value={form.stone} onChange={handleChange} className={inputCls} placeholder="e.g. CZ" />
                                        </Field>
                                        <Field label="Size">
                                            <input name="size" value={form.size} onChange={handleChange} className={inputCls} placeholder="e.g. Free Size" />
                                        </Field>
                                        <Field label="Stone Weight">
                                            <input name="stoneWeight" value={form.stoneWeight} onChange={handleChange} className={inputCls} placeholder="e.g. 0.5ct" />
                                        </Field>
                                        <div className="sm:col-span-2">
                                            <Field label="Description">
                                                <textarea
                                                    name="description"
                                                    value={form.description}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    placeholder="Describe the product…"
                                                    className={inputCls}
                                                />
                                            </Field>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Field label="Short Description">
                                                <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className={inputCls} placeholder="One-line summary for listings" />
                                            </Field>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Section: Flags ── */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3">Visibility & Labels</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { name: 'isActive',     label: 'Active',      desc: 'Listed in store' },
                                            { name: 'isFeatured',   label: 'Featured',    desc: 'Homepage section' },
                                            { name: 'isBestseller', label: 'Bestseller',  desc: 'Best-sellers tag' },
                                            { name: 'isNewArrival', label: 'New Arrival', desc: 'New arrivals tag' },
                                        ].map(flag => (
                                            <label
                                                key={flag.name}
                                                className={`flex flex-col gap-1 cursor-pointer border rounded-xl p-3 transition-all
                                                    ${form[flag.name]
                                                        ? 'border-gold bg-gold/5 text-charcoal'
                                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold">{flag.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        name={flag.name}
                                                        checked={form[flag.name] || false}
                                                        onChange={handleChange}
                                                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400 leading-tight">{flag.desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                                <p className="text-[11px] text-gray-400">
                                    {isUploadingImages && '⏳ Waiting for images…'}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving || isUploadingImages}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <HiOutlineCheck size={15} />
                                        )}
                                        {isSaving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminProducts;
