import { useContext, useEffect, useRef, useState } from 'react'
import Search from '../components/Search'
import { Link, useLocation, } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'sonner'
import JobCard from '../components/JobCard'
import Loading from '../components/Loading'
import CoverLetterModal from '../components/CoverLetterModal'

// React Icons
import { MdClear } from "react-icons/md";
import { getCategoryName } from '../utils/categoryNames';
import Navbar from '../components/Navbar'
import Img from '../components/Image'
import '../description.css'
import assets from '../assets/assets'
import Currency from '../components/CurrencyConverter'
import { Calendar, DollarSignIcon, ExternalLink, Filter, GraduationCap, MapPin, Star } from 'lucide-react'
import { openLoginPortal } from '../portals/LoginPortal'
import { openApplyJobPortal } from '../portals/ApplyJobPortal'

const FindJobs = () => {
  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContext)
  const [loading, setLoading] = useState(false);

  // Using Parameters for getting the job
  const search = new URLSearchParams(location.search);
  const query = search.get('job');
  const locationParam = search.get('location') || '';

  console.log('query', query)

  const [searchedCategories, setSearchedCategories] = useState([]);
  const [approvedCategoryJobs, setApprovedCategoryJobs] = useState([]);
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        if (query !== null) {
          const { data } = await axios.get(
            locationParam
              ? `${backendUrl}/api/jobs/searchjobs/${locationParam}?search=${query}`
              : `${backendUrl}/api/jobs/searchjobs?search=${query}`
          );
          if (data.success) {
            setSearchedCategories(data.categorySet);
            setApprovedCategoryJobs(data.approvedJobs);
          }
        } else {
          const { data } = await axios.get(`${backendUrl}/api/jobs/getapprovedjobs`);
          if (data.success) {
            setSearchedCategories(data.categorySet);
            setApprovedCategoryJobs(data.jobs);
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [query, backendUrl]);

  // Enhanced Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const jobTypeParam = search.get("jobtype");

  const [selectedJobTypes, setSelectedJobTypes] = useState(
    jobTypeParam ? [jobTypeParam] : []
  );
  const [selectedLocationTypes, setSelectedLocationTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState([]);
  const filterRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced filtering logic
  const filteredJobs = approvedCategoryJobs?.filter((job) => {
    // Category filter
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(job.category);

    // Job type filter
    const jobTypeMatch = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);

    // Location type filter
    const locationTypeMatch = selectedLocationTypes.length === 0 || selectedLocationTypes.includes(job.locationType);

    // Salary range filter
    const jobSalary = job.salaryType === 'fixed' ? job.fixedSalary : job.maxSalary || job.minSalary || 0;
    const salaryMatch = jobSalary >= salaryRange[0] && jobSalary <= salaryRange[1];

    // Featured filter
    const featuredMatch = !showFeaturedOnly || job.sponsored === true;

    // Recent filter (last 7 days)
    const recentMatch = !showRecentOnly || (new Date() - new Date(job.createdAt)) <= (7 * 24 * 60 * 60 * 1000);

    // Experience level filter
    const experienceMatch = experienceLevel.length === 0 || experienceLevel.includes(job.experience);

    return categoryMatch && jobTypeMatch && locationTypeMatch && salaryMatch && featuredMatch && recentMatch && experienceMatch;
  });

  const [toggleApplyJob, setToggleApplyJob] = useState(false)
  const [applJobId, setapplJobId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const applyJob = async (id) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/applyjob', { jobId: id, resume: userData?.resume, coverLetter: coverLetter });

      if (data.success) {
        toast.success(data.message);
        setToggleApplyJob(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  // Login Reminder Pop Up
  const [loginReminder, setLoginReminder] = useState(false);

  // Filter helper functions
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleJobTypeChange = (jobType) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(t => t !== jobType)
        : [...prev, jobType]
    );
  };

  const handleExperienceChange = (experience) => {
    setExperienceLevel(prev =>
      prev.includes(experience)
        ? prev.filter(e => e !== experience)
        : [...prev, experience]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedJobTypes([]);
    setSelectedLocationTypes([]);
    setSalaryRange([0, 200000]);
    setShowFeaturedOnly(false);
    setShowRecentOnly(false);
    setExperienceLevel([]);
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length + selectedJobTypes.length + selectedLocationTypes.length +
      (showFeaturedOnly ? 1 : 0) + (showRecentOnly ? 1 : 0) + experienceLevel.length;
  };

  // Selected job for inline details
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (filteredJobs && filteredJobs.length > 0) {
      setSelectedJob((prev) => {
        if (prev && filteredJobs.some((j) => j._id === prev._id)) return prev;
        return filteredJobs[0];
      });
    } else {
      setSelectedJob(null);
    }
  }, [filteredJobs]);

  // Loading
  if (loading) {
    return <Loading />
  }

  return (
    <div className={``}>
      <div className={`${isFilterOpen ? "bg-black/80 " : "hidden"} w-full h-full fixed top-0 left-0 z-9998`} />
      <Navbar />
      <main className='min-h-[calc(100vh-4.6rem)] flex flex-col bg-gray-50'>
        {/* Search Header */}
        <div className='h-80 relative flex gap-3 flex-col items-center justify-center'>
          <h1 className='relative z-1 text-4xl text-white'>
            Find Your Dream Jobs
          </h1>
          <Img src={assets.find_jobs_banner} style="absolute z-0 top-0 left-0 w-full h-full" />
          <div className='sticky top-0 z-10 px-6 py-4'>
            <Search Param={query} LocationParam={locationParam} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full max-w-7xl my-10 mx-auto flex-1 h-full">
          {/* Sidebar Filters - 30% width */}
          <div ref={filterRef} className={`fixed transition-all bg-white  border-gray-200  h-screen overflow-y-auto top-0 left-0 z-9999 ${isFilterOpen ? 'w-[75%] lg:w-[25%] p-6 border-r' : 'w-0 py-6 px-0'}`}>
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <p className='text-md flex items-center gap-2'>
                    Filters
                  </p>
                  {getActiveFiltersCount() > 0 && (
                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </h2>
                {getActiveFiltersCount() > 0 && (
                  <span
                    onClick={clearAllFilters}
                    className='text-sm text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer'
                  >
                    <MdClear size={16} />
                    Clear All
                  </span>
                )}
              </div>

              <hr className='border-gray-300' />

              <div className='space-y-3'>
                <h4 className='text-md uppercase font-medium text-gray-400'>
                  Salary Range
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>-</span>
                    <span>${salaryRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={salaryRange[1]}
                    onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type="number"
                      placeholder="Min"
                      value={salaryRange[0]}
                      onChange={(e) => setSalaryRange([parseInt(e.target.value) || 0, salaryRange[1]])}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={salaryRange[1]}
                      onChange={(e) => setSalaryRange([salaryRange[0], parseInt(e.target.value) || 200000])}
                    />
                  </div>
                </div>
              </div>
              <hr className='border-gray-300' />

              <div className='space-y-3'>
                <h4 className='text-md uppercase font-medium text-gray-400'>
                  Categories
                </h4>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {searchedCategories?.map((category, index) => (
                    <label key={index} className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className='text-sm text-gray-700'>{getCategoryName(category)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <hr className='border-gray-300' />

              <div className='space-y-3'>
                <h4 className='text-md uppercase font-medium text-gray-400'>
                  Job Type
                </h4>
                <div className='space-y-2'>
                  {['full-time', 'part-time', 'contract', 'internship', 'temporary'].map((jobType) => (
                    <label key={jobType} className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                      <input
                        type="checkbox"
                        checked={selectedJobTypes.includes(jobType)}
                        onChange={() => handleJobTypeChange(jobType)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className='text-sm text-gray-700 capitalize'>
                        {jobType.split('-').join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className='border-gray-300' />

              <div className='space-y-3'>
                <h4 className='text-md uppercase font-medium text-gray-400'>
                  Experience Level
                </h4>
                <div className='space-y-2'>
                  {['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map((experience) => (
                    <label key={experience} className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                      <input
                        type="checkbox"
                        checked={experienceLevel.includes(experience)}
                        onChange={() => handleExperienceChange(experience)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className='text-sm text-gray-700'>{experience}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className='border-gray-300' />

              <div className='space-y-3'>
                <h4 className='text-md uppercase font-medium text-gray-400'>Special Filters</h4>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className='text-sm text-gray-700 flex items-center gap-2'>
                      Featured Jobs Only
                    </span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                    <input
                      type="checkbox"
                      checked={showRecentOnly}
                      onChange={(e) => setShowRecentOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className='text-sm text-gray-700 flex items-center gap-2'>
                      Recent Jobs (Last 7 days)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs list - left column */}
          <div className='w-full lg:w-[40%] p-3 border-r border-gray-100'>
            <div className='space-y-6'>
              {/* Results Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 flex items-center gap-2 cursor-pointer' onClick={() => setIsFilterOpen(true)}>
                    <Filter size={17} />
                    <span className='hover:text-[var(--primary-color)] ' >
                      Filter
                    </span>
                    {filteredJobs.length} jobs
                  </p>
                </div>
              </div>

              {/* Jobs List */}
              <div className='flex flex-col gap-6 '>
                {filteredJobs.length !== 0 ? filteredJobs
                  ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))?.map((job, index) => (
                    <div key={job._id}>
                      <div onClick={(e) => {
                        e.stopPropagation()
                        setSelectedJob(job)
                      }} >
                        <div className={`${selectedJob?._id === job?._id ? "border-2" : job?.sponsored ? 'border-2 border-yellow-300' : ''} transition-all rounded-2xl border-[var(--primary-color)]`}>
                          <JobCard
                            setLoginReminder={setLoginReminder}
                            setToggleApplyJob={setToggleApplyJob}
                            setapplJobId={setapplJobId}
                            e={job}
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                  <div className='col-span-full'>
                    No Jobs Found
                  </div>
                )
                }
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className='hidden lg:block w-[60%] p-2'>
            {selectedJob ? (
              <div className='space-y-6 bg-white rounded-3xl border border-gray-200 p-6'>
                {/* Job Header */}
                <div className='p-4'>
                  <div className='flex flex-col items-start gap-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-16 h-16 rounded-full'>
                        {selectedJob.companyProfile ? (
                          <Img
                            style="w-16 h-16 rounded-full object-cover border border-gray-100 flex-shrink-0"
                            src={selectedJob.companyProfile || "/placeholder.png"}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 text-[var(--primary-color)] font-bold text-xl flex-shrink-0"
                          >
                            {selectedJob.company?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-2xl text-gray-900 mb-1 capitalize'>{selectedJob.title}</h4>
                        <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2'>
                          <span className='font-medium'>by <b>{selectedJob.company}</b></span>
                          {[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location ? (
                            <>
                              <span>in</span>
                              <span>{[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location}</span>
                            </>
                          ) : null}
                          {selectedJob.category && (
                            <>
                              <span>in</span>
                              <span className='text-green-700 font-medium'>{getCategoryName(selectedJob.category)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-between w-full'>
                      <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
                        {[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location ? (
                          <span className='px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium'>
                            {[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.location}
                          </span>
                        ) : null}
                        {selectedJob.locationType && (
                          <span className='px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium'>
                            {selectedJob.locationType.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-4 hover:text-[var(--primary-color)] transition-all duration-200 underline underline-offset-4'>
                        <Link className='flex items-center gap-2' to={`/jobs/${selectedJob.category}/${selectedJob.slug}`}>View Details <ExternalLink size={16} /></Link>
                        <button
                          onClick={() => {
                            if (!userData) {
                              openLoginPortal();
                              return;
                            }
                            openApplyJobPortal(selectedJob, selectedJob._id);
                          }}
                          className='primary-btn'
                        >
                          Apply now
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-2'>

                      {selectedJob.applicationDeadline && (
                        <span className='text-xs text-gray-500'>
                          Closing on {new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                          {new Date(selectedJob?.createdAt).toLocaleDateString('en-US', {
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
                          {selectedJob?.applicationDeadline ?
                            new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', {
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
                        <div className='text-sm text-gray-500'>{[selectedJob?.city, selectedJob?.state, selectedJob?.country].filter(Boolean).join(', ') || selectedJob?.location || 'Remote'}</div>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                        <GraduationCap size={24} className='text-[var(--primary-color)]' />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='text-sm font-semibold text-black'>Experience</div>
                        <div className='text-sm text-gray-500'>{selectedJob?.experience || 'Bachelor Degree'}</div>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                        <Star size={24} className='text-[var(--primary-color)]' />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='text-sm font-semibold text-black'>Qualification</div>
                        <div className='text-sm text-gray-500'>{selectedJob?.qualification || 'Bachelor Degree'}</div>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                        <DollarSignIcon size={24} className='text-[var(--primary-color)]' />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='text-sm font-semibold text-black'>Salary</div>
                        <div className='text-sm text-gray-500'>
                          {selectedJob?.salaryType === "fixed" ? <span>
                            <Currency amount={selectedJob?.fixedSalary} from={selectedJob?.currency} />
                          </span> : <span>

                            <Currency amount={selectedJob?.minSalary} from={selectedJob?.currency} /> - <Currency amount={selectedJob?.maxSalary} from={selectedJob?.currency} /></span>}
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
                    <div className='description' style={{ maxHeight: '70vh', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: selectedJob?.description }} />
                  </div>
                </div>

                {/* Skills */}
                {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 && (
                  <div className='p-4'>
                    <h2 className='text-lg font-medium text-gray-900 mb-3'>Skills</h2>
                    <div className='flex flex-wrap gap-2'>
                      {selectedJob.skills.map((skill, idx) => (
                        <span key={idx} className='px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='h-full flex items-center justify-center text-sm text-gray-500'>
                Select a job from the list to view its details.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Apply Job Modal */}
      <CoverLetterModal
        isOpen={toggleApplyJob}
        onClose={() => setToggleApplyJob(false)}
        coverLetter={coverLetter}
        setCoverLetter={setCoverLetter}
        onApply={() => applyJob(applJobId)}
      />
    </div>
  )
}
export default FindJobs;