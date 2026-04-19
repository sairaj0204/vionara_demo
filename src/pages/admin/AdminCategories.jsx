import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePhotograph,
    HiOutlineX, HiOutlineCheck, HiOutlineEye, HiOutlineEyeOff
} from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadImages } from '@/services/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ _id: null, name: '', description: '', thumbnail: '', banner: '', isActive: true });
    const [isSaving, setIsSaving] = useState(false);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) {
            return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
        }
        return url;
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await getCategories();
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData({
                _id: category._id,
                name: category.name,
                description: category.description || '',
                thumbnail: category.thumbnail || '',
                banner: category.banner || '',
                isActive: category.isActive
            });
        } else {
            setFormData({ _id: null, name: '', description: '', thumbnail: '', banner: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ _id: null, name: '', description: '', thumbnail: '', banner: '', isActive: true });
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('images', file);

        try {
            const toastId = toast.loading('Uploading image...');
            const { data } = await uploadImages(uploadData);
            if (data.success && data.urls.length > 0) {
                setFormData(prev => ({ ...prev, [field]: data.urls[0] }));
                toast.success('Image uploaded', { id: toastId });
            }
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            return toast.error('Category name is required');
        }

        setIsSaving(true);
        try {
            if (formData._id) {
                const { data } = await updateCategory(formData._id, formData);
                if (data.success) toast.success('Category updated successfully');
            } else {
                const { data } = await createCategory(formData);
                if (data.success) toast.success('Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const { data } = await deleteCategory(id);
            if (data.success) {
                toast.success('Category deleted');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const toggleStatus = async (category) => {
        try {
            const { data } = await updateCategory(category._id, { isActive: !category.isActive });
            if (data.success) {
                toast.success(`Category marked as ${!category.isActive ? 'Active' : 'Inactive'}`);
                setCategories(categories.map(c => c._id === category._id ? { ...c, isActive: !category.isActive } : c));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div></div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                >
                    <HiOutlinePlus size={16} /> Add Category
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[11px]">Category</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-[11px]">Slug</th>
                                    <th className="px-6 py-4 text-center font-medium text-gray-500 uppercase tracking-wider text-[11px]">Images</th>
                                    <th className="px-6 py-4 text-center font-medium text-gray-500 uppercase tracking-wider text-[11px]">Status</th>
                                    <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase tracking-wider text-[11px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No categories found. Click "Add Category" to create one.
                                        </td>
                                    </tr>
                                ) : categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-ivory border border-gray-100 flex-shrink-0 overflow-hidden">
                                                    {cat.thumbnail ? (
                                                        <img src={getImageUrl(cat.thumbnail)} alt={cat.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><HiOutlinePhotograph size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-charcoal">{cat.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{cat.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{cat.slug}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {cat.thumbnail ? <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Thumb</span> : null}
                                                {cat.banner ? <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100">Banner</span> : null}
                                                {!cat.thumbnail && !cat.banner && <span className="text-[10px] text-gray-400">None</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(cat)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${cat.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                                            >
                                                {cat.isActive ? <HiOutlineEye size={14} /> : <HiOutlineEyeOff size={14} />}
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <HiOutlinePencilAlt size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <HiOutlineTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-heading font-semibold text-charcoal text-lg">
                                    {formData._id ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-charcoal bg-white p-1.5 rounded-full shadow-sm">
                                    <HiOutlineX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Category Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gold text-sm transition-colors"
                                                placeholder="e.g. Rings, Necklaces"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Status</label>
                                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">{formData.isActive ? 'Active' : 'Hidden'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="2"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gold text-sm transition-colors resize-none"
                                            placeholder="Short description of the category..."
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                        {/* Thumbnail Image */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wider">Thumbnail Image</label>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-24 h-24 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 group relative">
                                                    {formData.thumbnail ? (
                                                        <>
                                                            <img src={getImageUrl(formData.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button type="button" onClick={() => setFormData({ ...formData, thumbnail: '' })} className="text-white p-1 hover:text-red-400">
                                                                    <HiOutlineTrash size={18} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <HiOutlinePhotograph size={24} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                        <span>Upload Image</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'thumbnail')} />
                                                    </label>
                                                    <p className="text-[10px] text-gray-400 mt-2">Recommended: 400x400px, transparent PNG or JPG.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banner Image */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wider">Category Banner</label>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-28 h-20 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 group relative">
                                                    {formData.banner ? (
                                                        <>
                                                            <img src={getImageUrl(formData.banner)} alt="Banner" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button type="button" onClick={() => setFormData({ ...formData, banner: '' })} className="text-white p-1 hover:text-red-400">
                                                                    <HiOutlineTrash size={18} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <HiOutlinePhotograph size={24} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                        <span>Upload Banner</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
                                                    </label>
                                                    <p className="text-[10px] text-gray-400 mt-2">Recommended: 1920x400px, high quality JPG.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </form>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-charcoal bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all disabled:opacity-70 shadow-sm hover:shadow"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <HiOutlineCheck size={16} />}
                                    {formData._id ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;
