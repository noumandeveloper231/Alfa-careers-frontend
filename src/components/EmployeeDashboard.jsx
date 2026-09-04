import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'sonner';
// Recharts
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Img from './Image';
import { ClipboardList, ClipboardPenLine, Loader, User } from 'lucide-react';
import ImageCropPortal from '../portals/ImageCropPortal';
import CustomSelect from './CustomSelect'

import { Link, useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { userData, backendUrl, setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  // -------------------- Page Views Chart --------------------
  const [viewPeriod, setViewPeriod] = useState('7');
  const [viewsData, setViewsData] = useState([]);

  const fetchViewsData = async (period) => {
    if (!userData?.authId) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/profile/views/last-${period}-days`);
      if (data.success) {
        // Build array covering each day
        const counts = data.views; // [{ _id:'YYYY-MM-DD', count: n }]
        const days = parseInt(period, 10);
        const today = new Date();
        const formatted = Array.from({ length: days }).map((_, idx) => {
          const d = new Date();
          d.setDate(today.getDate() - (days - 1 - idx));
          const dateKey = d.toISOString().split('T')[0];
          const found = counts.find(v => v._id === dateKey);
          return {
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            views: found ? found.count : 0
          };
        });
        setViewsData(formatted);
      }
    } catch (err) {
      console.error('Views fetch error', err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchViewsData(viewPeriod);
  }, [viewPeriod, userData?.authId]);


  // Crop Portal State
  const [cropPortalOpen, setCropPortalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropConfig, setCropConfig] = useState({
    shape: 'rect',
    aspect: 16 / 9,
    imageType: 'banner'
  });

  const [pictureLoading, setPictureLoading] = useState(false)

  // Handle image selection for profile picture
  const handleProfilePictureSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setCropConfig({
        shape: 'round',
        aspect: 1,
        imageType: 'profile'
      });
      setCropPortalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop complete
  const handleCropComplete = async (croppedBlob) => {
    await uploadProfilePicture(croppedBlob);
  };

  // Upload profile picture
  const uploadProfilePicture = async (blob) => {
    setPictureLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", blob, "profile.jpg");

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/updateprofilepicture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setUserData(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setPictureLoading(false);
    }
  };

  const [Applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false)
  const fetchApplicants = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/fetchapplicants`);
      if (data.success) {
        setApplications(data.applicants);
      } else {
        setApplications([])
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const [Jobs, setJobs] = useState([])

  const jobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`)
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchApplicants();
    jobs()
  }, [])

  return (
    <div className='overflow-y-hidden flex flex-col w-full p-4 md:p-6 bg-white rounded-lg min-h-screen border border-gray-300'>
      {/* Profile Section */}
      <div className='flex items-center gap-6 pb-4'>
        <div className="relative w-20 h-20">
          {/* Profile Circle */}
          <div className="w-20 h-20 border-2 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 text-xl font-semibold">
            {pictureLoading ?
              <span className='animate-spin'><Loader /></span> :
              userData?.profilePicture ? (
                <Img
                  src={userData?.profilePicture}
                  style={"w-full h-full object-cover"}
                />
              ) : (
                userData?.name?.[0] || "?"
              )
            }
          </div>

          {/* Upload Form */}
          <form
            className="mt-2"
          >
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureSelect}
            />
            <label
              htmlFor="profilePicture"
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow"
            >
              <FaCamera className="text-gray-600 text-sm" />
            </label>
          </form>
        </div>

        {/* User Info */}
        <div className='w-1/2'>
          <h4 className='text-2xl md:text-3xl  font-semibold'>
            Welcome Back! {" "}
            <span className="text-[var(--primary-color)]">
              {userData?.company === "Individual" ? userData?.name : userData?.company}
            </span>
          </h4>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 w-full'>
        <Link to={'/dashboard/jobs'} className='hover:shadow-lg shadow-gray-200 transition-all duration-300 ease-in-out  flex justify-between p-6 border border-gray-300 rounded-md items-center'>
          <div className='flex flex-col gap-3'>
            <span className='text-gray-500 font-semibold'>
              POSTED JOBS
            </span>
            <div className='text-5xl text-black font-semibold'>
              {Jobs.length}
            </div>
          </div>
          <div className='p-3 rounded-full h-15 w-15 bg-[#b3e5fb] flex items-center justify-center'>
            <ClipboardPenLine />
          </div>
        </Link>
        <Link to={'/dashboard/applicants'} className='hover:shadow-lg shadow-gray-200 transition-all duration-300 ease-in-out flex justify-between p-6 border border-gray-300 rounded-md items-center'>
          <div className='flex flex-col gap-3'>
            <span className='text-gray-500 font-semibold'>
              APPLICATIONS
            </span>
            <div className='text-5xl text-black font-semibold'>
              {Applications.length}
            </div>
          </div>
          <div className='p-3 rounded-full h-15 w-15 bg-[#cabffd] flex items-center justify-center'>
            <ClipboardList />
          </div>
        </Link>
        <Link to={'/dashboard/candidates'} className='hover:shadow-lg shadow-gray-200 transition-all duration-300 ease-in-out flex justify-between p-6 border border-gray-300 rounded-md items-center'>
          <div className='flex flex-col gap-3'>
            <span className='text-gray-500 font-semibold'>
              MY FOLLOW
            </span>
            <div className='text-5xl text-black font-semibold'>
              {userData?.followersAccounts?.length}
            </div>
          </div>
          <div className='p-3 rounded-full h-15 w-15 bg-[#b7e4cb] flex items-center justify-center'>
            <User />
          </div>
        </Link>
      </div>

      {/* Page Views Chart */}
      <section className="w-full mt-4 flex gap-4">
        <div className="w-[65%] border border-gray-300 rounded-md p-6 h-[500px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Page views</h2>
            <CustomSelect
              value={viewPeriod}
              onChange={(e) => setViewPeriod(e.target.value)}
            >
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </CustomSelect>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="linear" dataKey="views" stroke="#047857" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='w-[35%] border border-gray-300 rounded-md p-6 bg-white'>
          <h2 className='font-medium'>
            New applicants
          </h2>
          <ul className="mt-4 space-y-6">
            {[...Jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3).map(job => {
              const jobApps = Applications.filter(app => app.job?._id === job._id);
              const latestApp = jobApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
              return (
                <li key={job._id} className="border-b last:border-0 border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 mb-2 max-w-[70%] truncate">
                      {job.title}
                    </h3>
                    <span className="bg-[var(--accent-color)] text-[var(--primary-color)] rounded-full px-2 text-sm font-medium">
                      {jobApps.length}
                    </span>
                  </div>
                  {latestApp ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {latestApp.applicant?.profilePicture ? (
                          <Img src={latestApp.applicant.profilePicture} style="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                            {latestApp.applicant?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium leading-none">
                          {latestApp.applicant?.name || 'Candidate'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Applied: {new Date(latestApp.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No applicants yet</p>
                  )}
                </li>
              )
            })}
          </ul>
          <button onClick={() => navigate('/dashboard/applicants')} className="mt-6 w-full py-3 border border-gray-200 rounded-md text-center text-sm font-medium hover:bg-[var(--primary-color)] hover:text-white transition-all duration-200 ease-in-out cursor-pointer">
            All applicants
          </button>
        </div>
      </section>

      {/* Image Crop Portal */}
      <ImageCropPortal
        isOpen={cropPortalOpen}
        onClose={() => setCropPortalOpen(false)}
        imageSrc={selectedImage}
        cropShape={cropConfig.shape}
        aspect={cropConfig.aspect}
        onCropComplete={handleCropComplete}
        requireLandscape={cropConfig.imageType === 'banner'}
        imageType={cropConfig.imageType}
      />
    </div>

  )
}

export default EmployeeDashboard