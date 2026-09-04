import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BlogsSection from '../components/BlogsSection'

const Blogs = () => {
  return (
    <div>
      <Navbar />
      <div className='bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4 py-20'>
          <nav className='text-gray-600 flex items-center gap-2'>
            <Link to={'/'} >Home</Link> <ChevronRight size={20} /> <Link to={'/blogs'} >Blogs</Link>
          </nav>
          <h4 className='mt-3 text-5xl text-gray-800'>
            Our Blog
          </h4>
          <div className='flex max-w-6xl mt-10  mx-auto gap-15'>
            <div className='w-full'>
              <BlogsSection layout='horizontal' />
            </div>
            <div className='mt-10 px-4 w-[30%]'>
              <h4 className='font-semibold text-md'>
                Category
              </h4>
              <p className='mt-3'>
                Information
              </p>
              <p className='mt-3'>
                Interview
              </p>
              <p className='mt-3'>
                Learn
              </p>
              <p className='mt-3'>
                Skill
              </p>
              <p className='mt-3'>
                Speaking
              </p>
              <hr className='border-gray-300 mt-10' />
              <h4 className='mt-10 font-semibold text-md'>
                Tags
              </h4>
              <div className='flex flex-wrap gap-4 mt-5'>
                {["app", "design", "digital", "jobs", "skills", "topic"]?.map(tag => (
                  <span className='cursor-pointer rounded p-2 hover:bg-[var(--primary-color)] border border-gray-100 capitalize hover:text-white text-[var(--primary-color)] transition-all'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blogs
