import { useState } from 'react'
import Navbar from '../components/Navbar'

const ContactUs = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div>
      <Navbar />
      <main className='max-w-6xl mx-auto px-4 py-12'>
        <h1 className='text-3xl md:text-4xl font-bold text-center text-black'>Contact Us</h1>
        <p className='text-center text-gray-500 mt-2'>Have a question or need more information?</p>
        <p className='text-center text-gray-500'>Just drop us a line!</p>

        <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <p className='text-black font-semibold'>Phone number</p>
              <p className='text-gray-600'>(00) 723 445 793</p>
            </div>
            <div className='space-y-2'>
              <p className='text-black font-semibold'>Email address</p>
              <p className='text-gray-600'>hello@uxper.co</p>
            </div>
            <div className='space-y-2'>
              <p className='text-black font-semibold'>Address</p>
              <p className='text-gray-600'>2866 Oakway Lane, New York, USA</p>
            </div>
            <div className='rounded-2xl overflow-hidden border border-gray-200'>
              <iframe
                title='Oakway Ln'
                src='https://www.google.com/maps?q=Oakway%20Ln&output=embed'
                className='w-full h-64'
                loading='lazy'
              />
            </div>
          </div>

          <div>
            <p className='text-black font-semibold mb-3'>Send us a message</p>
            <form onSubmit={handleSubmit} className='rounded-2xl bg-gray-50 p-6 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <input
                  name='firstName'
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder='First name'
                  className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none'
                />
                <input
                  name='lastName'
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder='Lastname'
                  className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none'
                />
              </div>
              <div className='space-y-1'>
                <input
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='Enter your email'
                  className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none'
                />
                {submitted && !form.email && (
                  <p className='text-red-500 text-xs'>Please fill out this field.</p>
                )}
              </div>
              <div className='space-y-1'>
                <input
                  name='phone'
                  value={form.phone}
                  onChange={handleChange}
                  placeholder='Enter your phone'
                  className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none'
                />
                {submitted && !form.phone && (
                  <p className='text-red-500 text-xs'>Please fill out this field.</p>
                )}
              </div>
              <textarea
                name='message'
                value={form.message}
                onChange={handleChange}
                placeholder='Message'
                rows={4}
                className='w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none resize-none'
              />
              <button type='submit' className='primary-btn w-full'>Send message</button>
              {submitted && (!form.firstName || !form.lastName || !form.email || !form.phone || !form.message) && (
                <div className='mt-2 rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-gray-800'>
                  One or more fields have an error. Please check and try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ContactUs