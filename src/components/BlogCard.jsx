import { useLocation, useNavigate } from 'react-router-dom'
import assets from '../assets/assets';
import Img from '../components/Image';
import { getCategoryName } from '../utils/categoryNames';

const BlogCard = ({ blog, layout = "vertical" }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "October 29, 2022";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    function getExcerpt(html = "", limit = 200) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const firstP = doc.querySelector("p")?.textContent || "";
        return firstP.slice(0, limit).trim();
    }

    return (
        <div className={`bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer mx-auto ${layout === "horizontal" ? "flex" : ""}`}>
            {/* Image Section */}
            <div className={`relative group w-full ${layout === "horizontal" ? "h-48" : "h-full"}`}>
                <Img
                    loading='lazy'
                    src={
                        blog.coverImage
                            ? location.pathname === "/editblog"
                                ? blog.coverImage // already saved file path
                                : blog.coverImage instanceof File || blog.coverImage instanceof Blob
                                    ? URL.createObjectURL(blog.coverImage) // local file
                                    : blog.coverImage // fallback if it's a string URL
                            : assets.preview_image // default preview
                    }
                    style={`bg-blue-300 w-full object-cover transition-transform duration-300 group-hover:scale-105 ${layout === "horizontal" ? "h-100" : "h-48"}`}
                />
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col">
                {/* Category */}
                <div className="mb-1">
                    <span className="text-red-500 text-sm font-semibold uppercase tracking-wide">
                        {getCategoryName(blog?.category) || "RECRUITMENT & HIRING"}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-gray-900 text-xl font-bold leading-tight mb-1 line-clamp-2">
                    {blog?.title || "How to Find and Hire Top Talent Quickly"}
                </h3>

                {/* Author and Date */}
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                    <span>BY</span>
                    <span className="text-blue-500 font-medium">
                        Admin
                    </span>
                    <span>|</span>
                    <span>
                        {formatDate(blog?.createdAt)}
                    </span>
                </div>

                {/* Excerpt */}
                <div className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {getExcerpt(blog?.content) || "In today's fast-paced business environment, finding and hiring top talent efficiently is crucial for maintaining a competitive edge. Companies that..."}
                </div>

                {/* Read More Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (location.pathname !== "/admin") {
                            navigate(`/blogs/${blog?.slug}`);
                        }
                    }}
                    className="primary-btn w-full"
                >
                    READ ARTICLES
                </button>
            </div>
        </div>
    )
}

export default BlogCard