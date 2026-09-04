import Navbar from '../components/Navbar'
import { ChevronRight } from 'lucide-react'
import Img from '../components/Image'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { openImage } from '../portals/ImagePortalManager'

const PrivacyPolicy = () => {
    const { setShowImage } = useContext(AppContext)
    return (
        <div>
            <Navbar />
            <div className='bg-[#f9f9f9] py-20'>
                <div className='mx-auto max-w-6xl ' >
                    <div className='flex items-center gap-2'>
                        Home <ChevronRight size={20} /> Privacy Policy
                    </div>
                    <h4 className='mt-4 text-3xl md:text-4xl lg:text-5xl font-medium text-black'>
                        Privacy Policy
                    </h4>
                </div>
            </div>
            <div className='flex gap-4 max-w-6xl mx-auto py-20'>
                <div className="w-[70%]  space-y-6 text-gray-700 leading-relaxed">
                    <h4 className='text-3xl font-semibold text-black'>
                        Privacy Policy
                    </h4>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac maximus velit. Maecenas
                        ultrices dignissim condimentum. Cras dapibus elit odio, pellentesque sodales elit vehicula
                        eget. Maecenas pretium, dui in aliquet maximus, urna eros ornare mauris, at semper tempor
                        tortor sit amet mi.
                    </p>

                    <h4 className="text-2xl font-semibold text-black">1. Definitions</h4>
                    <p>
                        Phasellus felis odio, interdum lacinia nulla eget, tincidunt condimentum dui. Nunc auctor
                        fringilla lectus. Ut imperdiet, diam vitae bibendum ornare, urna eros ornare mauris, at
                        semper tempor tortor sit amet mi.
                    </p>

                    <h5 className="text-xl font-semibold text-black">1.1 Provision of Access</h5>
                    <p>
                        Morbi rutrum velit diam, pulvinar et ligula at, efficitur sodales turpis. Suspendisse tristique
                        tortor vel odio pulvinar ultrices. Maecenas consectetur lorem lobortis finibus. Vivamus
                        eleifend lacus lacinia interdum ullamcorper. Morbi eu turpis leo dignissim gravida. Curabitur
                        sem mi, feugiat id lectus a, eleifend convallis odio.
                    </p>

                    <h5 className="text-xl font-semibold text-black">1.2 Documentation License</h5>
                    <p>
                        Curabitur sem mi, feugiat id lectus a, eleifend convallis odio.
                    </p>

                    <h5 className="text-xl font-semibold text-black">1.3 Use Restrictions</h5>
                    <p>
                        Phasellus felis odio, interdum lacinia nulla eget, tincidunt condimentum dui. Nunc auctor
                        fringilla lectus. Ut imperdiet, diam vitae bibendum ornare, urna eros ornare mauris, at
                        semper tempor tortor sit amet mi.
                    </p>

                    <h5 className="text-xl font-semibold text-black">1.4 Reservation of Rights</h5>
                    <p>
                        Proin sit amet elit ac amet felis eleifend dignissim at sit amet turpis. Proin consectetur,
                        massa non convallis cursus, leo lacus convallis purus, et pharetra risus massa lacus quis
                        mauris. Nam tortor ut urna accumsan lobortis.
                    </p>

                    <h4 className="text-2xl font-semibold text-black">2. Support</h4>
                    <p>
                        Praesent vel ante at eros gravida scelerisque at a augue. Nulla finibus eget neque id
                        fermentum. Suspendisse convallis nibh non auctor iaculis. Nulla quis magna tortor. Nulla at
                        interdum velit. Donec ac nisl metus. Integer fringilla vulputate turpis, at malesuada velit
                        rhoncus nec. Proin eu felis quis sapien tempor placerat nec in orci. Nullam ut neque vehicula
                        augue gravida viverra nec eget neque. Nullam viverra ex massa porttitor porttitor sit amet et
                        urna.
                    </p>

                    <h4 className="text-2xl font-semibold text-black">3. Fees and Taxes</h4>
                    <p>
                        Integer fringilla vulputate turpis, at malesuada velit rhoncus nec. Proin eu felis quis sapien
                        tempor placerat nec in orci. Nullam ut neque vehicula augue gravida viverra nec eget neque.
                        Nullam viverra ex massa porttitor porttitor sit amet et urna.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Ut imperdiet, diam vitae bibendum ornare.</li>
                        <li>Phasellus felis odio, interdum lacinia nulla eget.</li>
                        <li>Nunc auctor fringilla lectus.</li>
                        <li>Ut imperdiet, diam vitae bibendum ornare.</li>
                    </ul>

                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac maximus velit. Maecenas
                        ultrices dignissim condimentum. Cras dapibus elit odio, pellentesque sodales elit vehicula
                        eget. Maecenas pretium, dui in aliquet maximus, urna eros ornare mauris, at semper tempor
                        tortor sit amet mi.
                    </p>
                </div>
                <div className='w-[30%]'>
                    <Img src={"https://civi.uxper.co/wp-content/uploads/2022/12/banner-blog.webp"} />
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy