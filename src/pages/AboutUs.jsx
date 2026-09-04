import React from 'react'
import Navbar from '../components/Navbar'
import Testimonials from '../components/Testimonials'
import Img from '../components/Image'
import { Users, Award, Briefcase, Trophy, Facebook, Instagram, X, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AboutUs = () => {
  const navigate = useNavigate()
  return (
    <div>
      <Navbar />
      <main>
        <section classN ame='max-w-5xl mx-auto px-4 py-12'>
          <p className='text-sm font-semibold text-black text-center'>ABOUT US</p>
          <h4 className='text-2xl font-bold text-black leading-tight text-center mt-2'>We are transforming the way healthcare hires</h4>
          <div className='mt-8 grid grid-cols-1 sm:grid-cols-7 gap-4'>
            <div className='hidden md:block sm:col-span-2 rounded-2xl overflow-hidden bg-gray-100 h-120'>
              <Img src={'https://picsum.photos/600/400?random=1'} style='w-full h-full object-cover' />
            </div>
            <div className='sm:col-span-3 rounded-2xl overflow-hidden bg-gray-100 h-120'>
              <Img src={'https://picsum.photos/600/400?random=2'} style='w-full h-full object-cover' />
            </div>
            <div className='hidden md:block sm:col-span-2 rounded-2xl overflow-hidden bg-gray-100 h-120'>
              <Img src={'https://picsum.photos/600/400?random=3'} style='w-full h-full object-cover' />
            </div>
          </div>
        </section>

        <section className='max-w-xl mx-auto px-4 py-8 text-center'>
          <p className='font-semibold text-black uppercase'>Our mission</p>
          <p className='italic text-gray-8  00 mt-2 text-xl'>We mission is to empower every healthcare professional to find their next job opportunity faster and more efficiently.</p>
        </section>

        <section className='max-w-5xl mx-auto px-4 py-8'>
          <div className='grid grid-cols-2 border-t border-gray-200 py-10 sm:grid-cols-4 gap-6 text-center'>
            <div className='border-r border-gray-200'>
              <p className='mt-2 text-sm font-medium text-black'>Employers</p>
              <p className='text-5xl mt-2 font-semibold text-[var(--primary-color)]'>20+</p>
            </div>
            <div className='border-r border-gray-200'>
              <p className='mt-2 text-sm font-medium text-black'>Hires</p>
              <p className='text-5xl mt-2 font-semibold text-[var(--primary-color)]'>150+</p>
            </div>
            <div className='border-r border-gray-200'>
              <p className='mt-2 text-sm font-medium text-black'>Coworkers</p>
              <p className='text-5xl mt-2 font-semibold text-[var(--primary-color)]'>200+</p>
            </div>
            <div className=''>
              <p className='mt-2 text-sm font-medium text-black'>Awards</p>
              <p className='text-5xl mt-2 font-semibold text-[var(--primary-color)]'>5+</p>
            </div>
          </div>
        </section>

        <section className='max-w-5xl mx-auto flex flex-col items-center px-4 py-12'>
          <p className='text-center text font-semibold text-black uppercase'>OUR LEADERS</p>

          <h4 className='mt-2 text-center text-3xl font-semibold text-black'>Championing change across our <br /> company</h4>
          <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[
              { name: 'Alexander Hugo', role: 'CEO', i: 11 },
              { name: 'Alyssa Snow', role: 'Head of Marketing', i: 12 },
              { name: 'Marcus Phan', role: 'Lead UX Designer', i: 13 },
            ].map((p, idx) => (
              <div key={idx} className=' group flex flex-col items-center text-center'>
                <div className='h-75 w-75 rounded-full overflow-hidden'>

                  <Img src={`https://picsum.photos/300/300?random=${p.i}`} style='h-75 w-75 rounded-full object-cover group-hover:scale-110 transition-all duration-600 ease-in-out' />
                </div>
                <p className='mt-3 font-semibold text-black'>{p.name}</p>
                <p className='mt-1 text-gray-600'>{p.role}</p>
                <div className='mt-4 flex items-center flex-wrap gap-4'>
                  <Facebook size={18} /> <Instagram size={18} /> <X size={18} />
                </div>
              </div>
            ))}
          </div>
          <button className='mt-10 secondary-btn'>
            View Full Team
          </button>
        </section>

        <section className='bg-[#f8f9fc]'>
          <div className='max-w-5xl mx-auto px-4 py-16'>
            <p className='text-center text-sm font-semibold text-black uppercase'>PEOPLE LOVE US</p>
            <p className='mt-2 text-center text-2xl font-semibold text-black'>What our customers says</p>
            <div className='mt-8'>
              <Testimonials />
            </div>
          </div>
        </section>

        <section className='max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
          <div className='lg:col-span-1 space-y-2'>
            <p className='text-sm font-semibold text-black uppercase'>OUR LOCATIONS</p>
            <p className='mt-2 text-center text-2xl font-semibold text-black'>Find us at our global hubs</p>
            <ul className='mt-4 space-y-4 text-gray-700'>
              <li className='flex gap-3'>
                <MapPin />
                <div>
                  <span className='font-semibold'>Chicago</span>
                  <p className='mt-2 ext-sm text-gray-600'>Greenhouse Ave, 120</p>
                  <p className='text-sm text-gray-600'>Greenhouse Ave, 120</p>
                </div>
              </li>
              <li className='flex gap-3'>
                <MapPin />
                <div>

                  <span className='font-semibold'>Amsterdam</span>
                  <p className='mt-2 text-sm text-gray-600'>Keizersgracht 221</p>
                  <p className='text-sm text-gray-600'>Keizersgracht 221</p>
                </div>
              </li>
            </ul>
          </div>
          <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div className='rounded-2xl overflow-hidden bg-gray-100 h-120'>
              <Img src={'https://picsum.photos/600/600?random=21'} style='w-full h-full object-cover' />
            </div>
            <div className='rounded-2xl overflow-hidden bg-gray-100 h-120'>
              <Img src={'https://picsum.photos/600/600?random=22'} style='w-full h-full object-cover' />
            </div>
          </div>
        </section>

        <section className='bg-[url(https://civi.uxper.co/wp-content/uploads/2022/11/bg-about-team-01.webp)] bg-center bg-cover'>
          <div className='max-w-2xl text-center mx-auto px-4 py-25 flex flex-col items-center justify-center'>
            <p className='text-sm font-semibold text-white uppercase'>WE CAN’T WAIT TO MEET YOU!</p>

            <h2 className='mt-2 text-2xl md:text-3xl font-semibold text-white'>Join us as we transform healthcare hiring — one job at a time.</h2>
            <button onClick={() => navigate('/register?user=employee')} className='mt-3 secondary-btn bg-white !border-white !hover:border-white !hover:bg-white'>Join as employer</button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AboutUs