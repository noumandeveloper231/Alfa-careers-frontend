import axios from 'axios';
import { useContext, useState } from 'react'
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { useEffect } from 'react';
import BlogsSection from '../components/BlogsSection';

// React Icons
import Loading from '../components/Loading';
import Img from '../components/Image';
import Navbar from '../components/Navbar';
import { getCategoryName } from '../utils/categoryNames';
import '../description.css'

const BlogsDetails = () => {
  const { slug } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const [blog, setBlog] = useState({})

  const getBlog = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/blog/getblog/${slug}`);
      if (data.success) {
        console.log('data', data)
        setBlog(data.blog || {});
        setLoading(false)
      } else {
        toast.error(data.message)
        setLoading(false)
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBlog();
  }, [])

  console.log(blog);

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <Navbar />
      <div className='w-full min-h-screen bg-white mb-10'>
        <Img src={blog.coverImage || '/placeholder.png'} style='h-[400px] object-cover w-full' />
        <div className='flex max-w-6xl mx-auto gap-15 '>
          <div className='mt-10 w-[70%]'>
            {/* <Link className='cursor-pointer transition-all underline underline-offset-4 hover:text-[var(--primary-color)] uppercase'
            to={'/category-jobs?category=' + slugify(blog?.category)}
            >
              {blog?.category || "Learn"}
            </Link> */}
            <h4 className='w-full text-4xl flex justify-center font-medium text-black leading-13 mt-5'>
              {blog?.title || "Hello"}
            </h4>
            <p className='mt-5'>
              <i>by</i> <b>Admin</b> <span className='text-gray-400 italic'> | {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              </span>
            </p>
            <div className='description' dangerouslySetInnerHTML={{ __html: blog?.content }} />

            <hr className='my-10 border-gray-100' />

            <div className='w-full'>
              <h4 className='text-4xl font-medium text-black'>Related Articles</h4>
              <div className='mt-10 w-full'>
                <BlogsSection limit={2} className={"grid-cols-2"} />
              </div>
            </div>
          </div>

          <div className='mt-10 px-4 w-[30%] mb-10'>
            <h4 className='font-semibold text-md'>
              Category
            </h4>
            <span className='mt-3'>
              {getCategoryName(blog?.category)}
            </span>
            <hr className='border-gray-300 mt-10' />
            <h4 className='mt-10 font-semibold text-md'>
              Tags
            </h4>
            <div className='flex flex-wrap gap-4 mt-5'>
              {blog?.tags?.map(tag => (
                <button key={tag} className='cursor-pointer rounded px-4 py-2 hover:bg-[var(--primary-color)] border border-gray-200 capitalize hover:text-white text-[var(--primary-color)] transition-all'>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BlogsDetails;