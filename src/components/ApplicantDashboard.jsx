import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import axios from "axios";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Users,
  Star,
  Calendar,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Loader,
  Phone,
  FileText,
  Tag,
  Globe,
  Home,
  Hash,
  Award,
  GraduationCap,
  Zap,
  DollarSign,
  Camera,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Folder,
  Trophy,
  TrendingUp
} from "lucide-react";
import CustomSelect from "./CustomSelect";
import Loading from "./Loading";
import { calculateProfileScore } from '../../lib/profileScore';

const ApplicantDashboard = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // page views chart state
  const [viewPeriod, setViewPeriod] = useState("7");
  const [viewsData, setViewsData] = useState([]);

  // Get profile recommendations based on calculateProfileScore fields
  const getProfileRecommendations = (user) => {
    if (!user) return [];
    const recommendations = [];

    const check = (field, value, label, icon, points, tab, focusField, bgColor) => {
      if (!value) {
        recommendations.push({ field, label, icon, score: points, tab, focusField, bgColor });
      }
    };

    const checkArray = (field, value, label, icon, points, tab, focusField, bgColor) => {
      if (!value || value.length === 0) {
        recommendations.push({ field, label, icon, score: points, tab, focusField, bgColor });
      }
    };

    // Basic Info
    check('name', user.name?.trim(), 'Add Name', Star, 3, 'basic', 'name', 'bg-[#b7e4cb]');
    check('phone', user.phone?.trim(), 'Add Phone Number', Phone, 3, 'basic', 'phone', 'bg-[#caffbf]');
    check('currentPosition', user.currentPosition?.trim(), 'Add Current Position', Briefcase, 3, 'basic', 'currentPosition', 'bg-[#cabffd]');
    check('description', user.description?.trim(), 'Add Description', FileText, 5, 'basic', 'description', 'bg-[#ffd6a5]');
    check('dob', user.dob, 'Add Date of Birth', Calendar, 3, 'basic', 'dob', 'bg-[#ffadad]');
    check('gender', user.gender?.trim(), 'Add Gender', Star, 2, 'basic', 'gender', 'bg-[#bdb2ff]');
    check('age', user.age?.trim(), 'Add Age Range', Star, 2, 'basic', 'age', 'bg-[#9bf6ff]');
    check('userName', user.userName?.trim(), 'Add Username', Star, 2, 'basic', 'userName', 'bg-[#ffc6ff]');
    check('category', user.category?.trim(), 'Add Job Category', Tag, 3, 'basic', 'category', 'bg-[#caffbf]');
    checkArray('language', user.language?.length > 0, 'Add Languages', Globe, 3, 'basic', 'language', 'bg-[#9bf6ff]');
    check('salaryType', user.salaryType?.trim(), 'Add Salary Type', DollarSign, 3, 'basic', 'salaryType', 'bg-[#b7e4cb]');
    check('qualification', user.qualification?.trim(), 'Add Qualification', GraduationCap, 5, 'basic', 'qualification', 'bg-[#b7e4cb]');
    check('experienceYears', user.experienceYears?.trim(), 'Add Experience Years', Clock, 5, 'basic', 'experienceYears', 'bg-[#cabffd]');
    checkArray('skills', user.skills?.length >= 2, 'Add Skills (min 2)', Zap, 5, 'skills', 'skills', 'bg-[#ffd6a5]');
    check('offeredSalary', user.offeredSalary > 0, 'Add Expected Salary', DollarSign, 5, 'basic', 'offeredSalary', 'bg-[#ffadad]');

    // Media
    check('profilePicture', user.profilePicture?.trim(), 'Add Profile Picture', Camera, 4, 'basic', 'profilePicture', 'bg-[#caffbf]');
    check('coverImage', user.coverImage?.trim(), 'Add Cover Image', ImageIcon, 3, 'basic', 'coverImage', 'bg-[#9bf6ff]');
    check('videoUrl', user.videoUrl?.trim(), 'Add Video Introduction', Video, 23, 'basic', 'videoUrl', 'bg-[#fdffb6]');

    // Location
    check('address', user.address?.trim(), 'Add Address', Home, 3, 'basic', 'address', 'bg-[#fdffb6]');
    check('city', user.city?.trim(), 'Add City', MapPin, 3, 'basic', 'city', 'bg-[#ffc6ff]');
    check('country', user.country?.trim(), 'Add Country', MapPin, 3, 'basic', 'country', 'bg-[#bdb2ff]');
    check('postal', user.postal?.trim(), 'Add Postal Code', Hash, 1, 'basic', 'postal', 'bg-[#b7e4cb]');

    // Experience & Education
    checkArray('education', user.education?.length > 0, 'Add Education', GraduationCap, 5, 'education', 'education', 'bg-[#a0c4ff]');
    checkArray('experience', user.experience?.length > 0, 'Add Work Experience', Briefcase, 5, 'experience', 'experience', 'bg-[#b7e4cb]');

    // Projects & Awards
    checkArray('projects', user.projects?.length > 0, 'Add Projects', Folder, 3, 'projects', 'projects', 'bg-[#cabffd]');
    checkArray('awards', user.awards?.length > 0, 'Add Awards', Trophy, 2, 'awards', 'awards', 'bg-[#ffd6a5]');

    // Social Links
    let socialCount = 0;
    if (user.linkedin?.trim()) socialCount++;
    if (user.x?.trim()) socialCount++;
    if (user.facebook?.trim()) socialCount++;
    if (user.instagram?.trim()) socialCount++;
    if (user.youtube?.trim()) socialCount++;
    if (user.tiktok?.trim()) socialCount++;
    if (user.github?.trim()) socialCount++;
    if (user.customSocialNetworks?.length > 0) {
      socialCount += user.customSocialNetworks.filter(s => s.url?.trim()).length;
    }
    if (socialCount < 2) {
      recommendations.push({ field: 'social', label: 'Add Social Links (min 2)', icon: Users, score: 5, tab: 'basic', focusField: 'linkedin', bgColor: 'bg-[#ffadad]' });
    }

    return recommendations;
  };

  const recommendations = getProfileRecommendations(userData);
  const totalPotentialScore = recommendations.reduce((sum, rec) => sum + rec.score, 0);

  const handleRecommendationClick = (recommendation) => {
    if (recommendation?.focusField === "resume") {
      navigate('/dashboard/resume?focusField=resume')
    } else {
      navigate('/dashboard/profile?tab=' + recommendation.tab + (recommendation.focusField ? ('&focusField=' + recommendation.focusField) : ''));
    }
  };

  const fetchViewsData = async (period) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/profile/views/last-${period}-days`);
      if (data.success) {
        const counts = data.views;
        const days = parseInt(period, 10);
        const today = new Date();
        const formatted = Array.from({ length: days }).map((_, idx) => {
          const d = new Date();
          d.setDate(today.getDate() - (days - 1 - idx));
          const key = d.toISOString().split("T")[0];
          const found = counts.find((v) => v._id === key);
          return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), views: found ? found.count : 0 };
        });
        setViewsData(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/dashboard-stats`);
        if (data.success) {
          setStats(data.stats);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchViewsData(viewPeriod);
  }, [backendUrl, viewPeriod]);

  useEffect(() => {
    fetchViewsData(viewPeriod);
  }, [viewPeriod]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg border border-gray-300" >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium text-gray-900">Welcome back, {userData?.name}!</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        {/* My Following */}
        <Link to={'/dashboard/jobs'} className="hover:shadow-lg shadow-gray-200 transition-all flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MY FOLLOWING</span>
            <div className="text-5xl text-black font-semibold">{stats?.following || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#b7e4cb] flex items-center justify-center">
            <Users size={28} />
          </div>
        </Link>

        {/* My Reviews */}
        <Link to={"/"} className="hover:shadow-lg shadow-gray-200 transition-all pointer-events-none flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MY REVIEWS</span>
            <div className="text-5xl text-black font-semibold">{stats?.reviews || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#cabffd] flex items-center justify-center">
            <Star size={28} />
          </div>
        </Link>

        {/* Meetings */}
        <Link to={"/"} className="hover:shadow-lg shadow-gray-200 transition-all pointer-events-none flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MEETINGS</span>
            <div className="text-5xl text-black font-semibold">{stats?.meetings || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#b3e5fb] flex items-center justify-center">
            <Calendar size={28} />
          </div>
        </Link>
      </div>


      {/* Page Views & Recently Applied */}
      <section className="w-full mt-4 flex gap-4">
        {/* Page Views Chart */}
        <div className="w-[65%] border border-gray-300 rounded-md p-6 h-[500px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Page views</h2>
            <CustomSelect value={viewPeriod} onChange={(e) => setViewPeriod(e.target.value)}>
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
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line type="linear" dataKey="views" stroke="#047857" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recently Applied Jobs */}
        <div className="w-[35%] border border-gray-300 rounded-md p-6 bg-white">
          <h2 className="font-medium">Recently applied</h2>
          {stats?.recentApplications?.length > 0 ? (
            <ul className="mt-4 space-y-6">
              {stats.recentApplications.slice(0, 3).map((app) => (
                <li key={app._id} className="border-b last:border-0 border-gray-100 pb-4">
                  <div className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {app.job?.postedBy?.profilePicture ? (
                          <img
                            src={app.job.postedBy.profilePicture}
                            alt={app.job.postedBy.company}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 size={24} />
                          </div>
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {app.job?.title}
                            </h3>
                            <p className="text-sm text-gray-500">{app.job?.postedBy?.company}</p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                            ${app.status === "shortlisted"
                                ? "bg-green-100 text-green-700"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{app.job?.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={14} />
                            <span>{app.job?.jobType}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">You haven't applied to any jobs yet.</div>
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="w-full mt-6">
          <div className="border border-gray-300 rounded-md p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Boost Your Profile</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete these sections to increase your profile score by
                  <span className="font-semibold text-green-600 ml-1">+{totalPotentialScore} points</span>
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] rounded-lg border border-[var(--primary-color)]/50">
                <TrendingUp size={20} className="text-[var(--primary-color)]" />
                <span className="text-sm font-medium text-[var(--primary-color)]">Improve Score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {recommendations.map((rec) => {
                const IconComponent = rec.icon;
                return (
                  <div
                    key={rec.field}
                    className="border border-gray-200 rounded-2xl p-4 hover:shadow-xl shadow-gray-200 transition-all duration-200 cursor-pointer group hover:border-[var(--primary-color)]/70"
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2.5 rounded-lg ${rec.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent size={20} className="text-[var(--primary-color)]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 text-sm group-hover:text-[var(--primary-color)] transition-colors">
                            {rec.label}
                          </h3>
                          <p className="text-xs text-green-600 font-semibold mt-1">+{rec.score} points</p>
                        </div>
                      </div>
                    </div>
                    <button className="mt-3 w-full primary-btn !py-2">
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


    </div>
  );
};

export default ApplicantDashboard;
