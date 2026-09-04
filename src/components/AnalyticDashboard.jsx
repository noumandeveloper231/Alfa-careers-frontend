import { useEffect, useState, useContext } from 'react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, BarElement, Filler, ArcElement, Title, Tooltip, Legend } from 'chart.js/auto'
import axios from 'axios'
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, BarElement, Filler, ArcElement, Title, Tooltip, Legend);
// React Icons
import { FaUsers, FaBriefcase, FaUser, FaFileAlt, FaChartLine, FaEye, FaCog, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { getCategoryName } from '../utils/categoryNames';
import { MdDashboard, MdWork, MdPeople, MdAssignment } from "react-icons/md";
import Loading from './Loading';
import { RefreshCwIcon } from 'lucide-react';
import DataTable from './DataTable';
const AnalyticDashboard = () => {

  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [userData, setuserData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [applicationAnalytics, setApplicationAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [systemAnalytics, setSystemAnalytics] = useState(null);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [
        dashboardRes,
        weeklyRes,
        jobRes,
        applicationRes,
        userRes,
        systemRes
      ] = await Promise.all([
        axios.get(`${backendUrl}/api/analytics/dashboard-stats`),
        axios.get(`${backendUrl}/api/analytics/weekly-analytics`),
        axios.get(`${backendUrl}/api/analytics/job-analytics`),
        axios.get(`${backendUrl}/api/analytics/application-analytics`),
        axios.get(`${backendUrl}/api/analytics/user-analytics`),
        axios.get(`${backendUrl}/api/analytics/system-analytics`)
      ]);

      if (dashboardRes.data.success) setDashboardStats(dashboardRes.data.stats);
      if (weeklyRes.data.success) {
        setJobData(weeklyRes.data.jobs);
        setuserData(weeklyRes.data.users);
        setEmployeeData(weeklyRes.data.employees);
      }
      if (jobRes.data.success) setJobAnalytics(jobRes.data);
      if (applicationRes.data.success) setApplicationAnalytics(applicationRes.data);
      if (userRes.data.success) setUserAnalytics(userRes.data);
      if (systemRes.data.success) setSystemAnalytics(systemRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  const getGrowthColor = (growth) => {
    const growthNum = parseFloat(growth);
    if (growthNum > 0) return 'text-green-500';
    if (growthNum < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getGrowthIcon = (growth) => {
    const growthNum = parseFloat(growth);
    if (growthNum > 0) return <FaChevronUp className="w-4 h-4" />;
    if (growthNum < 0) return <FaChevronDown className="w-4 h-4" />;
    return <FaChartLine className="w-4 h-4" />;
  };


  if (loading) {
    return (
      <div className='w-full flex justify-center items-center min-h-screen'>
        <Loading />
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-100 border border-blue-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Users</p>
              <p className="text-3xl text-blue-500 font-bold">{formatNumber(dashboardStats?.totalUsers)}</p>
              <div className={`flex items-center gap-1 mt-2 ${getGrowthColor(dashboardStats?.growth?.users)}`}>
                {getGrowthIcon(dashboardStats?.growth?.users)}
                <span className="text-sm">{dashboardStats?.growth?.users ?? 0}% this month</span>
              </div>
            </div>
            <FaUsers className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-green-100 border border-green-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Jobs</p>
              <p className="text-3xl text-green-500 font-bold">{formatNumber(dashboardStats?.totalJobs)}</p>
              <div className={`flex items-center gap-1 mt-2 ${getGrowthColor(dashboardStats?.growth?.jobs)}`}>
                {getGrowthIcon(dashboardStats?.growth?.jobs)}
                <span className="text-sm">{dashboardStats?.growth?.jobs ?? 0}% this month</span>
              </div>
            </div>
            <FaBriefcase className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-purple-100 border border-purple-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Applications</p>
              <p className="text-3xl text-purple-500 font-bold">{formatNumber(dashboardStats?.totalApplications)}</p>
              <div className={`flex items-center gap-1 mt-2 ${getGrowthColor(dashboardStats?.growth?.applications)}`}>
                {getGrowthIcon(dashboardStats?.growth?.applications)}
                <span className="text-sm">{dashboardStats?.growth?.applications ?? 0}% this month</span>
              </div>
            </div>
            <MdAssignment className="text-4xl text-purple-200" />
          </div>
        </div>

        <div className="bg-orange-100 border border-orange-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Employees</p>
              <p className="text-3xl text-orange-500 font-bold">{formatNumber(dashboardStats?.totalEmployees)}</p>
              <div className={`flex items-center gap-1 mt-2 ${getGrowthColor(dashboardStats?.growth?.employees)}`}>
                {getGrowthIcon(dashboardStats?.growth?.employees)}
                <span className="text-sm">{dashboardStats?.growth?.employees ?? 0}% this month</span>
              </div>
            </div>
            <FaUser className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBriefcase className="text-green-500" />
            Jobs This Week
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: jobData.map((job) => (job.day || '').split("-")[2]),
                datasets: [{
                  label: "Jobs",
                  data: jobData.map((job) => job.jobs),
                  borderColor: "rgb(34, 197, 94)",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUsers className="text-blue-500" />
            Users This Week
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: userData.map((user) => (user.day || '').split("-")[2]),
                datasets: [{
                  label: "Users",
                  data: userData.map((user) => user.users),
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  borderColor: "rgb(59, 130, 246)",
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 24 Hours)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{systemAnalytics?.recentActivity?.newUsers || 0}</div>
            <div className="text-sm text-gray-600">New Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{systemAnalytics?.recentActivity?.newJobs || 0}</div>
            <div className="text-sm text-gray-600">New Jobs</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{systemAnalytics?.recentActivity?.newApplications || 0}</div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{systemAnalytics?.recentActivity?.newBlogs || 0}</div>
            <div className="text-sm text-gray-600">New Blogs</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Jobs by Category</h3>
          <div className="h-64">
            {jobAnalytics?.jobsByCategory?.length > 0 && (
              <Bar
                data={{
                  labels: jobAnalytics.jobsByCategory.slice(0, 8).map(item => item._id || 'Unknown'),
                  datasets: [{
                    data: jobAnalytics.jobsByCategory.slice(0, 8).map(item => item.count),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(168, 85, 247, 0.8)',
                      'rgba(245, 101, 101, 0.8)',
                      'rgba(251, 191, 36, 0.8)',
                      'rgba(20, 184, 166, 0.8)',
                      'rgba(244, 63, 94, 0.8)',
                      'rgba(156, 163, 175, 0.8)'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Job Types</h3>
          <div className="h-64">
            {jobAnalytics?.jobsByType?.length > 0 && (
              <Doughnut
                data={{
                  labels: jobAnalytics.jobsByType.map(item => item._id || 'Unknown'),
                  datasets: [{
                    data: jobAnalytics.jobsByType.map(item => item.count),
                    backgroundColor: [
                      '#3B82F6',
                      '#22C55E',
                      '#A855F7',
                      '#F59E0B',
                      '#EF4444'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
        <DataTable
          columns={[
            { header: 'Title', render: (job) => <span className="font-medium">{job.title}</span> },
            { header: 'Company', key: 'company' },
            { header: 'Category', render: (job) => getCategoryName(job.category) },
            { header: 'Date', render: (job) => new Date(job.createdAt).toLocaleDateString() },
          ]}
          data={jobAnalytics?.recentJobs?.slice(0, 5) || []}
          wrapperClassName="overflow-x-auto"
          theadClassName="border-b"
        />
      </div>
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Application Status</h3>
          <div className="h-64">
            {applicationAnalytics?.applicationsByStatus?.length > 0 && (
              <Pie
                data={{
                  labels: applicationAnalytics.applicationsByStatus.map(item => item._id),
                  datasets: [{
                    data: applicationAnalytics.applicationsByStatus.map(item => item.count),
                    backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#22C55E']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-500 mb-2">
                {applicationAnalytics?.successRate || 0}%
              </div>
              <div className="text-gray-600">Applications Hired</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
        <DataTable
          columns={[
            { header: 'Job', render: (app) => <span className="font-medium">{app.job?.title}</span> },
            { header: 'Applicant', render: (app) => app.applicant?.name },
            {
              header: 'Status', render: (app) => (
                <span className={`px-2 py-1 rounded-full text-xs ${app.status === 'hired' ? 'bg-green-100 text-green-800' :
                  app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {app.status}
                </span>
              )
            },
            { header: 'Date', render: (app) => new Date(app.createdAt).toLocaleDateString() },
          ]}
          data={applicationAnalytics?.recentApplications?.slice(0, 5) || []}
          wrapperClassName="overflow-x-auto"
          theadClassName="border-b"
        />
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{userAnalytics?.totalUsers ?? 0}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{userAnalytics?.activeUsers ?? 0}</div>
          <div className="text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userAnalytics?.activeUserPercentage ?? 0}%</div>
          <div className="text-gray-600">Engagement Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
        <div className="space-y-4">
          {userAnalytics?.usersByRole?.map((role, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{role._id === "employee" ? "Employees" : "Users"}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(role.count / Math.max(...userAnalytics.usersByRole.map(r => r.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{role.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className='border border-gray-300 rounded-3xl bg-white w-full overflow-y-auto min-h-screen p-6'>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
            Analytics Dashboard
          </h1>
          <button
            onClick={fetchAllAnalytics}
          >
            <RefreshCwIcon className='hover:text-[var(--primary-color)]' />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: MdDashboard },
            { id: 'jobs', label: 'Jobs', icon: MdWork },
            { id: 'applications', label: 'Applications', icon: MdAssignment },
            { id: 'users', label: 'Users', icon: MdPeople }
          ].map(tab => (
            <span
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-gray-600 hover:text-white hover:bg-[var(--primary-color)]/90'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'jobs' && renderJobsTab()}
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'users' && renderUsersTab()}
      </div>
    </div>
  );
}

export default AnalyticDashboard
