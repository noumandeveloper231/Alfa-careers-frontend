import { MapPin } from 'lucide-react'
import Img from './Image'
import { Link, useNavigate } from 'react-router-dom'
import FollowButton from './FollowButton'
import { getCategoryName } from '../utils/categoryNames'
import '../description.css'

const CandidateCard = ({ candidate }) => {
    const navigate = useNavigate()
    return (

        <Link to={`/candidates/${candidate?.category}/${candidate.slug}`}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg shadow-gray-200 transition-all cursor-pointer w-full max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 sm:w-auto">
                        <Img
                            src={candidate?.profilePicture || "https://via.placeholder.com/120"}
                            style="h-14 w-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <h4 className="font-semibold text-gray-900 whitespace-nowrap">{candidate?.name || "Not Specified"}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                                <button onClick={(ev) =>
                                    {
                                        ev.preventDefault()
                                        ev.stopPropagation()
                                        navigate(`/candidates?cat=${candidate?.category}`)
                                    }
                                } className="text-[var(--primary-color,#1dbf73)] font-medium">
                                    {getCategoryName(candidate?.category) || "Not Specified"}
                                </button>
                                <span className="flex items-center gap-1">
                                    <MapPin size={18} className="text-gray-400" />
                                    {candidate?.city || "Not Specified"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <FollowButton company={candidate} />
                </header>

                {/* About */}
                <div className='mt-4 min-h-10 line-clamp-2 text-sm description' dangerouslySetInnerHTML={{ __html: candidate?.description }} />

                {/* Footer: Skills + Salary */}
                <div className="mt-2 flex flex-wrap justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        {candidate?.skills?.slice(0, 6)?.map(skill => (
                            <span
                                key={skill}
                                className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-medium text-[var(--primary-color)]"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                    <div className="text-[var(--primary-color)] font-semibold whitespace-nowrap self-end">
                        {candidate?.offeredSalary}$/{candidate?.salaryType || ''}
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default CandidateCard
