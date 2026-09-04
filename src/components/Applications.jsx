import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Download, Eye, Mail, Phone, Search, Trash } from 'lucide-react'
import CustomSelect from './CustomSelect';
import Img from './Image';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import DataTable from './DataTable';

const Applications = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const [applicants, setApplicants] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [cityFilter, setCityFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchApplications = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/applications/employee-applications`);
            if (data.success) {
                setApplicants(data.applications);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, cityFilter, itemsPerPage])

    const availableCities = useMemo(() => (
        Array.from(new Set(applicants.map(app => app.job?.location).filter(Boolean)))
    ), [applicants])

    const filteredApplicants = useMemo(() => {
        return applicants.filter(app => {
            const matchesSearch = app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                || app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                || app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCity = cityFilter === 'all' || app.job?.location === cityFilter

            return matchesSearch && matchesCity
        })
    }, [applicants, searchTerm, cityFilter])

    const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedApplicants = filteredApplicants.slice(startIndex, endIndex)

    const handleToggleFollow = (applicant) => {
        // Implement follow functionality if needed
        console.log("Toggle follow", applicant);
    }

    return (
        <div className="bg-white rounded-xl w-full min-h-screen border border-gray-200 p-6 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
                    All Applicants
                </h1>
            </div>

            {/* Filters */}
            <div className='flex flex-col justify-between lg:flex-row lg:items-center gap-4 mt-6 mb-6'>
                <div className="relative w-full lg:w-1/2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="!pl-10"
                    />
                </div>
                <div className='flex gap-3 w-full lg:w-auto'>
                    <CustomSelect
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </CustomSelect>

                </div>
            </div>

            <DataTable
                columns={[
                    {
                        header: 'Name',
                        render: (app) => (
                            <div className='flex items-center gap-4'>
                                <Img src={app.applicant?.profilePicture || '/placeholder.png'} style='w-12 h-12 rounded-full object-cover' />
                                <div className='font-semibold text-gray-800'>{app.applicant?.name}</div>
                            </div>
                        ),
                    },
                    {
                        header: 'Job Applied',
                        render: (app) => (
                            <>
                                <div className='font-medium text-gray-800'>{app.job?.title}</div>
                                <div className='text-sm text-gray-500'>{app.job?.location}</div>
                            </>
                        ),
                    },
                    {
                        header: 'Status',
                        render: (app) => (
                            <>
                                <div className={`${app.status === "applied" ? "bg-blue-100 text-blue-800" : app.status === "shortlisted" ? "bg-yellow-100 text-yellow-800" : app.status === "hired" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 py-1 rounded-full text-sm text-center capitalize w-24`}>
                                    {app.status}
                                </div>
                                <div className='text-sm mt-2'>
                                    Applied: <span className='text-gray-400 italic'>{new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </>
                        ),
                    },
                    {
                        header: 'Information',
                        render: (app) => (
                            <div className='space-y-1'>
                                <div className='text-sm flex items-center gap-2'>
                                    <Mail size={16} className="text-gray-400" /> {app.applicant?.email}
                                </div>
                                {app.applicant?.phone && (
                                    <div className='text-sm flex items-center gap-2'>
                                        <Phone size={16} className="text-gray-400" /> {app.applicant?.phone}
                                    </div>
                                )}
                            </div>
                        ),
                    },
                    {
                        header: 'Resume',
                        render: (app) => app.resume ? (
                            <a href={app.resume} target='_blank' rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                                <Download size={18} />
                                <span className="text-sm font-medium">Download</span>
                            </a>
                        ) : (
                            <span className="text-gray-400 text-sm">No Resume</span>
                        ),
                    },
                ]}
                data={paginatedApplicants}
                loading={loading}
                loadingMessage="Loading Application..."
                emptyMessage="No jobs found."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[5, 10, 25]}
                startItem={filteredApplicants.length === 0 ? 0 : startIndex + 1}
                endItem={Math.min(endIndex, filteredApplicants.length)}
                totalItems={filteredApplicants.length}
            />
        </div>
    )
}

export default Applications