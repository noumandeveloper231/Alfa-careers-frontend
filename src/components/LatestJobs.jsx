import { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { MdWork } from "react-icons/md";
import JobCard from "./JobCard";
import { FaExclamation } from "react-icons/fa";

const LatestJobs = () => {
  const { backendUrl } = useContext(AppContext);
  const [latestJobs, setLatestJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLatestJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`);
      if (data.success) {
        // Sort by creation date and get the latest 20 jobs (for 5 slides of 4 jobs each)
        const sortedJobs = (data.jobs || [])
          .filter(job => job && job.approved === "approved")
          .filter(job => !job.applicationDeadline || new Date(job.applicationDeadline) > new Date())
          .sort((a, b) => new Date(b.postedAt || b.createdAt) - new Date(a.postedAt || a.createdAt))
          .slice(0, 20);
        setLatestJobs(sortedJobs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLatestJobs();
  }, []);
  // Helper function to group jobs into slides of 4
  const groupJobsIntoSlides = (jobs) => {
    const slides = [];
    for (let i = 0; i < jobs.length; i += 4) {
      slides.push(jobs.slice(i, i + 4));
    }
    return slides;
  };

  const jobSlides = groupJobsIntoSlides(latestJobs);


  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (latestJobs.length === 0) {
    return (
      <>
        <div className="flex flex-col justify-center w-full items-center mb-8">
          <h2 className="font-semibold text-black flex items-center gap-2">
            Latest Jobs
          </h2>
          <span className='text-gray-600 text-lg'>2025 jobs live - {latestJobs.filter(job => new Date(job.createdAt).toDateString() === new Date().toDateString()).length} uploaded today </span>
        </div>
        <div className="text-center py-5 flex flex-col items-center gap-4">
          <FaExclamation size={40} />
          <p className="text-gray-600">No Jobs Uploaded Today.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col justify-center w-full items-center mb-8">
        <span className="text-xl md:text-2xl lg:text-3xl font-semibold">
          Latest jobs
        </span>
        <span className='text-gray-600 text-lg'>2025 jobs live - {latestJobs.filter(job => new Date(job.createdAt).toDateString() === new Date().toDateString()).length} uploaded today </span>
      </div>

      <div className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1} // default
          breakpoints={{
            768: { // md
              slidesPerView: 1, // still 1 slide per view
            },
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-custom',
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          className="pb-16"
        >
          {jobSlides.map((slideJobs, slideIndex) => (
            <SwiperSlide key={slideIndex}>
              <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 gap-6">
                {slideJobs.map((job, jobIndex) => (
                  <div key={job._id || jobIndex} className="w-full">
                    <JobCard e={job} />
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>


        {/* Custom Pagination Dots */}
        <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>
      </div>
    </>
  );
};

export default LatestJobs;
