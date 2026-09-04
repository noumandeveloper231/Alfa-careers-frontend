import { Suspense, lazy, useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import Img from "../components/Image";
const Search = lazy(() => import("../components/Search"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const LatestJobs = lazy(() => import("../components/LatestJobs"));
const BlogsSection = lazy(() => import("../components/BlogsSection"));
import { Link, useNavigate } from "react-router-dom";

// Swiper Slides
import 'swiper/css';
import 'swiper/css/autoplay';
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { Bell, FileText, Timer, X } from "lucide-react";
import AnnouncementBar from "../components/AnnouncementBar";
import CompanySection from "../components/CompanySection";
import AnimatedText from "../components/AnimatedText";
import Loading from "../components/Loading";
import { getCategoryIcon } from "../utils/categoryIcons";
import { FaExclamation } from "react-icons/fa";

const Home = () => {
  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  const navigate = useNavigate();

  const { isSearchOpen, setIsSearchOpen, backendUrl } = useContext(AppContext);
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const [categories, setCategories] = useState([])
  const getCategories = async () => {
    setCategoriesLoading(true)
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/categories');
      if (data.success) {
        setCategories(data.categories)
        setCategoriesLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([])
  const getJobs = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(backendUrl + '/api/jobs/getalljobs');
      if (data.success) {
        setJobs((data.jobs || []).filter(job => job.approved === "approved"))
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getCategories()
    getJobs();
  }, [])

  if (loading || categoriesLoading) {
    return <Loading />
  }

  const jobsCount = Math.min(jobs.length, 20);
  const speed = jobsCount * 5;
  return (
    <>
      <AnnouncementBar />
      <main>
        <section className={`overflow-hidden bg-cover bg-center relative`} style={{ backgroundImage: `url(${assets.hero})` }}>
          <div className="max-w-7xl mx-auto border-gray-200 w-full absolute top-0 left-1/2 -translate-x-1/2 z-999">
            <Navbar />
          </div>
          <div className="max-w-7xl mx-auto py-4 px-4 md:px-6 lg:px-8 pt-30 lg:p-0 h-full items-center grid grid-cols-1 md:grid-cols-2">
            {/* Main Content */}
            <div className="relative z-20 w-full">
              <div className="mb-4 text-lg">
                <b>12k</b> jobs in {" "}
                <b>200</b> locations
              </div>

              <div className="text-3xl md:text-5xl font-semibold text-gray-800 leading-tight">
                Your <AnimatedText /> is just a<br />
                search away!
              </div>

              <Suspense fallback={<div>Loading...</div>}>
                <div className="my-4">
                  <Search />
                </div>
              </Suspense>

              <div className="mt-6">
                <span className="text-gray-600 text-md">Popular Searches: </span>
                <span className="text-[var(--primary-color)] text-md">Experimentation, Marketing Manager</span>
              </div>
            </div>
            <div className="relative h-[700px] overflow-hidden hidden md:block group">
              <div style={{
                animation: `vertical-scroll ${speed}s linear infinite`
              }} className="scroll-vertical group-hover:animate-scroll-vertical-speed-10s group-hover:[animation-play-state:paused]">
                <div className="flex flex-col gap-15">
                  {jobs.slice(0, 20).length > 0 && Array(5).fill(jobs.slice(0, 3)).flat().map((job, index) => {
                    const bgColors = ['bg-[#f9ab85]/90', 'bg-[#fff]/90', 'bg-[#ffd865]/90'];
                    const bgClass = bgColors[index % 3];
                    return (
                      <div
                        key={index}
                        className={`${index % 2 === 0 ? 'ml-10' : 'mr-10'} w-112 rounded-2xl flex flex-col p-4 cursor-pointer gap-2 ${bgClass}`}
                        onClick={() => navigate(`/jobs?job=${encodeURIComponent(job.title)}`)}
                      >
                        <span className="text-gray-600 text-sm">{[job.city, job.state, job.country].filter(Boolean).join(', ') || job.location || 'Remote'}</span>
                        <h4 className="text-black font-semibold text-xl capitalize">{job.title}</h4>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-0">
          <div className="flex flex-col md:flex-row text-center md:text-left items-center gap-4 ">
            <div className="p-5 inline-flex rounded-full bg-[var(--accent-color)]">
              <FileText />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-md font-semibold">
                Create your resume
              </h4>
              <p className="text-sm text-gray-600">
                Upload your resume and let employers find you
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row text-center md:text-left items-center gap-4 ">
            <div className="p-5 inline-flex rounded-full bg-[var(--accent-color)]">
              <Timer />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-md font-semibold">
                Get matched in minutes
              </h4>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row text-center md:text-left items-center gap-4 ">
            <div className="p-5 inline-flex rounded-full bg-[var(--accent-color)]">
              <Bell />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-md font-semibold">
                Never miss an opportunity
              </h4>
              <p className="text-sm text-gray-600">
                Never miss an opportunity to apply for jobs
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />
        {/* Popular Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 ">
            <div className="text-center flex flex-col gap-2 mb-12">
              <h2 className=" font-bold text-gray-900">Popular category</h2>
              <p className="text-gray-600 text-lg">Find and hire professionals across all skills</p>
            </div>


            {
              categories.length === 0 ? (
                <div className="text-center py-5 flex flex-col items-center gap-4">
                  <FaExclamation size={40} />
                  <p className="text-gray-600">No Categories Uploaded</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
                  {categories.slice(0, 6).map((category) => {
                    const Icon = getCategoryIcon(category?.icon);

                    return (
                      <Link
                        key={category._id}
                        to={"/categories/" + category?.slug}
                        className="group bg-[var(--accent-color)] shadow-gray-100 hover:shadow-lg rounded-2xl p-8 cursor-pointer transition-all duration-300 border-gray-200 border flex gap-3"
                      >
                        <div className="w-14 h-14 bg-[var(--primary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon size={24} className="text-white" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {category.name}
                          </h4>

                          <p className="text-gray-500 text-sm">
                            {
                              jobs?.filter(
                                (job) => job.category === category?.slug
                              ).length
                            }{" "}
                            jobs
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            }

            {/* View All Categories Link */}
            <div className="text-center">
              <span
                onClick={() => navigate('/categories')}
                className="text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] font-medium text-md underline underline-offset-6 transition-colors"
              >
                View all categories
              </span>
            </div>
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 ">
            <div className="relative">
              <Suspense fallback={
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
              }>
                <LatestJobs />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Featured Companies */}
        <section className="mt-20 bg-[#f9f9f9] w-full py-20">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <h2 className="text-black font-semibold">
              Featured companies actively hiring
            </h2>
            <div className="flex mt-5 justify-between items-center">
              <p>
                Over 100 million jobs
              </p>
              <Link to="/companies" className="text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] font-medium text-md underline underline-offset-6 transition-colors">View all companies</Link>
            </div>
            <div className="mt-10">
              <CompanySection />
            </div>
          </div>

        </section>

        {/* Post a Job  */}
        <section className="bg-[#faf6eb] relative py-10 z-1">
          <div className="absolute top-1/2 z-0 -translate-1/2 left-1/2 w-full h-full">
            <Img src={assets.wave_bg} style={"w-full h-full"} />
          </div>
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 relative z-2">
            <div className="flex items-center justify-center">
              <Img src={assets.girl_illus} />
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="font-bold text-gray-900 mb-4 leading-tight">
                Discover why more companies are using <span className="text-[var(--primary-color)]">Alfa Careers</span> to make hiring easy
              </h2>

              <p className="text-gray-600 text-lg mb-8 max-w-lg">
                Join the companies that have found their perfect candidates with
                Alfa Careers. Our platform connects you with top talent
                efficiently.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Candidate Applied</p>
                  <p className="text-4xl font-bold text-[var(--primary-color)]">24k+</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Company Reviews</p>
                  <p className="text-4xl font-bold text-[var(--primary-color)]">10k+</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Jobs submitted</p>
                  <p className="text-4xl font-bold text-[var(--primary-color)]">60k+</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Monthly Users</p>
                  <p className="text-4xl font-bold text-[var(--primary-color)]">30k+</p>
                </div>
              </div>

              <button
                className="primary-btn"
                onClick={() => navigate('/employer-landing')}
              >
                Post your job for FREE
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 py-4 w-full mt-20">
          <div className="flex md:w-1/2 text-center mx-auto flex-col items-center gap-2">
            <h2 className="text-black font-semibold">
              Trusted by leading brands and startups
            </h2>
            <p className="text-lg">
              Here’s what they say about us
            </p>
          </div>
          <Suspense fallback={<div>Loading Testimonials Jobs...</div>}>
            <Testimonials />
          </Suspense>
        </section>

        {/* Post a Job 2  */}
        <section className="max-w-7xl border mx-auto p-4 md:p-6 lg:p-8 mt-10 relative w-full rounded-4xl bg-[#faf6eb] pt-15 flex flex-col md:flex-row z-1">
          <div className="absolute top-1/2 left-0 z-0 -translate-y-1/2 w-[60%] h-full">
            <Img src={assets.wave_2} style={"w-full h-full"} />
          </div>
          <div className="md:w-[40%] relative z-1 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <span className="text-[var(--primary-color)] font-semibold text-sm uppercase tracking-wide">
                EMPLOYERS
              </span>
            </div>

            <h2 className="font-semibold text-black mb-6">
              Looking to post a job?
            </h2>

            <p className="text-gray-600 text-lg mb-8 max-w-md">
              Find professionals from around the world and across all skills.
            </p>

            <button
              onClick={() => navigate('/employer-landing')}
              className="primary-btn"
            >
              Post your job for FREE
            </button>
          </div>
          <div className="md:w-[60%] relative z-1">
            <Img src={assets.post_job} style="" />
          </div>
        </section>


        {/* Blogs */}
        <section className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 py-4 w-full mt-20">
          <div className="flex md:w-1/2 text-center mx-auto flex-col items-center gap-2">
            <h2 className="font-semibold text-black">
              Latest from our blog
            </h2>
            <p className="text-lg">
              Get interesting insights, articles, and news
            </p>
          </div>
          <Suspense fallback={<div>Loading Featured Jobs...</div>}>
            <BlogsSection className={'grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-3'} />
          </Suspense>
        </section>
      </main>
      {isSearchOpen && (
        <div className=" fixed z-999 w-full flex items-center justify-center h-full bg-black/60">
          <X className="absolute top-6 right-6 cursor-pointer z-9999 text-white" onClick={() => setIsSearchOpen(false)} />
          <div className="mx-6 w-full">
            <Search />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;