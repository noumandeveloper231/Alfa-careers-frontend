import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
// React Icons
import { toast } from 'sonner';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import Img from '../components/Image';
import '../description.css'
import {
    Briefcase,
    GraduationCap, ExternalLink, Calendar, Star, DollarSignIcon, Mail, MapPin, Users
} from 'lucide-react';
import Currency from '../components/CurrencyConverter';
import Navbar from '../components/Navbar';
import LoginPortal, { openLoginPortal } from '../portals/LoginPortal';
import ApplyJobPortal, { openApplyJobPortal } from '../portals/ApplyJobPortal';
import { FaLevelUpAlt } from 'react-icons/fa';
import BreadCrumbs from '../components/Breadcrumbs'
import { getCategoryName } from '../utils/categoryNames';


const JobDetails = () => {
    // Auto Scroll to top
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const { backendUrl, userData, isLoggedIn } = useContext(AppContext);
    const [loginReminder, setLoginReminder] = useState(false)
    const [jobData, setJobData] = useState(null);
    const [viewMode, setViewMode] = useState('current');
    const [jobLoading, setJobLoading] = useState(false)
    const [companyJobsLoading, setCompanyJobsLoading] = useState(false)
    const [tab, setTab] = useState('Overview');

    const navigate = useNavigate();
    const location = useLocation();
    const { slug } = useParams();

    const searchParams = new URLSearchParams(location.search);
    const showModifications = searchParams.get('view') === 'modifications' && userData?.isAdmin;

    console.log('slug', slug);

    const getJob = async () => {
        setJobLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getjobbyslug/${slug}`);
            if (data.success) {
                setJobData(data.job);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setJobLoading(false)
        }
    }

    const [applyJobModel, setApplyJobModel] = useState(false);

    const [companyJobs, setCompanyJobs] = useState([])
    // Get More Related Jobs;
    const getCompanyJobs = async () => {
        setCompanyJobsLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getcompanyjobs/${jobData?.postedBy?.slug}`);
            if (data.success) {
                setCompanyJobs(data.companyJobs || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setCompanyJobsLoading(false)
        }
    }

    const isModifiedJob = jobData?.approved === "modified" && jobData?.modifiedData && showModifications;

    const isFieldChanged = (fieldKey) => {
        if (!isModifiedJob || viewMode !== 'updated') return false;
        const oldVal = jobData?.[fieldKey];
        const newVal = jobData?.modifiedData?.[fieldKey];
        return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    };

    const changedStyle = (fieldKey) => {
        if (!isFieldChanged(fieldKey)) return {};
        return { boxShadow: '0 0 0 2px #22c55e', borderColor: '#22c55e', borderRadius: '0.375rem' };
    };
    const anyChangedStyle = (...fieldKeys) => {
        if (!isModifiedJob || viewMode !== 'updated') return {};
        const changed = fieldKeys.some(k => JSON.stringify(jobData?.[k]) !== JSON.stringify(jobData?.modifiedData?.[k]));
        return changed ? { boxShadow: '0 0 0 2px #22c55e', borderColor: '#22c55e', borderRadius: '0.375rem' } : {};
    };

    const sourceJobData = isModifiedJob && viewMode === 'updated' ? { ...jobData, ...jobData.modifiedData } : jobData;

    useEffect(() => {
        getJob();
        getCompanyJobs();
    }, [slug])

    if (companyJobsLoading || jobLoading) {
        return <Loading />
    }

    return (
        <div className='bg-[#f9f9f9]'>
            <div className='w-full bg-white'>
                <Navbar />
            </div>
            <main className=' max-w-6xl mx-auto py-5 min-h-screen'>
                {/* Breadcrumb */}
                <BreadCrumbs />
                {/* Modified job toggle */}
                {isModifiedJob && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <span className="text-sm font-medium text-yellow-800">
                            This job has pending modifications. Viewing: <span className="font-semibold">{viewMode === 'current' ? 'Current Live Version' : 'Submitted Changes'}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewMode(viewMode === 'current' ? 'updated' : 'current')}
                            className="px-3 py-1.5 text-xs font-medium border border-yellow-300 rounded-md hover:bg-yellow-100 text-yellow-800"
                        >
                            Show {viewMode === 'current' ? 'Submitted Changes' : 'Current Live Version'}
                        </button>
                    </div>
                )}
                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Left Content */}
                    <div className='col-span-2'>
                        <div className=' space-y-6 bg-white rounded-3xl border border-gray-200 p-6'>
                            {/* Job Header */}
                            <div className='p-4'>
                                <div className='flex flex-col items-start gap-4'>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-16 h-16 rounded-full'>
                                            {jobData?.postedBy?.profilePicture ? (
                                                <Img
                                                    style="w-16 h-16 rounded-full object-cover border border-gray-100 flex-shrink-0"
                                                    src={jobData?.postedBy?.profilePicture}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 text-[var(--primary-color)] font-bold text-xl flex-shrink-0"
                                                >
                                                    {jobData?.postedBy?.company?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <h4 className='text-2xl text-gray-900 mb-1' style={changedStyle('title')}>{sourceJobData?.title}</h4>
                                            <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2'>
                                                <Link to={`/companies/${jobData?.postedBy?.category}/${jobData?.postedBy?.slug}`} className='font-medium'>by <b>{jobData?.postedBy?.company}</b></Link>
                                                {jobData?.category && (
                                                    <>
                                                        <span>in</span>
                                                        <Link target='_blank' to={`/categories/` + sourceJobData?.category} className='text-green-700 font-medium' style={changedStyle('category')}>{getCategoryName(sourceJobData?.category)}</Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between w-full'>
                                        <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
                                            {(sourceJobData?.city || sourceJobData?.location) && (
                                                <Link target='_blank' to={`/jobs?location=${encodeURIComponent(sourceJobData?.city || sourceJobData?.location || '')}`} className='px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium' style={changedStyle('city')}>
                                                    {sourceJobData?.city || sourceJobData?.location}
                                                </Link>
                                            )}
                                            {sourceJobData?.country && (
                                                <span className='px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium'>
                                                    {sourceJobData?.country}
                                                </span>
                                            )}
                                            {sourceJobData?.locationType && (
                                                <span className='px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium'>
                                                    {sourceJobData?.locationType?.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') || ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-end gap-2'>

                                        {sourceJobData?.applicationDeadline && (
                                            <span className='text-xs text-gray-500' style={changedStyle('applicationDeadline')}>
                                                Closing on {sourceJobData?.applicationDeadline ? new Date(sourceJobData.applicationDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-300' />

                            {/* Job Role Insights */}
                            <div className=' p-4'>
                                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Job role insights</h2>
                                <div className='grid md:grid-cols-3 gap-4'>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Calendar size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Date posted</div>
                                            <div className='text-sm text-gray-500'>
                                                {new Date(jobData?.createdAt).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Calendar size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Closing date</div>
                                            <div className='text-sm text-gray-500'>
                                                {sourceJobData?.applicationDeadline ?
                                                    new Date(sourceJobData?.applicationDeadline).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : 'Not specified'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <MapPin size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                        <div className='text-sm font-semibold text-black'>Hiring location</div>
                                        <div className='text-sm text-gray-500' style={changedStyle('city')}>{[sourceJobData?.city, sourceJobData?.state, sourceJobData?.country].filter(Boolean).join(', ') || sourceJobData?.location || 'Remote'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <GraduationCap size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Experience</div>
                                            <div className='text-sm text-gray-500' style={changedStyle('experience')}>{sourceJobData?.experience || 'Bachelor Degree'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Star size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Qualification</div>
                                            <div className='text-sm text-gray-500' style={changedStyle('qualifications')}>{sourceJobData?.qualifications || 'Bachelor Degree'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <DollarSignIcon size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Salary</div>
                                            <div className='text-sm text-gray-500' style={anyChangedStyle('salaryType', 'fixedSalary', 'minSalary', 'maxSalary', 'currency')}>
                                                {sourceJobData?.salaryType === "fixed" ? <span>
                                                    <Currency amount={sourceJobData?.fixedSalary} from={sourceJobData?.currency} />
                                                </span> : <span>
                                                    <Currency amount={sourceJobData?.minSalary} from={sourceJobData?.currency} /> - <Currency amount={sourceJobData?.maxSalary} from={sourceJobData?.currency} /></span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Users size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Quantity</div>
                                            <div className='text-sm text-gray-500' style={changedStyle('quantity')}>
                                                {sourceJobData?.quantity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <FaLevelUpAlt size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Career Level</div>
                                            <div className='text-sm text-gray-500' style={changedStyle('careerLevel')}>
                                                {sourceJobData?.careerLevel} Level
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-300' />

                            {/* Description & Requirements */}
                            <div className='p-4 space-y-6'>
                                <div>
                                    <h4 className='text-2xl font-medium text-gray-900 mb-4'>Description</h4>
                                    <div className={`description ${isFieldChanged('description') ? 'ring-2 ring-green-400 border-green-400 rounded-lg p-2' : ''}`} style={{ maxHeight: '70vh', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: sourceJobData?.description }} />
                                </div>
                            </div>

                            <hr className='border-gray-300' />
                            {/* Skills */}
                            {Array.isArray(sourceJobData?.skills) && sourceJobData?.skills.length > 0 && (
                                <div className='p-4' style={changedStyle('skills')}>
                                    <h2 className='text-lg font-medium text-gray-900 mb-3'>Skills</h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {sourceJobData?.skills.map((skill, idx) => (
                                            <span key={idx} className='px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium'>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {
                            userData?.role !== "employee" &&
                            <div className='bg-[#ecf2f0] p-6 rounded-2xl border border-gray-300 mb-6 justify-between flex items-center mt-10'>
                                <div>
                                    <h4 className='text-2xl font-medium text-gray-900 mb-4'>
                                        Interested in this job?
                                    </h4>
                                    <div className='text-sm text-gray-600 mb-2'>
                                        {Math.ceil((new Date(sourceJobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                            ? `${Math.ceil((new Date(sourceJobData?.applicationDeadline || jobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left`
                                            : 'Deadline passed'}
                                    </div>
                                </div>

                                <button
                                    disabled={userData?.appliedJobs?.includes(jobData?._id)}
                                    onClick={() => {
                                        if (!isLoggedIn) {
                                            openLoginPortal();
                                        } else {
                                            openApplyJobPortal(jobData, jobData?._id);
                                        }
                                    }}
                                    className={`primary-btn ${userData?.appliedJobs?.includes(jobData?._id) && "bg-gray-400 cursor-not-allowed"}`}
                                >
                                    {userData?.appliedJobs?.includes(jobData?._id) ? "Already Applied" : "Apply now"}
                                </button>
                            </div>
                        }

                        <div className=' rounded-2xl p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-medium text-gray-900'>Similar jobs</h2>
                                <Link to="/jobs" className='text-[var(--primary-color)] hover:underline'>
                                    View all jobs
                                </Link>
                            </div>

                            {companyJobs?.length > 0 ?
                                companyJobs?.map(job => (
                                    <JobCard e={job} />
                                )) : (
                                    <div className='text-center py-8'>
                                        <div className='text-gray-400 mb-2'>
                                            <Briefcase size={48} className='mx-auto' />
                                        </div>
                                        <h3 className='font-semibold text-gray-600 mb-1'>No similar jobs found</h3>
                                        <p className='text-gray-500 text-sm'>
                                            No other jobs available from {jobData?.postedBy?.company}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className='lg:col-span-1 w-full'>
                        <div className='w-full sticky top-4'>
                            {
                                userData?.role !== "employee" &&
                                <div className='bg-[#ecf2f0] p-6 rounded-2xl border border-gray-300 mb-6 flex flex-col items-center'>
                                    <h4 className='text-2xl font-medium text-gray-900 mb-4'>
                                        Interested in this job?
                                    </h4>
                                    <div className='text-sm text-gray-600 mb-2'>
                                        {Math.ceil((new Date(sourceJobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                            ? `${Math.ceil((new Date(sourceJobData?.applicationDeadline || jobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left`
                                            : 'Deadline passed'}
                                    </div>
                                    <button
                                        disabled={userData?.appliedJobs?.includes(jobData?._id)}
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                openLoginPortal();
                                            } else {
                                                openApplyJobPortal(jobData, jobData?._id);
                                            }
                                        }}
                                        className={`primary-btn w-full ${userData?.appliedJobs?.includes(jobData?._id) && "bg-gray-400 cursor-not-allowed"}`}
                                    >
                                        {userData?.appliedJobs?.includes(jobData?._id) ? "Already Applied" : "Apply now"}
                                    </button>
                                </div>
                            }

                            {/* Company Info */}
                            <div className='p-6 bg-white  border border-gray-300 rounded-2xl'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <Img src={jobData?.postedBy?.profilePicture} style='w-12 h-12 rounded-full object-cover' />
                                    <div>
                                        <h4 className='font-medium text-gray-900'>{jobData?.postedBy?.company}</h4>
                                        <Link to={`/companies/${jobData?.postedBy?.category}/${jobData?.postedBy?.slug}`} className='text-[var(--primary-color)] font-medium text-md'>
                                            View Company Profile
                                        </Link>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className='flex mb-4 gap-2'>
                                    <button onClick={() => setTab('Overview')} className={`px-4 py-2 text-lg font-medium  ${tab === 'Overview' ? 'border-b-2 border-b-[var(--primary-color)]' : ''}`}>
                                        Overview
                                    </button>
                                    <button onClick={() => setTab('Jobs')} className={`px-4 py-2 text-lg font-medium ${tab === 'Jobs' ? 'border-b-2 border-b-[var(--primary-color)]' : ''}`}>
                                        Jobs <span className='rounded-lg text-[var(--primary-color)] bg-[var(--accent-color)] py-1 px-2 text-sm'>{companyJobs?.length}</span>
                                    </button>
                                </div>

                                {/* Company Details */}
                                <div className='space-y-4'>
                                    {tab === 'Overview' ?
                                        <div className='space-y-3'>
                                            <div>
                                                <div className='text-black'>About</div>
                                                <div className='description' dangerouslySetInnerHTML={{ __html: jobData?.postedBy?.about }} />
                                            </div>

                                            <div>
                                                <div className='text-black'>Category</div>
                                                <div className='font-medium text-sm mt-1 text-[var(--primary-color)]'>{getCategoryName(jobData?.postedBy?.category) || "Tech Startup"}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Company size</div>
                                                <div className='font-medium text-sm mt-1 '>{jobData?.postedBy?.members || '1'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Founded in</div>
                                                <div className='font-medium text-sm mt-1 '>
                                                    {jobData?.postedBy?.foundedIn}
                                                </div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Location</div>
                                                <div className='font-medium text-sm mt-1 '>{jobData?.postedBy?.city || 'Remote'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Phone</div>
                                                <div className='font-medium text-sm mt-1'>{jobData?.postedBy?.contactNumber || '+1234567890'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Email</div>
                                                <div className='font-medium text-sm mt-1'>{jobData?.postedBy?.email || "Not Specified"}</div>
                                            </div>

                                            {jobData?.postedBy?.website && (
                                                <div>
                                                    <div className='text-black'>Website</div>
                                                    <a href={jobData?.postedBy?.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className='font-medium text-[var(--primary-color)] hover:underline flex items-center gap-1'>
                                                        Visit {jobData?.postedBy?.website}
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            )}
                                            {jobData?.postedBy?.email && (
                                                <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                    onClick={() => window.location.href = `mailto:${jobData?.postedBy?.email}`}
                                                >
                                                    <Mail size={16} />
                                                    Send email
                                                </button>
                                            )}

                                            <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                onClick={() => window.location.href = `mailto:${jobData?.postedBy?.email}`}
                                            >
                                                <Mail size={16} />
                                                Send message
                                            </button>
                                        </div>
                                        :
                                        <div className='px-2'>
                                            {(companyJobs || []).map(companyJob => (
                                                <div className='flex flex-col gap-2 py-4 border-b border-gray-300'>
                                                    <h4 className='text-lg font-semibold'>
                                                        {companyJob.title}
                                                    </h4>
                                                    <p className='text-md font-medium text-[var(--primary-color)]'>
                                                        {getCategoryName(companyJob.category)}
                                                    </p>
                                                </div>
                                            ))}
                                            <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                onClick={() => navigate('/jobs')}
                                            >
                                                View All Jobs
                                            </button>
                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <LoginPortal loginReminder={loginReminder} setLoginReminder={setLoginReminder} />

                <ApplyJobPortal jobData={jobData} applyJobModel={applyJobModel} setApplyJobModel={setApplyJobModel} id={jobData?._id} />
            </main>
        </div>

    )
}

export default JobDetails