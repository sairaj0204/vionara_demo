import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AccountLayout from '@/components/profile/AccountLayout';
import { updateProfile, changePasswordApi } from '@/services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!user) {
            router.push('/auth');
        } else {
            setProfileForm({ name: user.name || '', phone: user.phone || '' });
        }
    }, [user, router]);

    if (!user) return null;

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileForm);
            await refreshUser();
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        setLoading(true);
        try {
            await changePasswordApi({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccountLayout title="Profile Information">
            <div className="space-y-8">
                
                {/* Personal Information Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-heading font-semibold text-charcoal">Personal Information</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-gold hover:text-amber-600 transition-colors">
                                Edit
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="font-medium text-charcoal">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="font-medium text-charcoal">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="font-medium text-charcoal">{user.phone || 'Not added'}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                <input name="name" value={profileForm.name} onChange={handleProfileChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Email Address (Cannot be changed)</label>
                                <input value={user.email} disabled className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                                <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="submit" disabled={loading} className="btn-gold px-8 py-2.5 text-sm">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-500 hover:text-charcoal transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* Password Section */}
                <div>
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-heading font-semibold text-charcoal">Security</h2>
                        {!isChangingPassword && (
                            <button onClick={() => setIsChangingPassword(true)} className="text-sm font-medium text-gold hover:text-amber-600 transition-colors">
                                Change Password
                            </button>
                        )}
                    </div>

                    {!isChangingPassword ? (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Keep your account secure with a strong password.</p>
                            <p className="text-sm text-gray-400">********</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Current Password</label>
                                <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                                <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={6} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                                <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required minLength={6} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold bg-white" />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="submit" disabled={loading} className="btn-gold px-8 py-2.5 text-sm">
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                                <button type="button" onClick={() => {
                                    setIsChangingPassword(false);
                                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }} className="text-sm font-medium text-gray-500 hover:text-charcoal transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </AccountLayout>
    );
};

export default Profile;
