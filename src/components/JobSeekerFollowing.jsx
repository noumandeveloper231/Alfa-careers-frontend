import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Eye, Trash, Search } from 'lucide-react'
import CustomSelect from './CustomSelect';
import Img from './Image';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Loading from './Loading';
import { Link } from 'react-router-dom';
import { getCategoryName } from '../utils/categoryNames';
import DataTable from './DataTable';

const JobSeekerFollowing = () => {
    const { backendUrl, followUnfollow, userData } = useContext(AppContext)
    const [companies, setCompanies] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [industryFilter, setIndustryFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/getfollowing`);
            setCompanies(data.following || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [userData, backendUrl])

    useEffect(() => {
        setCurrentPage(1)
    }, [itemsPerPage, searchTerm, industryFilter])

    // Get unique industries for filter
    const availableIndustries = useMemo(() => (
        Array.from(new Set(companies.map(company => company.industry || company.category))).filter(Boolean)
    ), [companies])

    // Apply search and filter
    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch = searchTerm === '' ||
                (company.companyName || company.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            const matchesIndustry = industryFilter === 'all' ||
                (company.industry || company.category) === industryFilter
            return matchesSearch && matchesIndustry
        })
    }, [companies, searchTerm, industryFilter])

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

    if (loading) return <Loading />

    return (
        <div className="bg-white rounded-xl w-full min-h-screen border border-gray-200 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Following Companies
                </h1>
            </div>

            {/* Search and Filter Bar */}
            <div className='flex flex-col justify-between lg:flex-row lg:items-center gap-4 mb-6'>
                <div className="relative w-full lg:w-1/2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="!pl-10"
                    />
                </div>
                <div className='flex gap-3 w-full lg:w-auto'>
                    <CustomSelect
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                    >
                        <option value="all">All Industries</option>
                        {availableIndustries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </CustomSelect>
                </div>
            </div>

            <DataTable
                columns={[
                    {
                        header: 'Name',
                        render: (company) => (
                            <div className='flex items-center gap-4'>
                                <Img src={company.companyProfile || company.profilePicture || '/placeholder.png'} style='w-12 h-12 rounded-full object-cover border border-gray-200' />
                                <div className='flex flex-col'>
                                    <span className='font-semibold text-gray-800'>{company.companyName || company.name}</span>
                                    <span className='text-sm text-gray-500'>
                                        {getCategoryName(company?.category) || "Not Specified"} / {company?.city || "Not Specified"}
                                    </span>
                                </div>
                            </div>
                        ),
                    },
                    {
                        header: 'Founded Date',
                        render: (company) => (
                            <span className='text-sm text-gray-600'>
                                {company.foundedDate ? new Date(company.foundedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not Specified"}
                            </span>
                        ),
                    },
                    {
                        header: 'Actions',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (company) => (
                            <div className='flex items-center justify-center gap-3'>
                                <Link title='View Profile' to={`/companies/${company?.category}/${company?.slug}`} className='p-2 rounded-md hover:bg-gray-100'>
                                    <Eye size={18} className="text-gray-600" />
                                </Link>
                                <button title='Unfollow' onClick={() => followUnfollow(company.authId)} className='p-2 rounded-md hover:bg-red-50'>
                                    <Trash size={18} className="text-red-600" />
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={paginatedCompanies}
                loading={false}
                emptyMessage={searchTerm || industryFilter !== 'all' ? 'No matching companies found.' : 'No companies found.'}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[5, 10, 25]}
                startItem={filteredCompanies.length === 0 ? 0 : startIndex + 1}
                endItem={Math.min(endIndex, filteredCompanies.length)}
                totalItems={filteredCompanies.length}
            />
        </div>
    )
}

export default JobSeekerFollowing