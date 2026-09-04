import React, { useContext, useEffect, useState } from 'react'
import BlogCard from './BlogCard'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import { toast } from 'sonner';
import NotFound404 from './NotFound404';
import Loading from './Loading';

const BlogsSection = ({ className, limit = 4, layout = "vertical" }) => {
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([])

  const getAllBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/blog/getallblogs`);
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllBlogs();
  }, []);

  if (loading) {
    return <Loading />
  }

  // const staticBlogs = [
  //   {
  //     id: 1,
  //     title: "The Best Practices for Software Development",
  //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nibh et semper aliquet, nulla velit eleifend nibh, non luctus nulla risus sed felis.",
  //     coverImage: `https://picsum.photos/512/512/?random=1`,
  //     createdAt: "2022-01-01",
  //     slug: "the-best-practices-for-software-development",
  //     category: "RECRUITMENT & HIRING"
  //   },
  //   {
  //     id: 2,
  //     title: "Why Software Development is so Important",
  //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nibh et semper aliquet, nulla velit eleifend nibh, non luctus nulla risus sed felis.",
  //     coverImage: `https://picsum.photos/512/512/?random=2`,
  //     createdAt: "2022-01-15",
  //     slug: "why-software-development-is-so-important",
  //     category: " & HIRING"
  //   },
  //   {
  //     id: 3,
  //     title: "The Future of Software Development",
  //     description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nibh et semper aliquet, nulla velit eleifend nibh, non luctus nulla risus sed felis.",
  //     coverImage: "https://picsum.photos/512/512/?random=3",
  //     createdAt: "2022-02-01",
  //     slug: "the-future-of-software-development",
  //     category: "RECRUITMENT & HIRING"
  //   }
  // ]

  return (
    <div className='flex flex-col items-center'>
      <section className={`w-full max-w-6xl mx-auto grid ${className} items-center gap-4`}>
        {blogs.length > 0 ? blogs?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
          .slice(0, limit)
          .map((blog, index) => (
            <BlogCard layout={layout} key={index} blog={blog} />
          )) :
          <NotFound404 margin={"mt-10"} value={"No Recent Blogs"} />
        }
      </section>
      <Link to={'/blogs'}>
        <button className='mt-10 secondary-btn'>
          View more articles
        </button>
      </Link>
    </div>
  )
}

export default BlogsSection