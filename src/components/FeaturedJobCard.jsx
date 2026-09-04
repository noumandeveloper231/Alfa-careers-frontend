import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';

// React Icons
import { IoHomeOutline } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { AppContext } from '../context/AppContext';
import { getCategoryName } from '../utils/categoryNames';
import Img from './Image';
import { ChevronRight, Clock } from 'lucide-react';
import Currency from './CurrencyConverter';

const FeaturedJobCard = ({ data }) => {
    const { backendUrl, toggleSaveJob, savedJobs } = useContext(AppContext);

    const navigate = useNavigate();

    const timeSince = (createdAt) => {
        if (!createdAt) return "Unknown";
        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
        const diff = (new Date() - new Date(createdAt)) / 1000; // in seconds

        if (diff < 60) return rtf.format(-Math.floor(diff), "second");
        if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
        if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
        if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), "day");
        if (diff < 31536000) return rtf.format(-Math.floor(diff / 2592000), "month");
        return rtf.format(-Math.floor(diff / 31536000), "year");
    };

    return (
        <>
            <div className='px-4 py-2 sm:py-4 md:py-6 lg:py-8 w-full h-50 sm:h-60 md:h-70 lg:h-80 rounded-lg bg-white border border-gray-300 cursor-pointer'
                onClick={() =>
                    navigate('/jobDetails/' + data._id)
                }
            >
                <div className='w-full h-full flex flex-col gap-6'>
                    <span className='absolute top-4 right-4 bg-gray-300 px-3 text-sm rounded '>
                        Sponsored
                    </span>
                    <div className='flex w-full text-sm whitespace-nowrap items-center gap-2 px-4 font-semibold'>
                        <IoHomeOutline size={15} /> <span className='text-[var(--primary-color)]'>/</span> {getCategoryName(data.category)} {data.subCategory ? <span className='text-[var(--primary-color)]'>/</span> + data.subCategory : null}
                    </div>
                    <div className='p-4 border-b border-gray-300 h-full flex items-center'>
                        <div>
                            <span className='font-semibold mb-4 flex items-center gap-4'>
                                {data?.companyProfile ? (
                                    <Img
                                        style="w-12  h-12 rounded-xl object-cover border border-gray-300"
                                        src={backendUrl + "/uploads/" + data?.companyProfile}
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center bg-gray-100 text-gray-700 font-bold">
                                        {data?.company?.slice(0, 1)?.toUpperCase()}
                                    </div>
                                )}
                                <div className='whitespace-nowrap'>
                                    <h4 className='font-semibold text-[var(--secondary-color)] text-lg'>
                                        {data.title}
                                    </h4>
                                    <span className='text-sm'>
                                        Net Followers
                                    </span>
                                </div>
                            </span>
                            {/* <div dangerouslySetInnerHTML={{_html: "Description Here"}}/> */}
                            <span className='w-max px-3 py-1 rounded-md bg-[var(--primary-color)]/10 text-sm font-semibold text-[var(--primary-color)]'>
                                {data?.salaryType === "fixed" ? <span>
                                    <Currency amount={data?.fixedSalary} from={data?.jobsCurrency} />
                                </span> : <span>

                                    <Currency amount={data?.minSalary} from={data?.jobsCurrency} /> - <Currency amount={data?.maxSalary} from={data?.jobsCurrency} /></span>}
                            </span>
                            <div className='flex mt-4 items-center flex-wrap gap-4'>
                                <span className='text-white border border-green-500 bg-green-300 px-4 rounded'>
                                    {data?.jobType}
                                </span>

                                <span className='text-white border border-red-500 bg-red-300 px-4 rounded'>
                                    {data?.locationType}
                                </span>
                            </div>
                        </div>
                        <div className='w-full flex flex-col justify-between h-full'>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSaveJob(data?._id)
                                }
                                }
                                className='self-end p-2 border border-gray-200 rounded-md text-[var(--primary-color)] right-3 text-sm cursor-pointer top-4'>
                                <span>
                                    {[...savedJobs].includes(data?._id) ? <IoMdHeart size={20} /> : <CiHeart size={20} />}
                                </span>
                            </span>
                            <span className='self-end underline underline-offset-4 hover:text-blue-500 cursor-pointer transition-all flex items-center gap-2 text-sm'
                                onClick={(e) => {
                                    navigate('/jobDetails/' + data._id)
                                }
                                }
                            >
                                View Details <ChevronRight size={20} />
                            </span>
                        </div>
                    </div>
                    <div className='flex w-full justify-between items-center gap-1 text-gray-500'>
                        <span className='flex items-center gap-2'>
                            {data?.applicationMethod ? data.applicationMethod[0]?.toUpperCase() + data.applicationMethod.slice(1) : ''}
                            <FaPaperPlane className='text-[var(--primary-color)]' />
                        </span>
                        <span className='flex items-center text-xs gap-1'>
                            <Clock size={14} />
                            {timeSince(data?.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FeaturedJobCard
