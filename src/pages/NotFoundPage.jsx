import Navbar from '../components/Navbar'
import Img from '../components/Image'
import assets from '../assets/assets'
import { ChevronRight } from 'lucide-react'

const NotFoundPage = () => {
    return (
        <div className='flex flex-col min-h-screen'>
            <div className='w-full border-b border-gray-200'>
                <Navbar />
            </div>
            <main className='flex-1 px-8  flex flex-col justify-between py-20 items-center gap-8'>
                <h4 className='font-semibold text-3xl md:text-4xl lg:text-5xl text-center text-black'>
                    Hmm, that didn’t work.
                </h4>
                <p className='text-xl text-center md:text-2xl text-gray-500'>
                    The page you are looking for cannot be found
                </p>
                <Img src={assets.not_found_404} alt="Not Found"/>
                <button className='secondary-btn flex items-center gap-2 md:gap-3 lg:gap-4'>
                    Go to Home Page <ChevronRight />
                </button>
            </main>
        </div>
    )
}

export default NotFoundPage