import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Building2, Filter, Search, Trash, Eye, Layers } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { toast } from "sonner";
import { getCategoryName } from "../utils/categoryNames";
import DataTable from "./DataTable";
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AdminJobs = () => {
  const { backendUrl } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`);
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/jobs/removejob/${deleteTarget._id}`);
      if (data.success) {
        toast.success("Job removed successfully");
        fetchJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const approvedJobs = jobs.filter((job) => job.approved === "approved");
  const pendingJobs = jobs.filter((job) => job.approved === "pending");
  const rejectedJobs = jobs.filter((job) => job.approved === "rejected");

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        let statusMatch = true;
        if (selectedStatus) {
          statusMatch = job.approved === selectedStatus;
        }

        const lowerSearch = searchTerm.toLowerCase();
        const searchMatch =
          lowerSearch === "" ||
          job.title?.toLowerCase().includes(lowerSearch) ||
          job.company?.toLowerCase().includes(lowerSearch) ||
          job.category?.toLowerCase().includes(lowerSearch);

        return statusMatch && searchMatch;
      })
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || a.postedAt || 0);
        const bDate = new Date(b.createdAt || b.postedAt || 0);

        if (sortOrder === "newest") return bDate - aDate;
        if (sortOrder === "oldest") return aDate - bDate;
        if (sortOrder === "a-z") return (a.title || "").localeCompare(b.title || "");
        if (sortOrder === "z-a") return (b.title || "").localeCompare(a.title || "");
        return 0;
      });
  }, [jobs, selectedStatus, searchTerm, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);
  const startItem = filteredJobs.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredJobs.length);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { label: "No deadline", className: "bg-gray-100 text-gray-600" };
    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate < now)
      return { label: "Expired", className: "bg-red-100 text-red-600" };
    return { label: formatDate(deadline), className: "bg-blue-100 text-blue-600" };
  };

  return (
    <div className="w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Manage All Jobs
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-500">Approved Jobs</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{approvedJobs.length}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-500">Pending Jobs</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingJobs.length}</p>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-gray-500">Rejected Jobs</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{rejectedJobs.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <CustomSelect className={"w-40"} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </CustomSelect>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CustomSelect className={"w-40"} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="a-z">A – Z</option>
              <option value="z-a">Z – A</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          {
            header: 'Job',
            render: (job) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{job.title || "Untitled"}</span>
                <span className="text-sm text-gray-500">{job?.postedBy?.company || "Unknown Company"}</span>
              </div>
            ),
          },
          { header: 'Category', render: (job) => <span className="text-sm text-gray-600">{getCategoryName(job?.category) || "—"}</span> },
          { header: 'Posted', render: (job) => <span className="text-sm text-gray-600">{new Date(job.createdAt).toLocaleDateString()}</span> },
          {
            header: 'Deadline',
            render: (job) => {
              const deadlineState = getDeadlineStatus(job.applicationDeadline);
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${deadlineState.className}`}>
                  {new Date(job?.applicationDeadline).toLocaleDateString()}
                </span>
              );
            },
          },
          {
            header: 'Status',
            render: (job) => (
              <>
                {job.approved === "approved" && <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Approved</span>}
                {job.approved === "pending" && <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">Pending</span>}
                {job.approved === "rejected" && <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">Rejected</span>}
                {!job.approved && <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-semibold">Unknown</span>}
              </>
            ),
          },
          {
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (job) => (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => navigate(`/jobs/${job?.category}/${job?.slug}`)} className="p-2 rounded-full hover:bg-blue-50" title="View job">
                  <Eye className="text-blue-500" size={18} />
                </button>
                <button onClick={() => setDeleteTarget(job)} className="p-2 rounded-full hover:bg-red-50" title="Remove job">
                  <Trash className="text-red-500" size={18} />
                </button>
              </div>
            ),
          },
        ]}
        data={currentJobs}
        loading={loading}
        loadingMessage="Loading jobs..."
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

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Job"
        message="Are you sure you want to remove this job?"
        itemName={deleteTarget?.title}
        confirmText="Remove"
      />

    </div>
  );
};

export default AdminJobs;
