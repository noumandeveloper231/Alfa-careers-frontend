import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'sonner'
import { Clock, Check, X, User, Mail, Building, Calendar, Loader, MapPin, Phone, Briefcase, GraduationCap, Award, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmployeeProfileRequests = () => {
    const { backendUrl } = useContext(AppContext)
    const [pendingRequests, setPendingRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [expandedCards, setExpandedCards] = useState(new Set())
    const navigate = useNavigate()

    const getPendingProfileRequests = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${backendUrl}/api/auth/get-profile-request`)
            if (data.success) {
                setPendingRequests(data.pendingRequests)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateEmployeeStatus = async (email, reviewStatus) => {
        try {
            setProcessingId(email)
            const { data } = await axios.post(`${backendUrl}/api/auth/employee-profile-request`, { email, reviewStatus })
            if (data.success) {
                await getPendingProfileRequests()
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setProcessingId(null)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const toggleCardExpansion = (employeeId) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev)
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId)
            } else {
                newSet.add(employeeId)
            }
            return newSet
        })
    }

    useEffect(() => {
        getPendingProfileRequests()
    }, [])

    return (
        <div className='w-full min-h-screen overflow-y-auto p-8'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='flex items-center gap-3 text-3xl font-bold text-gray-800 mb-2'>
                    <Clock size={30} className='text-[var(--primary-color)]' />
                    Pending Employee Profile Requests
                </h1>
                <span className='text-gray-600'>Review and approve Employee profile completion requests</span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className='flex items-center justify-center py-12'>
                    <Loader className='animate-spin text-[var(--primary-color)] mr-2' size={24} />
                    <span className='text-gray-600'>Loading pending requests...</span>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                        <div className='flex items-center gap-2'>
                            <Clock className='text-blue-600' size={20} />
                            <span className='text-blue-800 font-medium'>
                                {pendingRequests.length} Employee approval{pendingRequests.length !== 1 ? 's' : ''} pending
                            </span>
                        </div>
                    </div>

                    {/* Employee Cards */}
                    {pendingRequests.length === 0 ? (
                        <div className='bg-white rounded-lg shadow-sm border border-blue-200 p-12 text-center'>
                            <Clock className='animate-pulse mx-auto text-gray-400 mb-4' size={48} />
                            <h3 className='text-xl font-medium text-gray-600 mb-2'>No Pending Requests</h3>
                            <span className='text-gray-500'>All Employee profile requests have been processed.</span>
                        </div>
                    ) : (
                        <div className='grid gap-6'>
                            {pendingRequests.map((employee, index) => {
                                const employeeId = employee._id || employee.email || index
                                const isExpanded = expandedCards.has(employeeId)

                                return (
                                    <div key={employeeId} className='bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow'>
                                        {/* Employee Header */}
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-4'>
                                                <div className='h-14 w-14 rounded-full bg-[var(--primary-color)] flex items-center justify-center'>
                                                    <User className='text-white' size={24} />
                                                </div>
                                                <div>
                                                    <h3 className='text-xl font-semibold text-gray-900'>
                                                        {employee.name || 'N/A'}
                                                    </h3>
                                                    <div className='flex items-center gap-1 text-gray-600 text-sm'>
                                                        <Mail size={16} />
                                                        <span>{employee.email}</span>
                                                    </div>
                                                    {employee.phone && (
                                                        <div className='flex items-center gap-1 text-gray-600 mt-1'>
                                                            <Phone size={16} />
                                                            <span>{employee.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className='flex items-center gap-3'>
                                                <span
                                                    onClick={() => toggleCardExpansion(employeeId)}
                                                    className='inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={16} />
                                                    ) : (
                                                        <ChevronDown size={16} />
                                                    )}
                                                    {isExpanded ? 'Hide Details' : 'Show Details'}
                                                </span>
                                                <span
                                                    onClick={() => updateEmployeeStatus(employee.email, "approved")}
                                                    disabled={processingId === employee.email}
                                                    className='inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                                >
                                                    {processingId === employee.email ? (
                                                        <Loader className='animate-spin' size={16} />
                                                    ) : (
                                                        <Check size={16} />
                                                    )}
                                                    Approve
                                                </span>
                                                <span
                                                    onClick={() => updateEmployeeStatus(employee.email, "rejected")}
                                                    disabled={processingId === employee.email}
                                                    className='inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                                >
                                                    {processingId === employee.email ? (
                                                        <Loader className='animate-spin' size={16} />
                                                    ) : (
                                                        <X size={16} />
                                                    )}
                                                    Reject
                                                </span>
                                            </div>
                                        </div>
                                        <div className='text-right flex justify-end text-xs text-gray-600'
                                            onClick={() => navigate(`/company-profile/${employee.authId}`)}
                                        >
                                            <div className='flex items-center gap-2 underline cursor-pointer text-blue-500 '>
                                                View Profile Page <ChevronRight size={16} />
                                            </div>
                                        </div>

                                        {/* Employee Details Grid - Collapsible */}
                                        {isExpanded && (
                                            <>
                                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300 mt-6'>
                                                    {/* Personal Information */}
                                                    <div className='space-y-3'>
                                                        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                                                            <User size={18} className='text-[var(--primary-color)]' />
                                                            Personal Information
                                                        </h4>
                                                        <div className='space-y-2 text-sm'>
                                                            {employee.country && (
                                                                <div className='flex items-center gap-2'>
                                                                    <MapPin size={14} className='text-gray-400' />
                                                                    <span>{employee.country},{employee.city}</span>
                                                                </div>
                                                            )}
                                                            {employee.address && (
                                                                <div className='flex items-center gap-2'>
                                                                    <MapPin size={14} className='text-gray-400' />
                                                                    <span>{employee.address}</span>
                                                                </div>
                                                            )}
                                                            {employee.state && (
                                                                <div className='flex items-center gap-2'>
                                                                    <MapPin size={14} className='text-gray-400' />
                                                                    <span>State: {employee.state}</span>
                                                                </div>
                                                            )}
                                                            {employee.contactNumber && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Phone size={14} className='text-gray-400' />
                                                                    <span>{employee.contactNumber}</span>
                                                                </div>
                                                            )}
                                                            {employee.gender && (
                                                                <div className='flex items-center gap-2'>
                                                                    <User size={14} className='text-gray-400' />
                                                                    <span>Gender: {employee.gender}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Professional Information */}
                                                    <div className='space-y-3'>
                                                        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                                                            <Briefcase size={18} className='text-[var(--primary-color)]' />
                                                            Professional Details
                                                        </h4>
                                                        <div className='space-y-2 text-sm'>
                                                            {employee.company && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Building size={14} className='text-gray-400' />
                                                                    <span>{employee.company}</span>
                                                                </div>
                                                            )}
                                                            {employee.companyType && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Award size={14} className='text-gray-400' />
                                                                    <span>{employee.companyType}</span>
                                                                </div>
                                                            )}
                                                            {employee.industry && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Briefcase size={14} className='text-gray-400' />
                                                                    <span>Industry: {employee.industry}</span>
                                                                </div>
                                                            )}
                                                            {employee.website && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Building size={14} className='text-gray-400' />
                                                                    <a href={employee.website} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline'>
                                                                        {employee.website}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {employee.establishedDate && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Calendar size={14} className='text-gray-400' />
                                                                    <span>Est: {formatDate(employee.establishedDate)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Company & Profile Details */}
                                                    <div className='space-y-3'>
                                                        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                                                            <Award size={18} className='text-[var(--primary-color)]' />
                                                            Profile & Status
                                                        </h4>
                                                        <div className='space-y-2 text-sm'>
                                                            {employee.tagline && (
                                                                <div className='flex items-start gap-2'>
                                                                    <Award size={14} className='text-gray-400 mt-0.5' />
                                                                    <span className='font-medium'>Tagline: </span>
                                                                    <span>{employee.tagline}</span>
                                                                </div>
                                                            )}
                                                            {employee.isCompany !== undefined && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Building size={14} className='text-gray-400' />
                                                                    <span>Type: {employee.isCompany ? 'Company' : 'Individual Employee'}</span>
                                                                </div>
                                                            )}
                                                            {employee.profileScore !== undefined && (
                                                                <div className='flex items-center gap-2'>
                                                                    <Award size={14} className='text-gray-400' />
                                                                    <span>Profile Score: {employee.profileScore}</span>
                                                                </div>
                                                            )}
                                                            {employee.profileStatus && (
                                                                <div className='flex items-center gap-2'>
                                                                    <span className={`px-2 py-1 text-xs rounded ${employee.profileStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {employee.profileStatus}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {employee.reviewStatus && (
                                                                <div className='flex items-center gap-2'>
                                                                    <span className={`px-2 py-1 text-xs rounded ${employee.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                                        employee.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                            employee.reviewStatus === 'underReview' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        Review: {employee.reviewStatus}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Additional Information */}

                                                </div>
                                                {(employee.about || employee.banner || employee.profilePicture) && (
                                                    <div className='mt-6 pt-6 border-t border-gray-200'>
                                                        <h4 className='font-medium text-gray-900 mb-3'>Additional Information</h4>
                                                        <div className='space-y-2 text-sm'>
                                                            {employee.about && (
                                                                <div>
                                                                    <span className='font-medium text-gray-700'>About: </span>
                                                                    <span className='text-gray-600'>{employee.about}</span>
                                                                </div>
                                                            )}
                                                            {employee.profilePicture && (
                                                                <div>
                                                                    <span className='font-medium text-gray-700'>Profile Picture: </span>
                                                                    <a href={employee.profilePicture} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline'>
                                                                        View Image
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {employee.banner && (
                                                                <div>
                                                                    <span className='font-medium text-gray-700'>Banner: </span>
                                                                    <a href={employee.banner} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline'>
                                                                        View Banner
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {employee.followers !== undefined && (
                                                                <div>
                                                                    <span className='font-medium text-gray-700'>Followers: </span>
                                                                    <span className='text-gray-600'>{employee.followers}</span>
                                                                </div>
                                                            )}
                                                            {employee.sentJobs && employee.sentJobs.length > 0 && (
                                                                <div>
                                                                    <span className='font-medium text-gray-700'>Jobs Posted: </span>
                                                                    <span className='text-gray-600'>{employee.sentJobs.length}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Registration Date */}
                                                <div className='w-full mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500'>
                                                    <div className='flex items-center gap-2'>
                                                        <Calendar size={14} />
                                                        <span>Registered: {employee.createdAt ? formatDate(employee.createdAt) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default EmployeeProfileRequests