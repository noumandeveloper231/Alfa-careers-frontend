import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Lucide React Icons for consistency (replacing mixed imports)
import { Heart, MapPin, Crown } from 'lucide-react';
import Img from './Image';
import Currency from './CurrencyConverter';
import { getCategoryName } from '../utils/categoryNames';

const toSlug = (str) => (str || '').toLowerCase().replace(/\s+/g, '-')

const JobCard = ({ e }) => {
    const { toggleSaveJob, savedJobs, userData } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation()

    // Check if job is saved or applied
    const isSaved = [...savedJobs].includes(e?._id);

    return (
        <Link
            className={`
    p-6 cursor-pointer border border-gray-200 bg-white rounded-2xl hover:shadow-lg shadow-black/5
    transition-all duration-300 flex flex-col justify-between gap-4
    min-w-full sm:min-w-[250px] md:min-w-[300px]
  `}
            to={location.pathname !== '/jobs' ? `/jobs/${toSlug(e.category || '')}/${e.slug || ''}` : undefined}
        >
            <div className='flex flex-col gap-4'>
                {/* 1. Header: Company Info and Save Button */}
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0'>
                    <div className='flex items-center gap-4 bg-white'>
                        {e?.postedBy?.profilePicture ? (
                            <img
                                className='w-14 h-14 rounded-full object-cover bg-white flex-shrink-0'
                                src={e?.postedBy?.profilePicture}
                            />
                        ) : (
                            <button
                                onClick={(ev) => {
                                    ev.preventDefault();  // stops the outer <Link> navigation
                                    ev.stopPropagation(); // stops bubbling to parent handlers
                                    navigate(`/companies/${e?.postedBy?.category}/${e?.postedBy?.slug}`);
                                }}
                                className='font-semibold capitalize'
                            >
                                {e?.company}
                            </button>
                        )}

                        {/* Company Name & Category */}
                        <div className='flex flex-col'>
                            <h4 className='capitalize font-semibold text-lg text-gray-800 line-clamp-1'>
                                {e?.title || 'Title Here'}
                            </h4>
                            <span className='text-md text-gray-500 line-clamp-1'>
                                by <button
                                    onClick={(ev) => {
                                        ev.preventDefault();  // stops the outer <Link> navigation
                                        ev.stopPropagation(); // stops bubbling to parent handlers
                                        navigate(`/companies/${e?.postedBy?.category}/${e?.postedBy?.slug}`);
                                    }}
                                    className='font-semibold capitalize'>{e?.postedBy?.company || userData?.company || 'Company Name Here'}</button> in{' '}
                                <button
                                    onClick={(ev) => {
                                        ev.preventDefault();  // stops the outer <Link> navigation
                                        ev.stopPropagation(); // stops bubbling to parent handlers
                                        navigate(`/categories/${toSlug(e?.category)}`);
                                    }}
                                    className='font-semibold text-[var(--primary-color)]'
                                >
                                    {getCategoryName(e?.category) || 'Category Here'}
                                </button>
                            </span>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        {/* Save Button */}
                        {e?.sponsored && (
                            <Crown className='text-yellow-500' />
                        )}
                        <button
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                toggleSaveJob(e?._id)
                            }}
                            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0
          ${isSaved
                                    ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 shadow-md'
                                    : 'text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-200'
                                }`}
                            aria-label={isSaved ? 'Unsave job' : 'Save job'}
                        // disabled={!isLoggedIn}
                        >
                            {isSaved ? <Heart size={24} fill='white' /> : <Heart size={24} />}
                        </button>
                    </div>
                </div>

                {/* 2. Job Info */}
                <div className='flex flex-col gap-2 mt-2'>
                    <div className='flex flex-wrap items-center gap-2 font-semibold text-xs'>
                        <button onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            navigate(`${'/jobs?jobtype=' + e?.jobType}`)
                        }} className='capitalize cursor-pointer flex px-3 py-1 rounded-full bg-[#e9e0f2] text-[#6c4cbe]'>
                            {e?.jobType?.replace('-', ' ') || 'Job Type Here'}
                        </button>
                        <button onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            navigate(`/jobs?location=${encodeURIComponent(e?.location || '')}`)
                        }} className='capitalize cursor-pointer flex gap-1 items-center px-3 py-1 rounded-full bg-[var(--accent-color)] text-[var(--primary-color)]'>
                            <MapPin size={14} /> {[e?.city, e?.state, e?.country].filter(Boolean).join(', ') || e?.location || 'Location Here'}
                        </button>
                        <button className='capitalize cursor-pointer w-max px-3 py-1 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]'>
                            {e?.salaryType === 'fixed' && e?.fixedSalary ? (
                                <Currency amount={e?.fixedSalary} from={e?.currency} />
                            ) : e?.minSalary && e?.maxSalary ? (
                                <>
                                    <Currency amount={e?.minSalary} from={e?.currency} /> -{' '}
                                    <Currency amount={e?.maxSalary} from={e?.currency} />
                                </>
                            ) : 'Salary Here'}
                        </button>
                    </div>
                </div>

                {/* 3. Footer */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mt-2 pt-3 gap-2 sm:gap-0'>
                    <span>
                        {(() => {
                            const deadline = e?.applicationDeadline
                                ? new Date(e.applicationDeadline)
                                : e?.closingDays
                                    ? new Date(Date.now() + e.closingDays * 24 * 60 * 60 * 1000)
                                    : null
                            if (!deadline) return 'Deadline Here'
                            const diff = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))
                            return diff > 0 ? (
                                <div>
                                    <span className='font-semibold text-[var(--primary-color)]'>{diff} </span> days left to apply
                                </div>
                            ) : (
                                'Deadline passed'
                            )
                        })()}
                    </span>
                </div>
            </div>
        </Link >
    );
}

export default JobCard;