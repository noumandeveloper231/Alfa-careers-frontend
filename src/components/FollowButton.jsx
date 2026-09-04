import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext';
import { Plus } from 'lucide-react';

const FollowButton = ({ company }) => {
    const { followUnfollow, userData } = useContext(AppContext)
    return (
        <div aria-label='hidden' className={`${company && userData?.role === company.role ? "hidden" : ""}`}>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation();
                    if (company?.authId) followUnfollow(company.authId)
                }}
                className="secondary-btn flex items-center gap-2 mt-3 sm:mt-0 self-start sm:self-center">
                {company && userData?.followedAccounts?.includes(company._id) ? "Unfollow" : <span className='flex items-center gap-2'><Plus size={20} />Follow</span>}
            </button>
        </div>
    )
}

export default FollowButton