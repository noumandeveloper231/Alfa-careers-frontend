import React from 'react'
import { Bell, Phone, Mail } from 'lucide-react'

const AnnouncementBar = () => {
    return (
        <div className='bg-black py-1 px-12'>
            <div className='max-w-7xl flex flex-col md:flex-row gap-2 mx-auto items-center justify-between text-white text-sm font-light'>
                {/* Left side - Job alert subscription */}
                <div className='flex items-center gap-2'>
                    <span className='rotate-12 text-yellow-400 text-xl'>🔔</span>
                    <span className=''>Subscribe for job alerts by email!</span>
                </div>

                {/* Right side - Contact info */}
                <div className='flex items-center gap-8'>
                    <div className='flex items-center gap-2'>
                        <Phone className='w-4 h-4' />
                        <span>(00) 658 54332</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Mail className='w-4 h-4' />
                        <span>hello@uxper.co</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnnouncementBar
