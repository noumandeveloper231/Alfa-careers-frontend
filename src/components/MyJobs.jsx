import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import axios from 'axios';
import { FaRegEye, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { Search, Briefcase } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { Link } from 'react-router-dom';
import Img from './Image';
import DataTable from './DataTable';
import Currency from './CurrencyConverter';

const MyJobs = () => {
    const { backendUrl, toggleSaveJob } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("applied"); // "applied" or "saved"

    // Applied Jobs State
    const [applications, setApplications] = useState([]);

    // Saved Jobs State
    const [savedJobs, setSavedJobs] = useState([]);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch Applied Jobs
    const fetchAppliedJobs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/applications/appliedjobs`);
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Saved Jobs
    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getsavedjobs`);
            if (data?.success) {
                setSavedJobs(data.savedJobs || []);
            } else {
                setSavedJobs([]);
            }
        } catch (err) {
            toast.error(err?.message || "Failed to load saved jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "applied") {
            fetchAppliedJobs();
        } else {
            fetchSavedJobs();
        }
    }, [tab]);

    // Reset filters when tab changes
    useEffect(() => {
        setSearchTerm("");
        setSelectedStatus("");
        setSortOrder("newest");
        setCurrentPage(1);
    }, [tab]);

    // Apply filters and sorting for Applied Jobs
    const filteredApplications = applications.filter((app) => {
        const statusMatch = selectedStatus === '' || app.status === selectedStatus;
        const searchMatch = searchTerm === '' ||
            app?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app?.job?.company?.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'a-z') return (a?.job?.title || '').localeCompare(b?.job?.title || '');
        if (sortOrder === 'z-a') return (b?.job?.title || '').localeCompare(a?.job?.title || '');
        return 0;
    });

    // Apply filters and sorting for Saved Jobs
    const filteredSavedJobs = savedJobs.filter((job) => {
        const searchMatch = searchTerm === '' ||
            job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job?.company?.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'a-z') return (a?.title || '').localeCompare(b?.title || '');
        if (sortOrder === 'z-a') return (b?.title || '').localeCompare(a?.title || '');
        return 0;
    });

    // Determine which data to show based on tab
    const currentData = tab === "applied" ? filteredApplications : filteredSavedJobs;

    // Pagination calculations
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = currentData.slice(startIndex, endIndex);
    const startItem = currentData.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, currentData.length);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder]);

    // Handle unsave job
    const handleUnsaveJob = async (jobId) => {
        const prev = [...savedJobs];
        setSavedJobs((p) => p.filter((j) => j._id !== jobId));
        try {
            await toggleSaveJob(jobId);
            toast.success("Job removed from saved jobs");
            fetchSavedJobs();
        } catch (err) {
            setSavedJobs(prev);
            toast.error(err?.message || "Failed to unsave job");
        }
    };

    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className='rounded-lg'>
                {/* Header */}
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-6">
                    My Jobs
                </h1>

                {/* Tab Bar */}
                <div className='flex items-center gap-8 cursor-pointer mb-6'>
                    <span
                        onClick={() => setTab('applied')}
                        className={`${tab === "applied" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        Applied({applications.length})
                    </span>
                    <span
                        onClick={() => setTab('saved')}
                        className={`${tab === "saved" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        Wishlist({savedJobs.length})
                    </span>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="w-full flex justify-between gap-4">
                            {/* Status Filter and Search */}
                            <div className='flex gap-4'>
                                {tab === "applied" && (
                                    <CustomSelect
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className={"w-40"}
                                    >
                                        <option value="">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="applied">Pending</option>
                                    </CustomSelect>
                                )}

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

                {(() => {
                    const columns = tab === "applied" ? [
                        { header: '#', render: (_, idx) => startIndex + idx + 1 },
                        { header: 'Job Title', render: (item) => item?.job?.title || "Title not found" },
                        { header: 'Company', render: (item) => (
                            <div className="flex font-semibold items-center gap-3">
                                <span className="border p-2 rounded-xl border-gray-300">
                                    <img src={item?.job?.companyProfile} alt="Company" decoding="async" loading="lazy" width="30" height="30" className="rounded-md object-cover" />
                                </span>
                                {item?.job?.company || "Company not found"}
                            </div>
                        )},
                        { header: 'Applied At', render: (item) => new Date(item?.createdAt).toLocaleDateString() },
                        { header: 'Status', render: (item) => (
                            item?.status === "approved" ? <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Approved</span> :
                            item?.status === "rejected" ? <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">Rejected</span> :
                            item?.status === "applied" ? <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">Pending</span> : null
                        )},
                        { header: 'Action', headerClassName: 'text-center', render: (item) => (
                            <div className='w-full flex justify-center items-center'>
                                <button onClick={() => window.open(`/jobdetails/${item?.job?._id}`, "_blank")} className='flex items-center gap-2 px-4 py-2 text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition'>
                                    <FaRegEye size={18} />
                                    View
                                </button>
                            </div>
                        )},
                    ] : [
                        { header: '#', render: (_, idx) => startIndex + idx + 1 },
                        { header: 'Job Title', render: (item) => item?.title || "Title not found" },
                        { header: 'Company', render: (item) => (
                            <div className="flex font-semibold items-center gap-3 rounded-full">
                                <Img src={item?.companyProfile || item?.image} style="w-7 h-7 object-cover rounded-full" />
                                {item?.company || "Company not found"}
                            </div>
                        )},
                        { header: 'Job Type', render: (item) => (
                            <span className={`px-3 py-1 whitespace-nowrap rounded-full text-xs font-medium ${/full/i.test(item?.jobType || "") ? "bg-green-100 text-green-800" : /part/i.test(item?.jobType || "") ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                                {item?.jobType || "—"}
                            </span>
                        )},
                        { header: 'Location', render: (item) => (
                            <div>
                                <div className="text-sm">{[item?.city, item?.state, item?.country].filter(Boolean).join(', ') || item?.location || "—"}</div>
                                <div className="text-xs text-gray-400">{item?.locationType || (item?.remoteOption ? "Remote" : "Onsite")}</div>
                            </div>
                        )},
                        { header: 'Salary', render: (item) => (
                            item?.salaryType === "fixed" ? <Currency amount={item?.fixedSalary} from={item?.currency} /> :
                            <span><Currency amount={item?.minSalary} from={item?.currency} /> - <Currency amount={item?.maxSalary} from={item?.currency} /></span>
                        )},
                        { header: 'Action', headerClassName: 'text-center', render: (item) => (
                            <div className='w-full flex justify-center items-center gap-2'>
                                <button onClick={() => handleUnsaveJob(item._id)} className='p-2 rounded-md hover:bg-red-50 text-red-600' title="Remove from saved">
                                    <FaTrash size={16} />
                                </button>
                                <Link to={`/jobs/${item?.category}/${item.slug}`} className='p-2 rounded-md hover:bg-gray-100' title="View job">
                                    <FaExternalLinkAlt size={16} />
                                </Link>
                            </div>
                        )},
                    ];
                    return (
                        <DataTable
                            columns={columns}
                            data={paginatedData}
                            loading={loading}
                            loadingMessage="Loading..."
                            emptyMessage="No Jobs Found"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={itemsPerPage}
                            onPageSizeChange={setItemsPerPage}
                            pageSizeOptions={[10, 25, 50, 100]}
                            startItem={startItem}
                            endItem={endItem}
                            totalItems={currentData.length}
                        />
                    );
                })()}
            </div>
        </div>
    );
};

export default MyJobs;
