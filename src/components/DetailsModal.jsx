import axios from 'axios';
import React, { useState } from 'react'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Building } from 'lucide-react';

const DetailsModal = () => {
    const { backendUrl, userData, setUserData } = useContext(AppContext)
    const [company, setCompany] = useState(userData?.company || "");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const updateProfile = async (e) => {
        e.preventDefault();

        if (!company.trim()) {
            toast.error("Company name is required");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: { company: company.trim() },
            });
            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
                navigate('/dashboard');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                </h3>
                <span className="text-gray-600 text-sm leading-relaxed">
                    We need your company information to set up your employee profile and get you started.
                </span>
            </div>

            {/* Form */}
            <form onSubmit={updateProfile} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
                        Company Name
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Enter your company name"
                            required
                            disabled={loading}
                        />
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading || !company.trim()}
                        className="w-full bg-gradient-to-r from-[var(--primary-color)] to-blue-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Setting up your profile...
                            </>
                        ) : (
                            <>
                                Complete Setup
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <span className="text-xs text-gray-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </span>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default DetailsModal
