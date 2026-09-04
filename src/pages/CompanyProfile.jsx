import React, { useContext, useState, useEffect } from 'react';
import { MapPin, Link as LinkIcon, Mail, Phone, Facebook, X, Instagram, Globe, Check, Plus, MessageSquare } from "lucide-react";
import Img from '../components/Image';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';
import { AppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';
import { toast } from 'sonner';
import { getCategoryName } from '../utils/categoryNames';
import Breadcrumbs from '../components/Breadcrumbs';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../description.css";

const CompanyProfile = () => {
  const { slug } = useParams()

  const { backendUrl, userData } = useContext(AppContext);

  const [companyData, setCompanyData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const getCompanyDetails = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/getcompanydetails/${slug}`);
      if (data.success) {
        setCompanyData(data.company);
      } else {
        setCompanyData(null)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getCompanyDetails();
  }, []);

  // 🔔 Trigger profile view count when company data loads
  useEffect(() => {
    if (!companyData?.authId) return;
    const recordView = async () => {
      try {
        await axios.post(`${backendUrl}/api/profile/${companyData.authId}/view`);
      } catch (err) {
        console.error("Company profile view track error", err?.response?.data || err.message);
      }
    };
    recordView();
  }, [companyData?.authId, backendUrl]);

  // Reset to first page whenever company data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [companyData]);

  console.log('companyData', companyData)

  // Pagination calculations
  const totalJobs = companyData?.sentJobs?.length || 0;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const displayedJobs = companyData?.sentJobs?.filter(job => job.approved === "approved")?.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  if (!companyData) {
    return <Loading />
  }

  return (
    <>
      <Navbar />
      <div className="bg-[var(--bg)] min-h-screen py-5 font-sans">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs />
          {/* Company Header Card */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-8 ">
            <div className='lg:col-span-2'>
              {/* Main Content */}
              <div className="bg-white overflow-hidden rounded-2xl border border-gray-100">
                <div className="w-full h-50  md:h-64 overflow-hidden relative">
                  <Img src={companyData.cover || companyData.banner} style="border-b border-gray-200 w-full h-full object-cover" />
                </div>
                {/* Overview */}
                <div className="p-6 relative z-10 mb-8">
                  <div className="flex flex-col items-start justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-18 h-18 rounded-full overflow-hidden ">
                        <Img src={companyData.profilePicture} style="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          {companyData.name || companyData.company}
                          {companyData.isVerified && (
                            <span className="bg-green-100 text-green-600 rounded-full p-0.5">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          )}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {companyData.country || "Not Specified"}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500 font-bold">★ {companyData.rating || "0.0"}</span>
                            ({companyData.reviewsCount || 0} Reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {
                        userData?.role === "user" &&
                        <button
                          className="secondary-btn flex items-center">
                          <Plus size={18} /> {userData?.followedAccounts?.includes(companyData._id) ? "Unfollow" : "Follow"}
                        </button>
                      }
                      <a
                        title='Visit Website'
                        href={companyData?.website} target="_blank" className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        Visit website <LinkIcon size={16} />
                      </a>
                      <button
                        title='Send Message'
                        onClick={() => toast.info("This Feature is not avaible yet")}
                        className="cursor-pointer flex-1 md:flex-none bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[var(--primary-color)]/90 transition-colors flex items-center justify-center gap-2">
                        Send message
                      </button>
                    </div>
                  </div>
                </div>
                <section className='bg-white p-6 border-t border-gray-100 h-60 overflow-clip'>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Overview</h4>
                   <div className='description' dangerouslySetInnerHTML={{ __html: companyData?.about }} />
                </section>
                <section className="bg-white py-20 p-8 h-100 border-t border-gray-200 overflow-clip">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Gallery</h4>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={24}
                    slidesPerView={3}
                    navigation
                    pagination={{ clickable: true }}
                    className="gallery-swiper"
                  >
                    {companyData?.companyImages?.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="overflow-hidden rounded-2xl">
                          <Img
                            src={img}
                            alt="Company gallery"
                            style="w-full h-50 object-cover"
                            willOpen
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>


                  {/* Custom styling */}
                  <style>{`
.gallery-swiper{
                    height: 100%;
}

.gallery-swiper .swiper-button-prev,
.gallery-swiper .swiper-button-next {
color: #374151;
width: 40px;
height: 40px;
padding: 10px;
background: rgba(255,255,255,0.9);
border-radius: 9999px;
box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}


.gallery-swiper .swiper-button-prev::after,
.gallery-swiper .swiper-button-next::after {
font-size: 16px;
font-weight: bold;
color: #374151;
}


.gallery-swiper .swiper-pagination {
bottom: -6px;
}


.gallery-swiper .swiper-pagination-bullet {
background: #d1d5db;
opacity: 1;
}


.gallery-swiper .swiper-pagination-bullet-active {
background: #111827;
}
`}</style>
                </section>
              </div>
              {/* Job Listings */}
              <section className='mt-5 p-6 overflow-hidden rounded-2xl border border-gray-100 bg-white'>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Jobs at {companyData.company}</h2>
                {totalJobs === 0 ? (
                  <p className="text-center text-gray-500">No jobs found.</p>
                ) : (
                  <div className="space-y-4">
                    {displayedJobs.map((job) => (
                      <JobCard key={job._id} e={job} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 mt-8">
                    {/* Previous */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      &lt;
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${currentPage === page ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Information Widget */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Information</h3>
                <div className="space-y-4">
                  <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                    <span className="text-black">Categories</span>
                    <span className="text-[var(--primary-color)] font-medium">{getCategoryName(companyData.category) || companyData.industry}</span>
                  </div>
                  <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                    <span className="text-black">Founded in</span>
                    <span className="text-gray-900 font-medium">{(companyData.foundedIn ? new Date(companyData.foundedIn).getFullYear() : "N/A")}</span>
                  </div>
                  <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                    <span className="text-black">Location</span>
                    <span className="text-gray-900 font-medium">{[companyData.city, companyData.state, companyData.country].filter(Boolean).join(', ') || companyData.location || "N/A"}</span>
                  </div>
                  <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                    <span className="text-black">Phone</span>
                    <span className="text-gray-900 font-medium">{companyData.phone || companyData.contactNumber || "Not Specified"}</span>
                  </div>
                  <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                    <span className="text-black">Email</span>
                    <span className="text-[var(--primary-color)] font-medium">{companyData.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                  <a href={companyData.socials?.facebook || "#"} className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                  <a href={companyData.socials?.x || "#"} className="text-gray-400 hover:text-blue-400 transition-colors"><X size={20} /></a>
                  <a href={companyData.socials?.instagram || "#"} className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram size={20} /></a>
                  <a href={companyData.socials?.linkedin || "#"} className="text-gray-400 hover:text-blue-700 transition-colors"><Globe size={20} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;
