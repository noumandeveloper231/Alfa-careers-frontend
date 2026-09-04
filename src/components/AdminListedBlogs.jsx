import React, { useContext, useEffect, useMemo, useState } from 'react'

// React Icons
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'sonner';
import Loading from './Loading';
import { FaPlus } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import Img from './Image';
import CustomSelect from './CustomSelect';
import { getCategoryName } from '../utils/categoryNames'
import DataTable from "./DataTable";
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AdminListedBlogs = () => {
    const { backendUrl } = useContext(AppContext);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const navigate = useNavigate();
    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/blog/getallblogs`);
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                setLoading(false)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, []);

    // Remove Blog
    const [blogRemovalLoading, setBlogRemovalLoading] = useState(false)
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        setBlogRemovalLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/blog/removeblog`, { blogId: deleteTarget._id })
            if (data.success) {
                toast.success(data.message)
                fetchBlogs()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBlogRemovalLoading(false)
            setDeleteTarget(null)
        }
    }

    // Status & filter states (placed before any early return to avoid hook mismatch)
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [imageModel, setImageModel] = useState(false);
    const [selectedImg, setSelectedImg] = useState('')


    // Derived data
    const publishedBlogs = blogs.filter((b) => b.status === "published");
    const draftBlogs = blogs.filter((b) => b.status === "draft");

    const filteredBlogs = useMemo(() => {
        return blogs
            .filter((blog) => {
                let statusMatch = true;
                if (selectedStatus) statusMatch = blog.status === selectedStatus;

                const lowerSearch = searchTerm.toLowerCase();
                const searchMatch =
                    lowerSearch === "" ||
                    blog.title?.toLowerCase().includes(lowerSearch) ||
                    blog.category?.toLowerCase().includes(lowerSearch);
                return statusMatch && searchMatch;
            })
            .sort((a, b) => {
                const aDate = new Date(a.createdAt);
                const bDate = new Date(b.createdAt);
                if (sortOrder === "newest") return bDate - aDate;
                if (sortOrder === "oldest") return aDate - bDate;
                if (sortOrder === "a-z") return (a.title || "").localeCompare(b.title || "");
                if (sortOrder === "z-a") return (b.title || "").localeCompare(a.title || "");
                return 0;
            });
    }, [blogs, selectedStatus, searchTerm, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);
    const startItem = filteredBlogs.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredBlogs.length);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    if (loading) {
        return (
            <div className='w-full flex justify-center'>
                <Loading />
            </div>
        );
    }

    return (
        <div className='rounded-xl w-full flex flex-col min-h-screen border border-gray-200 p-6 bg-white'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800">
                    Manage Blogs
                </h1>
                <button onClick={() => navigate('/admin/blog/add')} className='primary-btn'>
                    <FaPlus /> Add Blog
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-500">Published Blogs</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{publishedBlogs.length}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-500">Draft Blogs</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{draftBlogs.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <CustomSelect className={"w-40"} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </CustomSelect>

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!pl-10"
                            />
                        </div>
                    </div>

                    <CustomSelect className={"w-40"} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="a-z">A – Z</option>
                        <option value="z-a">Z – A</option>
                    </CustomSelect>
                </div>
            </div>

            <DataTable
                columns={[
                    { header: '#', render: (blog, i) => <span className="font-medium">{startIndex + i + 1}</span> },
                    {
                        header: 'Featured Image',
                        render: (blog) => (
                            <Img
                                willOpen
                                src={blog.coverImage}
                                style="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:scale-105 hover:shadow-md transition-transform duration-200"
                            />
                        ),
                    },
                    { header: 'Title', key: 'title' },
                    { header: 'Category', render: (blog) => <span className="font-semibold">{getCategoryName(blog.category) || blog.category}</span> },
                    { header: 'Created At', render: (blog) => blog.createdAt?.split('T')[0] },
                    {
                        header: 'Status',
                        render: (blog) => (
                            <>
                                {blog.status === 'published' && <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Published</span>}
                                {blog.status === 'draft' && <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">Draft</span>}
                                {!blog.status && <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-semibold">Unknown</span>}
                            </>
                        ),
                    },
                    {
                        header: 'Action',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        render: (blog) => (
                            <div className="flex justify-center items-center gap-4">
                                <HiOutlinePencilSquare
                                    onClick={() => navigate('/admin/blog/add?edit=' + blog.slug)}
                                    className='cursor-pointer text-blue-500' />
                                <FaTrash onClick={() => setDeleteTarget(blog)} className='cursor-pointer text-red-500' />
                            </div>
                        ),
                    },
                ]}
                data={currentBlogs}
                loading={false}
                emptyMessage="No Blogs Found"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                onPageSizeChange={setItemsPerPage}
                startItem={startItem}
                endItem={endItem}
                totalItems={filteredBlogs.length}
            />



            {/* Image Model */}
            {imageModel &&
                <div className='fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center '>
                    <div className='p-2 rounded-md bg-white relative '>
                        <X onClick={() => setImageModel(false)} className=' cursor-pointer border border-gray-300 bg-white rounded-md absolute top-3 right-3' />
                        <Img src={`${backendUrl}/${selectedImg}`} style="max-w-100 rounded-md" />
                    </div>
                </div>
            }

            <ConfirmDeleteModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                loading={blogRemovalLoading}
                message="Are you sure you want to delete this blog?"
                itemName={deleteTarget?.title}
            />
        </div>
    )
}

export default AdminListedBlogs
