import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// React Icons
import { FaQuoteRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import Loading from "./Loading";
import NotFound404 from "./NotFound404";
import Img from "./Image";

const Testimonials = () => {
    const { backendUrl } = useContext(AppContext);
    const [testimonials, setTestimonials] = useState([])

    const [getReviewsLoading, setGetReviewsLoading] = useState(false)
    const getReviews = async () => {
        setGetReviewsLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/reviews/get-reviews`)

            if (data.success) {
                setTestimonials(data.reviews);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setGetReviewsLoading(false)
        }
    }

    useEffect(() => {
        getReviews();
    }, [])

    if (getReviewsLoading) {
        return <Loading />
    }

    const staticTestimonials = {
        reviews: [
            {
                name: "John Doe", rating: 5, review: "The Support is Awesome", reviewDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam egestas augue in dolor imperdiet, in consequat libero tristique.", role: "Designer",
                company: "Amazon"
            },

            {
                name: "Jane Smith", rating: 4, review: "Excellent Design", reviewDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam egestas augue in dolor imperdiet, in consequat libero tristique.", role: "Web Developer",
                company: "Webflow"
            },
            {
                name: "Bob Johnson", rating: 3, review: "Highly Recommended",
                company: "Shopify",
                reviewDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam egestas augue in dolor imperdiet, in consequat libero tristique.", role: "Digital Marketer"
            },
        ]
    }

    return (
        <div className="mt-4 relative z-0">
            {/* Left Navigation Button */}
            <div className="testimonials-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--primary-color)] hover:text-white group transition-colors">
                <FaChevronLeft className="group-hover:text-white" size={16} />
            </div>

            {/* Right Navigation Button */}
            <div className="testimonials-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--primary-color)] hover:text-white group transition-colors">
                <FaChevronRight className="group-hover:text-white" size={16} />
            </div>

            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                loop={staticTestimonials.reviews.length >= 2}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: true,
                    pauseOnMouseEnter: true,
                }}
                pagination={{
                    clickable: true,
                    el: '.testimonials-pagination-custom',
                    bulletClass: 'testimonials-pagination-bullet-custom',
                    bulletActiveClass: 'testimonials-pagination-bullet-active-custom',
                }}
                navigation={{
                    nextEl: '.testimonials-button-next',
                    prevEl: '.testimonials-button-prev',
                }}
                breakpoints={{
                    320: { slidesPerView: 1, spaceBetween: 10 },
                    640: { slidesPerView: 2, spaceBetween: 15 },
                }}
                className="pb-12"
            >

                {staticTestimonials?.reviews?.length === 0 ? <NotFound404 value={"No Testimonals Yet"} margin={"mt-5"} /> : staticTestimonials?.reviews?.slice(0, 10)?.map((e, i) => (
                    <SwiperSlide key={i}>
                        <div className="p-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white">
                            <span className="flex text-lg items-center gap-4 font-semibold">
                                "{e.review}"
                            </span>
                            <p className="line-clamp-5 min-h-[100px] text-gray-600">
                                {e.reviewDescription}
                            </p>
                            <span className="flex items-center gap-4">
                                <Img
                                    loading="lazy"
                                    src={"https://picsum.photos/200/200?random=" + i}
                                    style="h-15 w-15 rounded-full object-cover border"
                                />{" "}

                                <div className="flex flex-col">
                                    <span className="text-md font-semibold" >
                                        {e.name}
                                    </span>
                                    <span className="text-md text-gray-600">
                                        {e.role} at {e.company}
                                    </span>
                                </div>
                            </span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Pagination Dots */}
            <div className="testimonials-pagination-custom flex justify-center gap-2 mt-6"></div>
        </div>
    );
};

export default Testimonials;