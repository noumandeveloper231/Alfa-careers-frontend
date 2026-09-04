import Navbar from '../components/Navbar'
import Img from '../components/Image'
import { DollarSign, Facebook, X, Instagram, Globe, File, MapPin, Plus } from 'lucide-react'
import { FaPaperPlane } from 'react-icons/fa'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import FollowButton from '../components/FollowButton'
import Breadcrumbs from '../components/Breadcrumbs'
import { getCategoryName } from '../utils/categoryNames'
import '../description.css'

const CandidateProfile = () => {
    const { slug } = useParams()
    const { backendUrl } = useContext(AppContext);

    const [candidate, setCandidate] = useState({});

    // Fetch candidate profile data
    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/getcandidate/${slug}`)
                if (data.success) {
                    setCandidate(data.candidate)
                } else {
                    setCandidate({})
                }
            } catch (error) {
                console.error("Error fetching candidate:", error);
            }
        };
        fetchCandidate();
    }, []);

    // 🔔 Trigger profile view count after candidate data loads
    useEffect(() => {
        if (!candidate?.authId) return;
        const recordView = async () => {
            try {
                await axios.post(`${backendUrl}/api/profile/${candidate.authId}/view`);
            } catch (err) {
                // silent fail – no toast, just log
                console.error("Profile view track error", err?.response?.data || err.message);
            }
        };
        recordView();
    }, [candidate?.authId, backendUrl]);

    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='p-8 bg-[var(--bg)] flex-1'>
                <div className='max-w-6xl mx-auto'>
                    {/* BreakCrumbs */}
                    <Breadcrumbs />
                    <section className='flex flex-col md:flex-row gap-8'>
                        <div className='w-full bg-white rounded-2xl md:w-[60%]'>
                            <div className='p-8'>
                                <div className="flex flex-col md:flex-row items-center
                                 md:items-start space-x-4 gap-4 md:gap-0">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--accent-color)] border border-[var(--primary-color)]/30 flex items-center justify-center">
                                        {/* Replace with an actual image component or use an SVG/icon */}
                                        <Img src={candidate.profilePicture || "https://picsum"} />
                                    </div>
                                    <div className="flex-grow self-center md:self-start">
                                        <h2 className="text-2xl font-semibold text-gray-800">{candidate?.name}</h2>

                                        {/* Details Row */}
                                        <div className="flex flex-wrap items-center space-x-3 text-sm text-gray-500 mt-1">
                                            {/* Role */}
                                            <Link to={`/candidates?cat=${encodeURIComponent(candidate?.category || '')}`} className="text-[var(--primary-color)] font-medium">{getCategoryName(candidate?.category)}</Link>

                                            {/* Separator Dot/Circle (using text-xs for a small dot) */}
                                            <span className="text-xs">•</span>

                                            {/* Location */}
                                            <div className="flex items-center space-x-1">
                                                <MapPin />
                                                <span>{candidate?.city}</span>
                                            </div>

                                            {/* Separator Dot/Circle */}
                                            <span className="text-xs">•</span>

                                            {/* Rate */}
                                            <div className="flex items-center space-x-1">
                                                <DollarSign />
                                                <span>${candidate?.offeredSalary}/{candidate?.salaryType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: Actions */}
                                <div className="flex flex-wrap space-x-3 gap-4 md:gap-0 items-center justify-center md:justify-start mt-8">

                                    {/* Follow Button */}
                                    <FollowButton company={candidate} />

                                    {/* Save to PDF Button */}
                                    <button
                                        onClick={() => toast.warn("Save to PDF feature is not available yet")}
                                        className="secondary-btn flex items-center gap-2">
                                        <File size={20} />
                                        <span>Save to PDF</span>
                                    </button>

                                    {/* Invite Button (using a placeholder icon for the "sprout" or "invite" icon) */}
                                    <button
                                        onClick={() => toast.warn("Invite feature is not available yet")}
                                        className="secondary-btn flex items-center gap-2">
                                        <span className="text-lg mr-1">🌱</span>
                                        <span>Invite</span>
                                    </button>

                                    {/* Message Button (Solid Green) */}
                                    <button
                                        onClick={() => toast.warn("Message feature is not available yet")}
                                        className="primary-btn flex items-center gap-2">
                                        {/* Paper plane icon - using a placeholder */}
                                        <FaPaperPlane />
                                        <span>Message</span>
                                    </button>

                                </div>
                            </div>
                            <div className='p-8 border-t border-gray-200'>
                                <h2 className='mb-3 font-semibold'>
                                    About Me
                                </h2>
                                <div
                                    className='description overflow-auto h-60'
                                    dangerouslySetInnerHTML={{ __html: candidate?.description }}
                                />
                            </div>
                            <div className="p-8 border-t border-gray-200">

                                {/* Title */}
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Skills
                                </h2>

                                {/* Skills Tags Container */}
                                {/* We use flex-wrap to allow the tags to wrap to the next line */}
                                <div className="flex flex-wrap gap-3">
                                    {candidate?.skills?.map((skill, index) => (
                                        // Individual Skill Tag
                                        <span
                                            key={index}
                                            className="
                                            px-4 py-2
                                            text-sm font-medium
                                            text-[var(--primary-color)]
                                            bg-[var(--accent-color)]
                                            rounded-full
                                            whitespace-nowrap
                                            transition duration-150
                                            hover:bg-green-100
                                            "
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-[30%] space-y-8">
                            {/* Information Widget */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Information</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Offered Salary</span>
                                        <span className="text-[var(--primary-color)] font-medium">${candidate?.offeredSalary}/{candidate?.salaryType}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Experience</span>
                                        <span className="text-gray-900 font-medium">{candidate?.experienceYears}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Gender</span>
                                        <span className="text-gray-900 capitalize font-medium">{candidate?.gender}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Qualification</span>
                                        <span className="text-gray-900 font-medium">{candidate?.qualification}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Age</span>
                                        <span className="text-gray-900 font-medium">{candidate?.age}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Phone</span>
                                        <span className="text-gray-900 font-medium">{candidate?.phone}</span>
                                    </div>
                                    <div className="flex flex-col pb-3 border-b border-gray-50 last:border-0">
                                        <span className="text-black">Email</span>
                                        <span className="text-gray-500 font-medium">{candidate?.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                                    <a href={candidate?.facebook || "#"} target='_blank' className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                                    <a href={candidate?.x || "#"} target='_blank' className="text-gray-400 hover:text-blue-400 transition-colors"><X size={20} /></a>
                                    <a href={candidate?.instagram || "#"} target='_blank' className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram size={20} /></a>
                                    <a href={candidate?.linkedin || "#"} target='_blank' className="text-gray-400 hover:text-blue-700 transition-colors"><Globe size={20} /></a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default CandidateProfile