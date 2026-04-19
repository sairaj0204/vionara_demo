import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AccountLayout from '@/components/profile/AccountLayout';
import { HiPlus, HiOutlineLocationMarker, HiOutlineDotsVertical, HiCheck } from 'react-icons/hi';
import { addAddress, updateAddressApi, setAddressDefaultApi, deleteAddress } from '@/services/api';
import toast from 'react-hot-toast';

const Addresses = () => {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    
    const [isAddMode, setIsAddMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    useEffect(() => {
        if (!user) router.push('/auth');
    }, [user, router]);

    if (!user) return null;

    const resetForm = () => {
        setForm({
            fullName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
        });
        setIsAddMode(false);
        setIsEditMode(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (isEditMode) {
                const { data } = await updateAddressApi(editingId, form);
                response = data;
            } else {
                const { data } = await addAddress({ ...form, isDefault: user.addresses?.length === 0 });
                response = data;
            }

            if (response && response.success) {
                toast.success(isEditMode ? 'Address updated successfully' : 'Address added successfully');
                await refreshUser();
                resetForm();
            } else {
                toast.error(response?.message || 'Failed to save address');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setAddressDefaultApi(id);
            await refreshUser();
            toast.success('Default address updated');
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteAddress(id);
            await refreshUser();
            toast.success('Address deleted successfully');
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    return (
        <AccountLayout title="Manage Addresses">
            {!isAddMode && !isEditMode ? (
                <div>
                    <button
                        onClick={() => setIsAddMode(true)}
                        className="w-full mb-6 border-2 border-dashed border-gray-200 p-4 text-gold font-medium hover:bg-ivory hover:border-gold transition-colors flex items-center justify-center gap-2"
                    >
                        <HiPlus size={20} /> Add New Address
                    </button>

                    <div className="space-y-4">
                        {user.addresses?.map((address) => (
                            <div key={address._id} className="relative border border-gray-100 p-5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            {address.isDefault ? (
                                                <div className="w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center">
                                                    <HiCheck size={14} />
                                                </div>
                                            ) : (
                                                <HiOutlineLocationMarker size={24} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-charcoal">{address.fullName}</h3>
                                                {address.isDefault && (
                                                    <span className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">Default</span>
                                                )}
                                                <span className="text-sm font-medium text-gray-700">{address.phone}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                                                {address.addressLine1}
                                                {address.addressLine2 && `, ${address.addressLine2}`}
                                                <br />
                                                {address.city}, {address.state} - <span className="font-medium text-charcoal">{address.pincode}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action dropdown or buttons */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => {
                                                    setForm(address);
                                                    setEditingId(address._id);
                                                    setIsEditMode(true);
                                                }}
                                                className="text-xs font-semibold text-gold hover:text-amber-600 uppercase tracking-widest"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(address._id)}
                                                className="text-xs font-semibold text-red-400 hover:text-red-500 uppercase tracking-widest"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        {!address.isDefault && (
                                            <button 
                                                onClick={() => handleSetDefault(address._id)}
                                                className="text-xs text-blue-600 hover:underline mt-2"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!user.addresses || user.addresses.length === 0) && (
                            <div className="text-center py-10 bg-gray-50 text-gray-400 text-sm">
                                You haven't added any addresses yet.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 p-6 border border-gray-100">
                    <h2 className="font-heading text-lg font-semibold mb-6 text-charcoal">
                        {isEditMode ? 'Edit Address' : 'Add a new Address'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                                <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Pincode</label>
                                <input name="pincode" value={form.pincode} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">City</label>
                                <input name="city" value={form.city} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Address Line 1</label>
                            <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" placeholder="House/Flat No., Building Name, Street" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Address Line 2 (Optional)</label>
                                <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" placeholder="Landmark, Area" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                                <input name="state" value={form.state} onChange={handleChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-200">
                            <button type="submit" disabled={loading} className="btn-gold px-8 py-2.5 text-sm disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                            <button type="button" onClick={resetForm} className="text-sm font-medium text-gray-500 hover:text-charcoal transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AccountLayout>
    );
};

export default Addresses;
