import { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import CompanyCard from "./CompanyCard";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { FaExclamation } from "react-icons/fa";

const CompanySection = () => {
    const [loading, setLoading] = useState(false);
    const { backendUrl } = useContext(AppContext)

    const [companies, setCompanies] = useState([])
    const getCompanies = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/allemployees`);
            console.log('data', data)
            if (data.success) {
                setCompanies(data.employees);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        getCompanies();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="flex gap-2 mb-4">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <>
                <div className="text-center py-5 flex flex-col items-center gap-4">
                    <FaExclamation size={40} />
                    <p className="text-gray-600">No Companies Uploaded Today.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="relative">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={24}
                    slidesPerView={3} // default
                    breakpoints={{
                        768: { // md
                            slidesPerView: 3, // still 1 slide per view
                        },
                    }}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination-custom',
                        bulletClass: 'swiper-pagination-bullet-custom',
                        bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                    }}
                    className="pb-16"
                >
                    {companies.map((company, index) => (
                        <SwiperSlide key={index}>
                            <CompanyCard type="vertical" company={company} />
                        </SwiperSlide>
                    ))}
                </Swiper>


                {/* Custom Pagination Dots */}
                <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>
            </div>
        </>
    );
};

export default CompanySection;
