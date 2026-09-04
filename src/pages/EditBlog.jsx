import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Loading from '../components/Loading';
import { AppContext } from '../context/AppContext';
import { MdSubtitles } from "react-icons/md";
import JoditEditor from 'jodit-react';
import BlogCard from '../components/BlogCard';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';

const EditBlog = () => {
    // Auto Scroll to Top
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])
    const location = useLocation();
    const search = location.search;
    const params = new URLSearchParams(search);
    const blogId = params.get('id');
    const { backendUrl } = useContext(AppContext)
    const editor = useRef(null);

    // Edit Blog
    const [blogEditLoading, setBlogEditLoading] = useState(false);
    const [blogDataloading, setBlogDataloading] = useState(false)
    const [blogData, setBlogData] = useState({})

    const handleChange = (e) => {
        e.preventDefault();
        setBlogData({ ...blogData, [e.target.name]: e.target.value })
    }

    const getBlogData = async () => {
        setBlogDataloading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/blog/getblog`, { blogId })
            if (data.success) {
                setBlogData(data.blog);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setBlogDataloading(false)
        }
    }

    useEffect(() => {
        getBlogData()
    }, [])

    const editBlog = async () => {
        try {
            setBlogEditLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/blog/editblog`,
                { blogId, updatedBlog: blogData }
            );
            if (data.success) {
                toast.success(data.message);
                getBlogData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setBlogEditLoading(false);
        }
    };

    return (
        <main className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-[calc(100vh-4.6rem)] bg-gray-50">
            {/* LEFT SIDE - EDITOR */}
            <div className="col-span-2 p-3 md:p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">✍️ Edit Blog</h1>
                    <button
                        type='button'
                        onClick={editBlog}
                        disabled={blogEditLoading}
                        className="lg:hidden px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition disabled:opacity-60"
                    >
                        {blogEditLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Title & Slug */}
                <section className="bg-white rounded-xl shadow p-6 space-y-4">
                    <h2 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                        <MdSubtitles /> Title Details
                    </h2>
                    <input
                        type="text"
                        name="title"
                        onChange={handleChange}
                        value={blogData?.title || ""}
                        placeholder="Enter blog title"
                        className="px-4 w-full py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                    />
                    <input
                        type="text"
                        name="slug"
                        onChange={handleChange}
                        value={blogData?.slug || ""}
                        placeholder="custom-slug-here"
                        className="px-4 w-full py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                    />
                </section>

                {/* Category */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-lg text-gray-700 mb-3">📂 Category</h2>
                    <select
                        name="category"
                        value={blogData?.category || ""}
                        onChange={handleChange}
                        className="py-3 px-4 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value="">-- Select Category --</option>
                        <option value="IT & Software">IT & Software</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Design & Creative">Design & Creative</option>
                        <option value="Finance & Accounting">Finance & Accounting</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales & Business Development">Sales & Business Development</option>
                        <option value="Engineering & Architecture">Engineering & Architecture</option>
                    </select>
                </section>

                {/* Tags */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-lg text-gray-700 mb-3">🏷 Tags</h2>
                    <input
                        type="text"
                        placeholder="Type a tag and press Enter"
                        className="px-4 py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value.trim() !== "") {
                                e.preventDefault();
                                const newTags = [...(blogData.tags || []), e.target.value.trim()];
                                setBlogData({ ...blogData, tags: newTags });
                                e.target.value = "";
                            }
                        }}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {blogData?.tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {tag}
                                <span
                                    onClick={() =>
                                        setBlogData((prev) => ({
                                            ...prev,
                                            tags: prev.tags.filter((_, idx) => idx !== i),
                                        }))
                                    }
                                    className="text-red-500 cursor-pointer hover:text-red-700"
                                >
                                    &times;
                                </span>
                            </span>
                        ))}
                    </div>
                </section>

                {/* Content */}
                <section className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-lg text-gray-700 mb-3">📝 Content</h2>
                    <JoditEditor
                        ref={editor}
                        value={blogData?.content || ""}
                        config={{
                            readonly: false,
                            height: 400,
                            uploader: { insertImageAsBase64URI: true },
                            toolbarSticky: false,
                        }}
                        onBlur={(newContent) =>
                            setBlogData((prev) => ({ ...prev, content: newContent }))
                        }
                    />
                </section>

                {/* Cover Image */}
                <section className="bg-white rounded-xl shadow p-3 md:p-6">
                    <h2 className="font-semibold text-lg text-gray-700 mb-3">🖼 Cover Image</h2>
                    <div className="relative w-full h-[280px] border-2 border-dashed rounded-xl flex flex-col justify-center items-center bg-gray-50 hover:bg-gray-100 transition overflow-hidden">
                        {blogData?.coverImage ? (
                            <img
                                loading='lazy'
                                src={
                                    typeof blogData.coverImage === "string"
                                        ? `${backendUrl}/${blogData.coverImage}`
                                        : URL.createObjectURL(blogData.coverImage)
                                }
                                alt="preview"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <p className="text-gray-400">Drag & Drop or Select an Image</p>
                        )}
                        <input
                            type="file"
                            name="coverImage"
                            onChange={(e) =>
                                setBlogData({ ...blogData, coverImage: e.target.files[0] })
                            }
                            className="px-4 py-2 absolute bottom-0 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                        />
                    </div>
                </section>
            </div>

            <aside className="p-8 hidden lg:block bg-gray-100 border-l space-y-6 sticky top-0 h-screen overflow-y-auto">
                <div className='flex items-center justify-between'>
                    <h2 className="text-lg font-semibold">🔍 Live Preview </h2>
                    <button
                        type='button'
                        onClick={editBlog}
                        disabled={blogEditLoading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition disabled:opacity-60"
                    >
                        {blogEditLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Fake Browser Bar */}
                <div className="w-full max-w-3xl mx-auto mt-2">
                    <div className="bg-gray-200 rounded-t-xl flex items-center px-3 h-8 gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                    <div className="bg-white border border-gray-300 rounded-b-xl flex items-center px-3 py-2 shadow-md">
                        <FiSearch className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-800 truncate block">
                            <span className="text-gray-400">https://alfacareer.com/</span>
                            {blogData.slug}
                        </span>
                    </div>
                </div>

                {/* BlogCard Preview */}
                <div className="mt-4">
                    <BlogCard blog={blogData} />
                </div>
            </aside>
        </main>

    )
}

export default EditBlog
