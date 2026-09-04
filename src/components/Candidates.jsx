import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Eye, Mail, Search } from 'lucide-react'
import CustomSelect from './CustomSelect';
import Img from './Image';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Loading from './Loading';
import { getCategoryName } from '../utils/categoryNames';
import { Link } from 'react-router-dom';
import DataTable from './DataTable';

const Candidates = () => {
    const { backendUrl, followUnfollow } = useContext(AppContext)
    const [candidates, setCandidates] = useState([])
    const [tab, setTab] = useState("following")
    const [searchTerm, setSearchTerm] = useState("")
    const [cityFilter, setCityFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([])

    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        setLoading(true);

        try {
            const [followersRes, followingRes] = await Promise.all([
                axios.get(`${backendUrl}/api/user/getfollowers`),
                axios.get(`${backendUrl}/api/user/getfollowing`)
            ]);

            setFollowers(followersRes.data.followers || []);
            setFollowing(followingRes.data.following || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, [])

    useEffect(() => {
        if (tab === 'following') {
            setCandidates(following)
        } else {
            setCandidates(followers)
        }
        setSearchTerm("")
        setCityFilter("all")
        setCurrentPage(1)
    }, [tab, following, followers])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, cityFilter, itemsPerPage])

    const availableCities = useMemo(() => (
        Array.from(new Set(candidates.map(candidate => candidate.city))).filter(Boolean)
    ), [candidates])

    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
                || candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCity = cityFilter === 'all' || candidate.city === cityFilter
            return matchesSearch && matchesCity
        })
    }, [candidates, searchTerm, cityFilter])

    const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex)

    const handleViewProfile = (candidate) => {
        console.log('View profile for:', candidate)
    }

    const handleToggleFollow = (candidate) => {
        console.log(`${tab === 'following' ? 'Unfollow' : 'Follow'} candidate`, candidate)
    }

    if (loading) return <Loading />

    console.log('candidates', candidates)

    return (
        <div className="bg-white rounded-xl w-full min-h-screen border border-gray-200 p-6 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
                    {tab === "following" ? "Following" : "Followers"}
                </h1>
            </div>

            {/* Tab Bar */}
            <div className='flex items-center gap-8 cursor-pointer'>
                <span onClick={() => setTab('following')} className={`${tab === "following" ? "font-semibold underline text-[var(--primary-color)] " : "text-gray-400"} underline-offset-8`}>
                    Following
                </span>
                <span onClick={() => setTab('followers')} className={`${tab === "followers" ? "font-semibold underline text-[var(--primary-color)] " : "text-gray-400"} underline-offset-8`}>
                    Followers
                </span>
            </div>

            {/* Filters */}
            <div className='flex flex-col justify-between lg:flex-row lg:items-center gap-4 mt-6 mb-6'>
                <div className="relative w-full lg:w-1/2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
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
                        <option value="all">All Cities</option>
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
                        render: (candidate) => (
                            <div className='flex items-center gap-4'>
                                <Img src={candidate.profilePicture || '/placeholder.png'} style='w-12 h-12 rounded-full object-cover' />
                                <span className='flex flex-col'>
                                    <span className='font-semibold text-gray-800'>{candidate.name}</span>
                                    <span className='text-gray-400'>
                                        {getCategoryName(candidate?.category) || "Not Specified"} / {candidate?.offeredSalary}$ {candidate?.salaryType} / {candidate?.city || "Not Specified"}
                                    </span>
                                </span>
                            </div>
                        ),
                    },
                    {
                        header: '',
                        headerClassName: 'text-right',
                        className: 'text-right',
                        render: (candidate) => (
                            <span className='flex items-center justify-end gap-4 cursor-pointer'>
                                <Link title='View Profile' to={`/candidate/${candidate._id}`}>
                                    <Eye size={20} />
                                </Link>
                                <a title='Mail' href={`mailto:${candidate.email}`}>
                                    <Mail size={20} />
                                </a>
                                <button className='secondary-btn' onClick={() => followUnfollow(candidate.authId)}>
                                    {tab === "following" ? "Unfollow" : "Follow"}
                                </button>
                            </span>
                        ),
                    },
                ]}
                data={paginatedCandidates}
                loading={false}
                emptyMessage="No jobs found."
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={[5, 10, 25]}
                startItem={filteredCandidates.length === 0 ? 0 : startIndex + 1}
                endItem={Math.min(endIndex, filteredCandidates.length)}
                totalItems={filteredCandidates.length}
            />
        </div>
    )
}

export default Candidates