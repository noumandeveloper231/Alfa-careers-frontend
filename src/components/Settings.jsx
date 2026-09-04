import axios from 'axios';
import { Settings2, Lock, Eye, EyeOff, Globe, DollarSign, UserCheck, Shield, CheckCircle, XCircle } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import Select from './Select';
import { useMemo } from 'react';

function Settings() {
    const { backendUrl, userData, setUserData } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('general');

    // General Settings State
    const [checked, setChecked] = useState(userData?.isActive);
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState(userData?.currency || 'USD');

    // Password Change State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Visibility Handler
    const handleVisibilityChange = async (status) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/change-visibility`, {
                email: userData.email,
                status: status
            });
            if (data.success) {
                setChecked(status);
                setUserData(prev => ({ ...prev, isActive: status }));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Currency Handler
    const updateProfile = async (currency) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: { currency: currency },
            });
            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- Real-time Password Match Check ---
    const passwordsMatch = useMemo(() => {
        // Only check if both fields have input
        if (newPassword.length > 0 && confirmPassword.length > 0) {
            return newPassword === confirmPassword;
        }
        // Return null if one or both fields are empty, so no message is shown initially
        return null;
    }, [newPassword, confirmPassword]);

    // --- Real-time Password Strength/Validation Check ---
    const passwordValidation = useMemo(() => ({
        length: newPassword.length >= 8,
        number: /\d/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
    }), [newPassword]);

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    // Password Change Handler
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (!isPasswordValid) {
            toast.error("Password must be at least 8 characters long and contain a number and a special character");
            return;
        }

        setPasswordLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/change-user-password`, {
                oldPassword,
                newPassword
            }, { withCredentials: true });

            if (data.success) {
                toast.success(data.message);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const currencyOptions = [
        { value: "USD", label: "USD - United States Dollar" },
        { value: "AED", label: "AED - United Arab Emirates Dirham" },
        { value: "PKR", label: "PKR - Pakistani Rupee" },
        { value: "OMR", label: "OMR - Omani Rial" },
        { value: "QAR", label: "QAR - Qatari Riyal" },
        { value: "SAR", label: "SAR - Saudi Riyal" },
        { value: "EUR", label: "EUR - Euro" },
        { value: "GBP", label: "GBP - British Pound" },
        { value: "AUD", label: "AUD - Australian Dollar" },
        { value: "CAD", label: "CAD - Canadian Dollar" },
        { value: "INR", label: "INR - Indian Rupee" },
        { value: "BDT", label: "BDT - Bangladeshi Taka" },
        { value: "MYR", label: "MYR - Malaysian Ringgit" },
        { value: "THB", label: "THB - Thai Baht" },
        { value: "CNY", label: "CNY - Chinese Yuan" },
        { value: "JPY", label: "JPY - Japanese Yen" },
        { value: "ZAR", label: "ZAR - South African Rand" },
    ];

    return (
        <div className='w-full min-h-screen overflow-y-auto bg-white p-4 md:p-8 rounded-md  border border-gray-200'>
            <div className="">
                <header className="mb-8">
                    <h1 className='flex items-center gap-3 text-3xl font-bold text-gray-800'>
                        Settings
                    </h1>
                </header>

                {/* Tabs Navigation */}
                <div className='flex items-center gap-8 cursor-pointer mb-4'>
                    <span
                        onClick={() => setActiveTab('general')}
                        className={`${activeTab === "general" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        General
                    </span>
                    <span
                        onClick={() => setActiveTab('security')}
                        className={`${activeTab === "security" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        Security
                    </span>
                </div>

                {/* Content Area */}
                <div className="bg-white p-6 md:p-8 min-h-[400px]">

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Visibility Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            Profile Visibility
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                                            Control whether your profile is visible to other users.
                                            {(userData?.profileScore < 60) && (
                                                <span className="mt-1 text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded text-xs font-medium border border-amber-200">
                                                    Minimum 60% profile score required
                                                </span>
                                            )}
                                            {userData?.reviewStatus && userData?.reviewStatus !== "approved" && (
                                                <span className="mt-1 text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded text-xs font-medium border border-amber-200">
                                                    {userData?.reviewStatus === "underReview"
                                                        ? "Profile Under Review"
                                                        : "Complete your Profile first"}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <label
                                        onClick={() => {
                                            if (userData?.profileScore < 60) {
                                                toast.warning('Minimum 60% profile score required to make your profile public');
                                            }
                                        }}
                                        className={`inline-flex items-center ${((userData?.profileScore < 60) || (userData?.reviewStatus && userData?.reviewStatus !== "approved") || loading) ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                        <span className={`mr-3 text-sm font-medium ${checked ? 'text-green-600' : 'text-gray-500'}`}>
                                            {checked ? 'Public' : 'Private'}
                                        </span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={checked || false}
                                                onChange={(e) => handleVisibilityChange(e.target.checked)}
                                                disabled={(userData?.profileScore < 60) || (userData?.reviewStatus && userData?.reviewStatus !== "approved") || loading}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--primary-color)] peer-disabled:cursor-not-allowed peer-disabled:opacity-60"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Currency Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="flex justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            Preferred Currency
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select your preferred currency for salary display and transactions.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-60">
                                        <Select
                                            options={currencyOptions}
                                            value={currencyOptions.find(c => c.value === currency) || null}
                                            onChange={(option) => { updateProfile(option.value); setCurrency(option.value) }}
                                            placeholder="Select Currency"
                                            isSearchable
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab (Password Change) */}
                    {activeTab === 'security' && (
                        <div className="max-w-xl border p-2 md:p-4 lg:p-6 border-gray-200 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Change Password</h2>
                            <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>

                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                {/* Old Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="!pl-10"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="!pl-10"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Validation Feedback */}
                                <div className="flex flex-col gap-1 ml-2 mt-2">
                                    <div className={`flex items-center gap-1.5 ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}>
                                        {passwordValidation.length ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        <span className="text-xs font-medium">At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${passwordValidation.number ? 'text-green-600' : 'text-red-500'}`}>
                                        {passwordValidation.number ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        <span className="text-xs font-medium">Contains a number</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${passwordValidation.special ? 'text-green-600' : 'text-red-500'}`}>
                                        {passwordValidation.special ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        <span className="text-xs font-medium">Contains a special character</span>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div className='flex flex-col gap-1'>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="!pl-10"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    {passwordsMatch !== null && (
                                        <div className={`flex items-center gap-1.5 ml-2 mt-2 transition-opacity ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle size={16} />
                                                    <span className="text-xs font-medium">Passwords Match!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={16} />
                                                    <span className="text-xs font-medium">Passwords do not match.</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>


                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="primary-btn w-full"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;