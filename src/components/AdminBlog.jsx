import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import slugify from 'slugify';
import { toast } from 'sonner';
import { TiptapEditor } from "./TiptapEditor";
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import BlogCard from './BlogCard';
import { MdOutlinePreview } from "react-icons/md";
import Img from './Image';
import CustomSelect from './CustomSelect';
import SkillsSelector from './SkillsSelector';

const AdminBlog = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const search = new URLSearchParams(window.location.search);
  const editBlog = search.get("edit");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    tags: [],
    coverImage: null,
    author: userData?.name || "Admin",
  });

  const getBlog = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/blog/getblog/${editBlog}`)
      if (data.success) {
        setFormData({
          title: data.blog.title || "",
          slug: data.blog.slug || "",
          category: data.blog.category || "",
          content: data.blog.content || "",
          tags: data.blog.tags || [],
          coverImage: data.blog.coverImage || null,
          author: data.blog.author || userData?.name || "Admin",
        });
      } else {
        setFormData([])
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (editBlog) {
      getBlog();
    }
  }, [editBlog]);

  const [blogPostLoading, setBlogPostLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: slugify(value, { replacement: "-", lower: true }),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSkillsChange = (newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const [categories, setCategories] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  const getCategories = async () => {
    setCategoryLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/categories`);
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);


  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false)
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

  const [isSlugAvailable, setIsSlugAvailable] = useState(true);
  const [slugSuggestions, setSlugSuggestions] = useState([]);

  // Generate alternative slugs when current slug is already taken
  const generateSlugSuggestions = (base) => {
    const timestamp = Date.now().toString().slice(-4);
    return [
      `${base}-post`,
      `${base}-blog`,
      `${base}-article`,
      `${base}-${timestamp}`,
      `${base}-${Number(timestamp) + 1}`,
      `${base}-${Number(timestamp) + 8}`,
      `${base}-${Number(timestamp) + 9}`,
    ];
  };

  useEffect(() => {
    if (!formData?.title || !formData?.slug) return;

    const exists = blogs.some((blog) => blog.slug === formData.slug);

    setIsSlugAvailable(!exists);

    if (exists) {
      setSlugSuggestions(generateSlugSuggestions(formData.slug));
    } else {
      setSlugSuggestions([]);
    }
  }, [blogs, formData.slug, formData.title]);


  const createBlog = async (status) => {
    setBlogPostLoading(true);

    try {
      const fd = new FormData();

      // Append simple fields
      fd.append("title", formData.title);
      fd.append("slug", formData.slug);
      fd.append("category", formData.category);
      fd.append("content", formData.content);
      fd.append("author", formData.author);
      fd.append("status", status);

      // Append tags properly
      formData.tags.forEach(tag => {
        fd.append("tags[]", tag);
      });

      // Append image ONLY if user selected a new one
      if (formData.coverImage instanceof File) {
        fd.append("coverImage", formData.coverImage);
      }

      let response;

      if (editBlog) {
        response = await axios.patch(
          `${backendUrl}/api/blog/editblog/${editBlog}`,
          fd
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/blog/createblog`,
          fd
        );
      }

      const { data } = response;

      if (data.success) {
        toast.success(data.message);

        setFormData({
          title: "",
          slug: "",
          category: "",
          content: "",
          tags: [],
          coverImage: null,
          author: userData?.name || "Admin",
        });

        navigate("/admin/blog-management");
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setBlogPostLoading(false);
    }
  };


  return (
    <main className="w-full p-6 bg-white rounded-lg shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {editBlog ? 'Edit Blog' : 'Add New Blog'}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/blog-management")}
            className="secondary-btn !rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={(e) => { e.preventDefault(); createBlog('draft') }}
            disabled={blogPostLoading}
            className="primary-btn !rounded-md"
          >
            Save as Draft
          </button>
          <button
            onClick={(e) => { e.preventDefault(); createBlog('published') }}
            disabled={blogPostLoading}
            className="primary-btn"
          >
            {blogPostLoading ? "Posting..." : "Post Blog"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Form */}
        <form className="flex flex-col gap-8 flex-1" onSubmit={createBlog}>

          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Info</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blog Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--primary-color)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
                <div className="flex items-center w-full bg-[#f9f9f9] border border-gray-300 rounded-md overflow-hidden">
                  <span className="text-gray-600 bg-[#f9f9f9] px-4 py-2 whitespace-nowrap text-sm border-r border-gray-300 tracking-wider">
                    https://alfacareers.com/blog/<b>{formData.category ? slugify(formData.category, { lower: true }) : "category"}</b>/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    disabled={editBlog}
                    value={formData.slug || ""}
                    onChange={handleChange}
                    className={`w-full bg-white px-4 py-2 text-gray-800 outline-none ${editBlog && "cursor-not-allowed"} `}
                    placeholder="post-url-slug"
                    title={editBlog ? "Slug cannot be edited after creation" : ""}
                    required
                  />
                </div>

                {
                  !editBlog &&
                    !isSlugAvailable && slugSuggestions.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-red-600 text-sm mb-1">Slug not available. Try one:</p>
                      <div className="flex flex-wrap gap-2">
                        {slugSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleChange({ target: { name: "slug", value: s } })}
                            className="bg-[var(--accent-color)] text-[var(--primary-color)] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-[var(--primary-color)]/20"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : isSlugAvailable && formData.slug ? (
                    <p className="text-green-600 text-sm mt-1">Slug is available</p>
                  ) : null}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <CustomSelect
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </CustomSelect>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Skills) *</label>
                  <SkillsSelector
                    selectedSkills={formData.tags}
                    onSkillsChange={handleSkillsChange}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Content */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Content</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Main Content *</label>
              <TiptapEditor
                value={formData.content}
                onChange={handleContentChange}
              />
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Media */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Featured Image</h2>
            <div className="relative w-full h-[300px] border-2 border-[var(--primary-color)]/20 border-dashed rounded-2xl overflow-hidden bg-gray-50 flex justify-center items-center hover:bg-gray-100 transition-colors">
              {formData.coverImage ? (
                <Img
                  src={formData.coverImage instanceof File ? URL.createObjectURL(formData.coverImage) : formData.coverImage}
                  style="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <p>Click to upload cover image</p>
                </div>
              )}
              <input
                type="file"
                name="coverImage"
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.files[0] })}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </section>

        </form>

        {/* Right: Preview */}
        <div className="w-full lg:w-[400px] shrink-0">
          <h2 className="font-semibold mb-4 flex gap-2 items-center text-gray-800">
            <MdOutlinePreview className="text-[var(--primary-color)]" /> Live Preview
          </h2>
          <div className="sticky top-6 pointer-events-none">
            <BlogCard blog={formData} />
          </div>
        </div>

      </div>
    </main>
  );
};

export default AdminBlog;