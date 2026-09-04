import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import CustomSelect from './CustomSelect';
import { Search, Eye, Check, X, CreditCard, Briefcase } from 'lucide-react';
import { MdOutlinePayment, MdCancel } from "react-icons/md";
import { getCategoryName } from '../utils/categoryNames';
import DataTable from "./DataTable";

const AdminJobRequests = () => {
  const { backendUrl } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('new');
  const [pendingJobs, setPendingJobs] = useState([]);
  const [modifiedJobs, setModifiedJobs] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch jobs based on active tab
  const fetchJobs = async () => {
    setLoadingA(true);
    try {
      if (activeTab === 'new') {
        const { data } = await axios.get(`${backendUrl}/api/jobs/getpendingjobs`);
        if (data.success) setPendingJobs(data.jobs);
      } else {
        const { data } = await axios.get(`${backendUrl}/api/jobs/getmodifiedjobs`);
        if (data.success) setModifiedJobs(data.jobs);
      }
    } catch (error) {
      toast.error("Error fetching jobs: " + error.message);
    } finally {
      setLoadingA(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const jobs = activeTab === 'new' ? pendingJobs : modifiedJobs;

  // Update job status
  const updateJobStatus = async (id, status) => {
    setLoadingJobId(id);
    try {
      const { data } = await axios.patch(`${backendUrl}/api/jobs/updatejobstatus`, { jobId: id, status });
      if (data.success) {
        toast.success("Job status updated successfully");
        fetchJobs();
      }
    } catch (error) {
      toast.error("Error updating job status: " + error.message);
    } finally {
      setLoadingJobId(null);
    }
  };

  // View job details
  const viewDetails = (id) => {
    navigate(`/jobDetails/${id}`);
  };

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    // Apply search filter
    const searchMatch = searchTerm === '' ||
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job?.postedBy?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  }).sort((a, b) => {
    // Apply sorting
    if (sortOrder === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    if (sortOrder === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
    if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
    if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);
  const startItem = filteredJobs.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredJobs.length);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  // Stats Calculations
  const requestsThisWeek = jobs.filter(job => {
    const jobDate = new Date(job.createdAt || job.date);
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return jobDate >= oneWeekAgo;
  }).length;

  if (loadingA) return <div className='w-full'> <Loading /></div>;

  return (
    <div className='bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6'>
      <div className='rounded-lg'>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
            Job Requests
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            New Jobs ({pendingJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('modified')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'modified' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Modified Jobs ({modifiedJobs.length})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
            <p className="text-gray-600 font-medium">Requests this week</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-1">{requestsThisWeek}</h2>
          </div>
          <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-gray-600 font-medium">{activeTab === 'new' ? 'Pending' : 'Awaiting Review'}</p>
            <h2 className="text-3xl font-bold text-yellow-600 mt-1">{jobs.length}</h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full flex justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!pl-10"
                />
              </div>

              {/* Sort Order */}
              <CustomSelect
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value)}
                className={"w-40"}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="a-z">A–Z</option>
                <option value="z-a">Z–A</option>
              </CustomSelect>
            </div>
          </div>
        </div>

        <DataTable
          columns={[
            { header: 'Job Title', key: 'title', className: 'font-semibold text-gray-800' },
            { header: 'Company', render: (job) => <span className="text-sm text-gray-600">{job?.postedBy?.company}</span> },
            { header: 'Category', render: (job) => <span className="text-sm text-gray-600">{getCategoryName(job.category)}</span> },
            { header: 'Date', render: (job) => <span className="text-sm text-gray-600">{new Date(job.createdAt || job.date).toLocaleDateString()}</span> },
            {
              header: 'Status',
              render: (job) => (
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${job.approved === "pending" ? "bg-yellow-100 text-yellow-700" : job.approved === "approved" ? "bg-green-100 text-green-700" : job.approved === "modified" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                  {job.approved === "modified" ? "Modified" : job.approved}
                </span>
              ),
            },
            {
              header: 'Featured',
              render: (job) => (
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${job.sponsored ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                  {job.sponsored ? "Yes" : "No"}
                </span>
              ),
            },
            {
              header: 'Action',
              headerClassName: 'text-center',
              className: 'text-center',
              render: (job) => (
                <div className='w-full flex justify-center items-center gap-2'>
                  <button onClick={() => navigate(`/jobs/${job?.category}/${job.slug}${job?.approved === 'modified' ? '?view=modifications' : ''}`)} className='p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500' title="View Details">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => updateJobStatus(job._id, "approved")} className='p-2 rounded-full hover:bg-green-50 transition-colors text-green-500' title="Approve" disabled={loadingJobId === job._id}>
                    <Check size={18} />
                  </button>
                  <button onClick={() => updateJobStatus(job._id, "rejected")} className='p-2 rounded-full hover:bg-red-50 transition-colors text-red-500' title="Reject" disabled={loadingJobId === job._id}>
                    <X size={18} />
                  </button>
                  {job.sponsored && (
                    <button onClick={() => setShowPaymentDetails(job)} className='p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-500' title="Payment Details">
                      <CreditCard size={18} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          data={currentJobs}
          loading={false}
          emptyMessage="No jobs found."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={itemsPerPage}
          onPageSizeChange={setItemsPerPage}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredJobs.length}
        />
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <div className="flex items-center justify-center fixed top-0 left-0 h-screen w-full backdrop-blur-sm z-50">
          <div className="bg-white shadow-lg relative rounded-2xl p-6 border border-gray-300 w-11/12 sm:w-1/2">
            <MdCancel
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-red-500"
              size={22}
              onClick={() => setShowPaymentDetails(null)}
            />
            <h2 className="font-semibold flex items-center gap-3 text-lg mb-4">
              <MdOutlinePayment className="text-[var(--primary-color)]" /> Payment Details
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <h4 className="font-semibold">Payment Name</h4>
                <p>{showPaymentDetails.cardName || "N/A"}</p>
              </div>

              <div>
                <h4 className="font-semibold mt-2">Card Number</h4>
                <p>{showPaymentDetails.cardNumber ? '****' + showPaymentDetails.cardNumber.slice(-4) : "N/A"}</p>
              </div>

              <div className="flex items-center justify-between w-3/4 mt-2">
                <div>
                  <h4 className="font-semibold">Expiry Date</h4>
                  <p>{showPaymentDetails.expiryDate || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold">CVV</h4>
                  <p>***</p>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="font-semibold">Payment Amount</h4>
                <p>10 $</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobRequests;