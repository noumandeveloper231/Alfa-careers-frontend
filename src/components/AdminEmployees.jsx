import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { Trash, Ban, Unlock, Mail, MapPin, Briefcase } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DataTable from "./DataTable";
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AdminEmployees = () => {
  const { backendUrl } = useContext(AppContext);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [timeFilter, setTimeFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const getEmployees = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/allemployees`);
      if (data.success) {
        setEmployees(data.employees);
        setFilteredEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  // Delete user
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/delete-user`, { id: deleteTarget.authId });
      if (data.success) {
        toast.success(data.message);
        await getEmployees();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Ban / Unban user
  const toggleBan = async (email, isBanned) => {
    const url = isBanned
      ? `${backendUrl}/api/auth/unban-user`
      : `${backendUrl}/api/auth/ban-user`;

    try {
      const { data } = await axios.post(url, { email });
      if (data.success) {
        toast.success(data.message);
        await getEmployees();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...employees];

    if (selectedCity) {
      filtered = filtered.filter((r) => r.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedRole) {
      filtered = filtered.filter((r) => r.role?.toLowerCase() === selectedRole.toLowerCase());
    }
    if (selectedStatus) {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (timeFilter) {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const createdAt = new Date(r.createdAt);
        if (timeFilter === "7days") return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
        if (timeFilter === "month") return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
        if (timeFilter === "3months") return now - createdAt <= 90 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === "a-z") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "z-a") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredEmployees(filtered);
  }, [selectedCity, selectedRole, selectedStatus, timeFilter, sortOrder, employees]);

  const totalPages = Math.ceil(employees.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEmployees = employees.slice(startIndex, endIndex)

  // Count stats
  const approvedCount = employees.filter((r) => r.reviewStatus === "approved").length;
  const pendingCount = employees.filter((r) => r.reviewStatus === "pending").length;
  const rejectedCount = employees.filter((r) => r.reviewStatus === "rejected").length;
  const underReviewCount = employees.filter((r) => r.reviewStatus === "udnerReview").length;

  return (
    <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
          Employees Management
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
          <p className="text-gray-600 font-medium">Approved</p>
          <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-gray-600 font-medium">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
          <p className="text-gray-600 font-medium">Rejected</p>
          <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
          <p className="text-gray-600 font-medium">Requests</p>
          <h2 className="text-3xl font-bold text-orange-600 mt-1">{underReviewCount}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <CustomSelect
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {[...new Set(employees.map((r) => r.city))].map(
                (city) => city && <option key={city} value={city}>{city}</option>
              )}
            </CustomSelect>

            <CustomSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="underReview">Under Review</option>
            </CustomSelect>

            <CustomSelect
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
            </CustomSelect>

            <CustomSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A–Z</option>
              <option value="z-a">Z–A</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          { header: '#', render: (r, i) => <span className="font-medium text-gray-600">{startIndex + i + 1}</span> },
          { header: 'Name', key: 'name', className: 'font-semibold text-gray-800' },
          {
            header: 'Email',
            render: (r) => (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                {r.email}
              </div>
            ),
          },
          {
            header: 'City',
            render: (r) => (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                {r.city || "N/A"}
              </div>
            ),
          },
          {
            header: 'Company',
            render: (r) => (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase size={14} className="text-gray-400" />
                {r.company || "N/A"}
              </div>
            ),
          },
          { header: 'Role', render: (r) => <span className="text-sm text-gray-600">{r.role || "N/A"}</span> },
          {
            header: 'Jobs',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (r) => (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {r.sentJobs?.length || 0}
              </span>
            ),
          },
          {
            header: 'Status',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (r) => (
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                {r.status || "N/A"}
              </span>
            ),
          },
          {
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (r) => (
              <div className="flex justify-center items-center gap-2">
                <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500" title="Delete">
                  <Trash size={18} />
                </button>
                {r.isBanned ? (
                  <button onClick={() => toggleBan(r.email, true)} className="p-2 rounded-full hover:bg-green-50 transition-colors text-green-500" title="Unban">
                    <Unlock size={18} />
                  </button>
                ) : (
                  <button onClick={() => toggleBan(r.email, false)} className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500" title="Ban">
                    <Ban size={18} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={paginatedEmployees}
        loading={false}
        emptyMessage="No employees found."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={itemsPerPage}
        onPageSizeChange={setItemsPerPage}
        pageSizeOptions={[5, 10, 25]}
        startItem={paginatedEmployees.length === 0 ? 0 : startIndex + 1}
        endItem={Math.min(endIndex, paginatedEmployees.length)}
        totalItems={paginatedEmployees.length}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this employee?"
        itemName={deleteTarget?.name || deleteTarget?.email}
      />
    </div>
  );
};

export default AdminEmployees;
