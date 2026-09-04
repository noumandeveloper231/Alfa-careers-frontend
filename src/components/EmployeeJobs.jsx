import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { Trash, Search, Pencil, AlertTriangle } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoryName } from '../utils/categoryNames';
import DataTable from "./DataTable";
import ConfirmDeleteModal from './ConfirmDeleteModal';

const EmployeeJobs = () => {
    const { userData, backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all')
    const [jobs, setJobs] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editConfirmTarget, setEditConfirmTarget] = useState(null);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getJobs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getcompanyjobsbyid/${userData._id}`);
            if (data.success) {
                setJobs(data.companyJobs);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        getJobs();
    }, [])

    console.log('jobs', jobs)

    // Remove Job
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget._id;
        setDeleteLoading(true);
        try {
            setJobs(prev => prev.filter(job => job._id !== id));

            const { data } = await axios.delete(`${backendUrl}/api/jobs/removejob/${id}`);

            if (data.success) {
                toast.success(data.message);
                getJobs();
            } else {
                toast.error(data.message);
                getJobs();
            }
        } catch (error) {
            toast.error(error.message);
            getJobs();
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };


    const approvedJobs = jobs.filter(job => job.approved === "approved");
    const rejectedJobs = jobs.filter(job => job.approved === "rejected");
    const pendingJobs = jobs.filter(job => job.approved === "pending");
    const draftJobs = jobs.filter(job => job.approved === "draft");
    const modifiedJobs = jobs.filter(job => job.approved === "modified");

    const filteredJobs = jobs.filter((job) => {
        // Apply status filter
        let statusMatch = true;
        if (selectedStatus) {
            statusMatch = job.approved === selectedStatus;
        } else if (filter !== 'all') {
            statusMatch = job.approved === filter;
        }

        // Apply search filter
        const searchMatch = searchTerm === '' ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.category.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
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
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder]);

    return (
        <div className='bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6 rounded-lg'>
            <div className='rounded-lg'>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
                        Manage Jobs
                    </h1>
                    <Link
                        to={"/dashboard/jobs/post"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <button className="primary-btn">
                            Post a job
                        </button>
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-600 font-medium">Approved Jobs</p>
                        <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                        <p className="text-gray-600 font-medium">Modified Jobs</p>
                        <h2 className="text-3xl font-bold text-orange-600 mt-1">{modifiedJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-gray-600 font-medium">Pending Jobs</p>
                        <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-600 font-medium">Draft Jobs</p>
                        <h2 className="text-3xl font-bold text-blue-600 mt-1">{draftJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-600 font-medium">Rejected Jobs</p>
                        <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedJobs.length}</h2>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="w-full flex justify-between gap-4">
                            {/* Status Filter */}
                            <div className='flex gap-4'>
                                <CustomSelect
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={"w-40"}
                                >
                                    <option value="">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="modified">Modified</option>
                                    <option value="pending">Pending</option>
                                    <option value="draft">Draft</option>
                                    <option value="rejected">Rejected</option>
                                </CustomSelect>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="!pl-10"
                                    />
                                </div>
                            </div>

                            {/* Sort Order */}
                            <CustomSelect
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
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
                        { header: 'Job Category', render: (job) => <span className="text-sm text-gray-600">{getCategoryName(job.category)}</span> },
                        { header: 'Active Till', render: (job) => <span className="text-sm text-gray-600">{new Date(job.applicationDeadline).toLocaleDateString()}</span> },
                        {
                            header: 'Status',
                            render: (job) => (
                                <>
                                    {job.approved === "draft" && <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">Draft</span>}
                                    {job.approved === "approved" && <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Approved</span>}
                                    {job.approved === "modified" && <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-semibold">Modified</span>}
                                    {job.approved === "rejected" && <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">Rejected</span>}
                                    {job.approved === "pending" && <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">Pending</span>}
                                </>
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
                                    {job.approved === "approved" ? (
                                        <button onClick={() => setEditConfirmTarget(job)}
                                            className='p-2 rounded-full hover:bg-blue-50 transition-colors' aria-label={`Edit job: ${job.title}`} title="Edit Approved Job">
                                            <Pencil className='text-blue-500 cursor-pointer' size={18} />
                                        </button>
                                    ) : (
                                        <button onClick={() => navigate('/dashboard/jobs/post', { state: { editJob: job } })}
                                            className='p-2 rounded-full hover:bg-blue-50 transition-colors' aria-label={`Edit job: ${job.title}`} title="Edit Job">
                                            <Pencil className='text-blue-500 cursor-pointer' size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => setDeleteTarget(job)}
                                        className='p-2 rounded-full hover:bg-red-50 transition-colors' aria-label={`Remove job: ${job.title}`}>
                                        <Trash className='text-red-500 cursor-pointer' size={18} />
                                    </button>
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

                <ConfirmDeleteModal
                    isOpen={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                    loading={deleteLoading}
                    title="Remove Job"
                    message="Are you sure you want to remove this job?"
                    itemName={deleteTarget?.title}
                    confirmText="Remove"
                />

                {/* Confirm Edit Modal for approved jobs */}
                {editConfirmTarget && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-9999 flex items-center justify-center p-4">
                        <div className='bg-white/80 rounded-2xl shadow-2xl max-w-sm w-full backdrop-blur-sm'>
                            <div className="p-6 pb-0">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <AlertTriangle className="text-yellow-500" size={24} />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Edit Approved Job</h2>
                                <p className="text-gray-600 text-center mb-1">
                                    This job is currently published. Any changes you make will require admin review.
                                </p>
                                <p className="text-gray-500 text-center text-sm mb-6">
                                    The current published version will stay live until the admin approves your changes.
                                </p>
                            </div>
                            <div className="flex p-4 bg-gray-50 rounded-b-2xl gap-3 justify-between">
                                <button
                                    onClick={() => setEditConfirmTarget(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const job = editConfirmTarget;
                                        setEditConfirmTarget(null);
                                        navigate('/dashboard/jobs/post', { state: { editJob: job } });
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                                >
                                    Edit Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div >
    )
}

export default EmployeeJobs
