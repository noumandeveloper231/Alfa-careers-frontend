import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Mail, Phone, MapPin, Globe, UserRound, Plus, Search } from 'lucide-react';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import Img from './Image';
import CustomSelect from './CustomSelect';
import DataTable from "./DataTable";

const AdminAssistants = ({ setActiveTab }) => {
    const { backendUrl } = useContext(AppContext);
    const [assistants, setAssistants] = useState([]);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const navigate = useNavigate()

    // Filters and pagination
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const getAssistants = async () => {
        setAssistantLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/get-assistants`);
            if (data.success) {
                setAssistants(data.assistants);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error.message);
        } finally {
            setAssistantLoading(false);
        }
    };

    useEffect(() => {
        getAssistants();
    }, []);

    // Stats and filtering helpers
    const approvedAssistants = assistants.filter(a => a.reviewStatus === 'approved');
    const rejectedAssistants = assistants.filter(a => a.reviewStatus === 'rejected');
    const pendingAssistants = assistants.filter(a => a.reviewStatus === 'pending');
    const activeAssistants = assistants.filter(a => a.isActive);

    const filteredAssistants = assistants
        .filter((a) => {
            const statusMatch = selectedStatus ? a.reviewStatus === selectedStatus : true;
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' || a.name.toLowerCase().includes(searchLower) || a.email.toLowerCase().includes(searchLower);
            return statusMatch && searchMatch;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOrder === 'a-z') return a.name.localeCompare(b.name);
            if (sortOrder === 'z-a') return b.name.localeCompare(a.name);
            return 0;
        });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAssistants.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAssistants = filteredAssistants.slice(startIndex, endIndex);
    const startItem = filteredAssistants.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredAssistants.length);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder, itemsPerPage]);

    if (assistantLoading) {
        return (
            <div className="w-full flex justify-center items-center py-16">
                <Loading />
            </div>
        );
    }

    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assistants</h1>
                <button
                    className="primary-btn flex items-center gap-2"
                    onClick={() => navigate('/admin/add-assistant')}
                >
                    <Plus size={18} /> Add Assistant
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-600 font-medium">Approved</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-600 font-medium">Rejected</p>
                    <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-600 font-medium">Pending</p>
                    <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-600 font-medium">Active</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{activeAssistants.length}</h2>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <CustomSelect
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={"w-40"}
                        >
                            <option value="">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                        </CustomSelect>

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search assistants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!pl-10"
                            />
                        </div>
                    </div>

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

            <DataTable
                columns={[
                    {
                        header: 'Name',
                        render: (a) => (
                            <div className="flex items-center gap-3">
                                <Img src={a.profilePicture || '/default-avatar.png'} style="w-8 h-8 rounded-full object-cover border" />
                                <span className="font-medium text-gray-800">{a.name}</span>
                            </div>
                        ),
                    },
                    { header: 'Email', render: (a) => <span className="text-sm text-gray-600">{a.email}</span> },
                    { header: 'Contact', render: (a) => <span className="text-sm text-gray-600">{a.contactNumber || 'N/A'}</span> },
                    {
                        header: 'Active',
                        render: (a) => a.isActive
                            ? <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                            : <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Inactive</span>,
                    },
                    {
                        header: 'Status',
                        render: (a) => (
                            <>
                                {a.reviewStatus === 'approved' && <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Approved</span>}
                                {a.reviewStatus === 'rejected' && <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Rejected</span>}
                                {a.reviewStatus === 'pending' && <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>}
                            </>
                        ),
                    },
                    {
                        header: 'Action',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (a) => (
                            <div className="w-full flex justify-center">
                                <button onClick={() => navigate('/company-profile/' + a.authId)} className="flex items-center gap-1 text-blue-600 hover:underline">
                                    <UserRound size={14} /> View Profile
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={currentAssistants}
                loading={false}
                emptyMessage="No assistants found."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                startItem={startItem}
                endItem={endItem}
                totalItems={filteredAssistants.length}
            />
        </div>
    );
};

export default AdminAssistants;