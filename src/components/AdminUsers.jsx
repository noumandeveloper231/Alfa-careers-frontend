import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { FaUsers, FaTrash } from "react-icons/fa";
import { Ban, Unlock, Mail, Filter } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DataTable from "./DataTable";
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AdminUsers = () => {
  const { backendUrl } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getUsers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/allusers`);
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/delete-user`, { id: deleteTarget.authId });
      if (data.success) {
        toast.success(data.message);
        await getUsers();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Ban / Unban
  const toggleBan = async (email, isBanned) => {
    const url = isBanned
      ? `${backendUrl}/api/auth/unban-user`
      : `${backendUrl}/api/auth/ban-user`;

    try {
      const { data } = await axios.post(url, { email });
      if (data.success) {
        toast.success(data.message);
        await getUsers();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    if (selectedCity) filtered = filtered.filter((u) => u.city?.toLowerCase() === selectedCity.toLowerCase());
    if (selectedRole) filtered = filtered.filter((u) => u.role?.toLowerCase() === selectedRole.toLowerCase());
    if (selectedStatus) filtered = filtered.filter((u) => u.status === selectedStatus);

    if (timeFilter) {
      const now = new Date();
      filtered = filtered.filter((u) => {
        const createdAt = new Date(u.createdAt);
        if (timeFilter === "7days") return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
        if (timeFilter === "month") return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
        if (timeFilter === "3months") return now - createdAt <= 90 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    if (sortOrder === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortOrder === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortOrder === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCity, selectedRole, selectedStatus, timeFilter, sortOrder, users]);

  // Stats
  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const activeUsers = totalUsers - bannedUsers;

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const startItem = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredUsers.length);

  return (
    <div className="bg-white rounded-xl w-full min-h-screen border border-gray-200 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
          Manage Users
        </h1>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-600 font-medium">Total Users</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalUsers}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
          <p className="text-gray-600 font-medium">Active Users</p>
          <h2 className="text-3xl font-bold text-green-600 mt-1">{activeUsers}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
          <p className="text-gray-600 font-medium">Banned Users</p>
          <h2 className="text-3xl font-bold text-red-600 mt-1">{bannedUsers}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">

          <div className="w-full grid grid-cols-2 md:grid-cols- lg:grid-cols-4 gap-2">
            <CustomSelect
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {[...new Set(users.map((u) => u.city))].map((city) => city && <option key={city} value={city}>{city}</option>)}
            </CustomSelect>

            <CustomSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
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
          { header: 'Name', key: 'name', className: 'font-semibold text-gray-800' },
          {
            header: 'Email',
            render: (u) => (
              <span className="flex items-center gap-2">
                <Mail size={15} className="text-gray-500" /> {u.email}
              </span>
            ),
          },
          { header: 'City', render: (u) => u.city || <span className="text-gray-400">N/A</span> },
          {
            header: 'Applied Jobs',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (u) => (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {u.appliedJobs?.length || 0}
              </span>
            ),
          },
          {
            header: 'Status',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (u) => (
              <span className={`px-3 py-1 text-xs rounded-full font-semibold ${u.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {u.isBanned ? 'Banned' : 'Active'}
              </span>
            ),
          },
          {
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'text-center',
            render: (u) => (
              <div className="flex justify-center items-center gap-4">
                <button onClick={() => setDeleteTarget(u)} className="cursor-pointer text-red-500 hover:text-red-700 transition" title="Delete">
                  <FaTrash size={18} />
                </button>
                {u.isBanned ? (
                  <button onClick={() => toggleBan(u.email, true)} className="cursor-pointer text-green-500 hover:text-green-700 transition" title="Unban">
                    <Unlock size={18} />
                  </button>
                ) : (
                  <button onClick={() => toggleBan(u.email, false)} className="cursor-pointer text-red-500 hover:text-red-700 transition" title="Ban">
                    <Ban size={18} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={currentUsers}
        loading={false}
        emptyMessage="No users found."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={itemsPerPage}
        onPageSizeChange={setItemsPerPage}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredUsers.length}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this user?"
        itemName={deleteTarget?.name || deleteTarget?.email}
      />

    </div>
  );
};

export default AdminUsers;
