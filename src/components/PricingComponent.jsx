import { useState, useEffect, useContext } from 'react'
import { Check } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import PackageCheckoutModal from './PackageCheckoutModal'

const PricingComponent = () => {
    const { backendUrl, isLoggedIn } = useContext(AppContext);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/packages/employee`);
                if (data.success) {
                    const activePackages = data.packages
                        .filter(pkg => pkg.isActive)
                        .sort((a, b) => a.displayOrder - b.displayOrder);
                    setPackages(activePackages);
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [backendUrl]);

    const getRecommendedIndex = () => {
        if (packages.length === 0) return -1;
        if (packages.length === 1) return 0;
        if (packages.length === 2) return 1;
        return Math.floor(packages.length / 2);
    };

    const handleGetStarted = (pkg) => {
        setSelectedPackage(pkg);
    };

    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'PKR': '₨',
        'INR': '₹',
        'AED': 'د.إ'
    };

    const recommendedIndex = getRecommendedIndex();

    return (
        <div>
            {loading ? (
                <div className='mt-10 text-gray-500'>Loading packages...</div>
            ) : packages.length === 0 ? (
                <div className='mt-10 text-gray-500'>No packages available at the moment.</div>
            ) : (
                <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4'>
                    {packages.map((pkg, index) => {
                        const isRecommended = index === recommendedIndex;
                        const isFree = pkg.price === 0;
                        const currencySymbol = currencySymbols[pkg.currency] || pkg.currency;

                        const allFeatures = [];

                        allFeatures.push(`${pkg.jobPostings} job posting${pkg.jobPostings !== 1 ? 's' : ''}`);

                        if (pkg.featuredJobs > 0) {
                            allFeatures.push(`${pkg.featuredJobs} featured job${pkg.featuredJobs !== 1 ? 's' : ''}`);
                        }

                        if (pkg.candidatesFollow > 0) {
                            allFeatures.push(`Follow up to ${pkg.candidatesFollow} candidate${pkg.candidatesFollow !== 1 ? 's' : ''}`);
                        }

                        if (pkg.candidateAccess) {
                            allFeatures.push('Candidate database access');
                        }

                        if (pkg.inviteCandidates) {
                            allFeatures.push('Can invite candidates');
                        }

                        if (pkg.sendMessages) {
                            allFeatures.push('Can send messages');
                        }

                        if (pkg.printProfiles) {
                            allFeatures.push('Can print candidate profiles');
                        }

                        if (pkg.reviewComment) {
                            allFeatures.push('Can review and comment');
                        }

                        if (pkg.viewCandidateInfo) {
                            allFeatures.push('Can view candidate information');
                        }

                        allFeatures.push(`${pkg.support} support`);

                        if (pkg.features && pkg.features.length > 0) {
                            allFeatures.push(...pkg.features);
                        }

                        return (
                            <div
                                key={pkg._id}
                                className={`hover:shadow-xl shadow-gray-200 transition-all relative rounded-lg cursor-pointer border ${isRecommended ? 'border-yellow-400' : 'border-gray-200'
                                    } bg-white p-8 flex flex-col`}
                            >
                                <p className='text-[var(--primary-color)] font-semibold uppercase text-sm'>
                                    {pkg.name}
                                </p>

                                <div className='mt-3 flex items-end gap-1'>
                                    {!isFree && (
                                        <span className='text-xl self-start text-black'>{currencySymbol}</span>
                                    )}
                                    <h4 className='text-5xl font-semibold text-black'>
                                        {isFree ? 'Free' : pkg.price}
                                    </h4>
                                </div>

                                {isRecommended && (
                                    <span className='absolute right-3 top-3 rounded-full bg-yellow-400/30 text-yellow-800 text-sm font-semibold px-3 py-1'>
                                        Recommended
                                    </span>
                                )}

                                <div className='my-6 h-px bg-gray-200' />

                                <div className='flex-1 space-y-5 overflow-auto max-h-48 text-gray-700'>
                                    {allFeatures.map((feature, idx) => (
                                        <div key={idx} className='flex items-center gap-3'>
                                            <Check className={isRecommended ? 'text-[var(--primary-color)]' : 'text-green-900'} size={20} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleGetStarted(pkg)}
                                    className={`${isRecommended ? 'primary-btn' : 'secondary-btn'} w-full mt-10`}>
                                    Get Started
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedPackage && (
                <PackageCheckoutModal
                    packageInfo={selectedPackage}
                    onSuccess={() => setSelectedPackage(null)}
                    onClose={() => setSelectedPackage(null)}
                />
            )}
        </div>
    )
}

export default PricingComponent