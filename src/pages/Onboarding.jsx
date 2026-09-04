import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, Building, MapPin, Users, Briefcase, Star,
    ChevronRight, ChevronLeft, Upload, User, Globe, SkipForward,
    ArrowRight, X, Sparkles, Heart, Zap, Target, Code, Compass,
    Award, Smile, Navigation, Layers, AtSign, Loader
} from 'lucide-react';
import StatusIcon from '../components/StatusIcon';
import ImageCropPortal from '../portals/ImageCropPortal';
import Img from '../components/Image';
import Select from '../components/Select';
import { getCountries, getCitiesForCountry } from '../../lib/location';

const RECRUITER_STEPS = [
    { id: 1, label: 'Profile', icon: Building },
    { id: 2, label: 'Location', icon: MapPin },
    { id: 3, label: 'Company Type', icon: Briefcase },
    { id: 4, label: 'Team Size', icon: Users },
    { id: 5, label: 'About', icon: Globe },
];

const USER_STEPS = [
    { id: 1, label: 'Username', icon: AtSign },
    { id: 2, label: 'Identity', icon: User },
    { id: 3, label: 'Location', icon: MapPin },
    { id: 4, label: 'Category', icon: Star },
    { id: 5, label: 'Skills', icon: Sparkles },
];

const COMPANY_TYPE_OPTIONS = [
    'Private Limited Company', 'Partnership', 'Government Organization',
    'Non-Profit Organization', 'Startup', 'Educational Institute', 'Consultancy / Agency',
];

const TEAM_SIZE_OPTIONS = ['0-50', '11-50', '51-200', '201-500', '500+'];

const SKILLS_LIST = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'SQL Server',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Agile', 'Scrum',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop',
    'Content Writing', 'Technical Writing', 'Product Management', 'Communication',
    'Backend Development', 'Frontend Development', 'Full Stack', 'DevOps',
    'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
    'Mobile Development', 'iOS', 'Android', 'React Native', 'Flutter',
    'QA', 'Unit Testing', 'Selenium', 'Jest',
    'API Development', 'REST API', 'GraphQL', 'Microservices',
    'Problem Solving', 'Team Leadership', 'Project Management',
];

const STEP_META = {
    employee: {
        1: { title: 'Company Profile', subtitle: "Set up your company's identity" },
        2: { title: 'Location', subtitle: 'Where is your company based?' },
        3: { title: 'Company Type', subtitle: 'Choose your company type' },
        4: { title: 'Team Size', subtitle: "What's your team size?" },
        5: { title: 'About', subtitle: 'Tell us about your company' },
    },
    user: {
        1: { title: 'Username', subtitle: 'Choose your unique username' },
        2: { title: 'Personal Identity', subtitle: 'Tell us about yourself' },
        3: { title: 'Location', subtitle: 'Where are you based?' },
        4: { title: 'Category', subtitle: 'What category fits you best?' },
        5: { title: 'Skills', subtitle: 'Select 3 to 10 skills' },
    },
};

const ILLUSTRATIONS = {
    employee: {
        1: '/onboarding/undraw_profile_d7qw.svg',
        2: '/onboarding/undraw_location-tracking_q3yd.svg',
        3: '/onboarding/undraw_team-page_q5am.svg',
        4: '/onboarding/undraw_selecting-team_zehd.svg',
        5: '/onboarding/undraw_business-plan_zrf7.svg',
    },
    user: {
        1: '/onboarding/undraw_profile_d7qw.svg',
        2: '/onboarding/Personal_Identiy.svg',
        3: '/onboarding/undraw_location-tracking_q3yd.svg',
        4: '/onboarding/undraw_job-hunt_5umi.svg',
        5: '/onboarding/undraw_friends-online_gvwz.svg',
    },
};

const Onboarding = () => {
    const { userData, backendUrl, getUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const isEmployee = userData?.role === 'employee';
    const steps = isEmployee ? RECRUITER_STEPS : USER_STEPS;
    const totalSteps = steps.length;

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState('right');
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [candidateCategories, setCandidateCategories] = useState([]);

    const [countriesList, setCountriesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [userNameAvailable, setUserNameAvailable] = useState(null);
    const [userNameChecking, setUserNameChecking] = useState(false);

    const [formData, setFormData] = useState({
        profilePicture: null,
        profilePicturePreview: null,
        company: '',
        firstName: '',
        lastName: '',
        userName: '',
        country: '',
        city: '',
        companyType: '',
        members: '',
        category: '',
        currentPosition: '',
        skills: [],
        description: '',
    });

    useEffect(() => {
        if (userData) {
            const nameParts = (userData.name || '').split(' ');
                setFormData(prev => ({
                    ...prev,
                    company: userData.company || '',
                    firstName: userData.name || nameParts[0] || '',
                    lastName: userData.lastName || nameParts.slice(1).join(' ') || '',
                    userName: userData.userName || '',
                    country: userData.country || '',
                city: userData.city || '',
                companyType: userData.companyType || '',
                members: userData.members || '',
                category: userData.category || '',
                currentPosition: userData.currentPosition || '',
                skills: Array.isArray(userData.skills) ? userData.skills : [],
                description: userData.about || '',
            }));
        }
    }, [userData]);

    const debounceTimer = useRef(null);

    useEffect(() => {
        if (isEmployee) return;
        const name = formData.userName?.trim();

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!name || name.length < 10 || name.length > 15) {
            setUserNameAvailable(null);
            setUserNameChecking(false);
            return;
        }

        setUserNameChecking(true);

        debounceTimer.current = setTimeout(async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/check-username/${encodeURIComponent(name)}`);
                setUserNameAvailable(data.available);
            } catch {
                setUserNameAvailable(null);
            } finally {
                setUserNameChecking(false);
            }
        }, 500);
    }, [formData.userName, backendUrl, isEmployee]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(
                    isEmployee
                        ? `${backendUrl}/api/admin/company-categories`
                        : `${backendUrl}/api/admin/candidate-categories`
                );
                if (data.success) {
                    const cats = isEmployee ? data.categories : data.categories;
                    setCandidateCategories(cats || []);
                }
            } catch { }
        };
        if (userData?.role) fetchCategories();
    }, [backendUrl, userData?.role, isEmployee]);

    useEffect(() => {
        (async () => {
            setCountriesLoading(true);
            const data = await getCountries();
            setCountriesList(data);
            setCountriesLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (formData.country) {
            (async () => {
                setCitiesLoading(true);
                const data = await getCitiesForCountry(formData.country);
                setCitiesList(data);
                setCitiesLoading(false);
            })();
        } else {
            setCitiesList([]);
        }
    }, [formData.country]);

    const goToStep = (newStep) => {
        if (newStep < 1 || newStep > totalSteps || newStep === step) return;
        setDirection(newStep > step ? 'right' : 'left');
        setStep(newStep);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob) => {
        const previewUrl = URL.createObjectURL(croppedBlob);
        setFormData(prev => {
            if (prev.profilePicturePreview) URL.revokeObjectURL(prev.profilePicturePreview);
            return { ...prev, profilePicture: croppedBlob, profilePicturePreview: previewUrl };
        });
        setCropPortalOpen(false);
    };

    const toggleSkill = (skill) => {
        setFormData(prev => {
            const has = prev.skills.includes(skill);
            if (has) return { ...prev, skills: prev.skills.filter(s => s !== skill) };
            if (prev.skills.length >= 10) {
                toast.error('Maximum 10 skills allowed');
                return prev;
            }
            return { ...prev, skills: [...prev.skills, skill] };
        });
    };

    const canProceed = () => {
        if (isEmployee) {
            switch (step) {
                case 1: return formData.company.trim().length > 0;
                case 3: return formData.companyType.length > 0;
                case 4: return formData.members.length > 0;
                case 5: return true;
                default: return true;
            }
        } else {
            switch (step) {
                case 1: return formData.userName.trim().length >= 10 && userNameAvailable === true && !userNameChecking;
                case 2: return formData.firstName.trim().length > 0;
                case 4: return formData.category.length > 0;
                case 5: return formData.skills.length >= 3;
                default: return true;
            }
        }
    };

    const canSkip = () => {
        if (isEmployee) {
            return step === 2 || step === 5;
        } else {
            return step === 3 || step === 5;
        }
    };

    const handleSkip = () => {
        if (step < totalSteps) goToStep(step + 1);
    };

    const handleNext = () => {
        if (!canProceed()) return;
        if (step === totalSteps) {
            handleSubmit();
        } else {
            goToStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updateData = { isOnboardingCompleted: true };

            if (isEmployee) {
                console.log(formData);
                updateData.company = formData.company;
                updateData.companyType = formData.companyType;
                updateData.members = formData.members;
                if (formData.description) updateData.about = formData.description;
                if (formData.country) updateData.country = formData.country;
                if (formData.city) updateData.city = formData.city;
            } else {
                updateData.name = formData.firstName;
                updateData.lastName = formData.lastName;
                updateData.userName = formData.userName;
                updateData.category = formData.category;
                updateData.currentPosition = formData.currentPosition;
                updateData.skills = formData.skills;
                if (formData.country) updateData.country = formData.country;
                if (formData.city) updateData.city = formData.city;
            }

            console.log("Updated Profile Data:", updateData);

            const { data: profileData } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: updateData
            });
            if (!profileData.success) throw new Error(profileData.message);

            if (formData.profilePicture instanceof Blob) {
                const ppData = new FormData();
                ppData.append('profilePicture', formData.profilePicture, 'profile.jpg');
                await axios.post(`${backendUrl}/api/user/updateprofilepicture`, ppData);
            }

            await getUserData();
            setCompleted(true);
            setTimeout(() => {
                navigate(isEmployee ? '/dashboard' : '/jobs');
            }, 3000);
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!userData) return null;

    if (completed) {
        return <CompletionScreen isEmployee={isEmployee} />;
    }

    return (
        <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            {/* ─── Left Side Panel: Steps + Form ─── */}
            <div className="w-3/5 flex flex-col overflow-y-auto">
                {/* Horizontal Steps at top */}
                <div className="px-8 pt-8 pb-4 flex items-center gap-0">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.id}>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className={[
                                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0',
                                    step > s.id ? 'bg-[var(--primary-color)] text-white' : '',
                                    step === s.id ? 'bg-[var(--primary-color)] text-white ring-4 ring-[var(--primary-color)]/20 pulse-ring' : '',
                                    step < s.id ? 'bg-gray-100 text-gray-400' : '',
                                ].filter(Boolean).join(' ')}>
                                    {step > s.id ? <CheckCircle size={16} /> : <s.icon size={16} />}
                                </div>
                                <span className={[
                                    'text-xs font-medium whitespace-nowrap transition-colors duration-300',
                                    step >= s.id ? 'text-[var(--primary-color)]' : 'text-gray-400',
                                ].filter(Boolean).join(' ')}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={[
                                    'flex-1 h-0.5 mx-3 rounded transition-all duration-500 self-center',
                                    step > s.id ? 'bg-[var(--primary-color)]' : 'bg-gray-200',
                                ].filter(Boolean).join(' ')} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form capped in a box */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-8">
                    <div className="bg-white rounded-2xl border border-gray-300 w-full max-w-3xl flex flex-col max-h-[calc(100vh-180px)]" key={`${step}-${direction}`}>
                        {/* Fixed Header */}
                        <div className="p-8 md:p-14 pb-0 md:pb-0 flex-shrink-0">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{STEP_META[isEmployee ? 'employee' : 'user']?.[step]?.title}</h2>
                                <p className="text-gray-500 mt-1">{STEP_META[isEmployee ? 'employee' : 'user']?.[step]?.subtitle}</p>
                                {!isEmployee && step === 5 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600 ">Selected:</span>
                                        <span className={[
                                            'text-sm font-bold',
                                            formData.skills.length >= 3 && formData.skills.length <= 10 ? 'text-green-600' : 'text-orange-500',
                                        ].filter(Boolean).join(' ')}>
                                            {formData.skills.length} / 10
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-8 md:px-14">
                            <StepContent
                                step={step}
                                direction={direction}
                                isEmployee={isEmployee}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleFileChange={handleFileChange}
                                candidateCategories={candidateCategories}
                                toggleSkill={toggleSkill}
                                COMPANY_TYPE_OPTIONS={COMPANY_TYPE_OPTIONS}
                                TEAM_SIZE_OPTIONS={TEAM_SIZE_OPTIONS}
                                SKILLS_LIST={SKILLS_LIST}
                                countriesList={countriesList}
                                citiesList={citiesList}
                                countriesLoading={countriesLoading}
                                citiesLoading={citiesLoading}
                                userNameAvailable={userNameAvailable}
                                userNameChecking={userNameChecking}
                            />
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex items-center justify-between flex-shrink-0 sticky bottom-0 bg-white rounded-b-2xl p-6 md:p-8 border-t border-gray-100">
                            <div>
                                {step > 1 && (
                                    <button onClick={() => goToStep(step - 1)}
                                        className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all font-medium">
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {/* {canSkip() && (
                                    <button onClick={handleSkip}
                                        className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-gray-600 transition-all text-sm font-medium">
                                        Skip <SkipForward size={14} />
                                    </button>
                                )} */}
                                <button onClick={handleNext} disabled={loading || (!canProceed() && step < totalSteps)}
                                    className={[
                                        'primary-btn',
                                        (loading || (!canProceed() && step < totalSteps)) ? 'opacity-50 cursor-not-allowed' : '',
                                    ].filter(Boolean).join(' ')}>
                                    {loading ? (
                                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                                    ) : step === totalSteps ? (
                                        <span className="flex items-center gap-2">Complete <ArrowRight size={18} /></span>
                                    ) : (
                                        <span className="flex items-center gap-2">Next <ChevronRight size={18} /></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Green Line Divider (like Login page) ─── */}
            <div className="hidden lg:block border-l-3 border-[var(--primary-color)]"></div>

            {/* ─── Right Panel — Preview ─── */}
            <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-[var(--accent-color)] to-white p-10 relative overflow-hidden flex-shrink-0 min-h-screen">
                <StepPreview step={step} direction={direction} isEmployee={isEmployee} formData={formData} illustrations={ILLUSTRATIONS} steps={steps} />
            </div>

            <ImageCropPortal
                isOpen={cropPortalOpen}
                onClose={() => setCropPortalOpen(false)}
                imageSrc={selectedImage}
                cropShape="round"
                aspect={1}
                onCropComplete={handleCropComplete}
                imageType="profile"
            />
                </div>
            );
        }

/* ─── Step Content ─── */
const StepContent = ({ step, direction, isEmployee, formData, handleInputChange, handleFileChange, candidateCategories, toggleSkill, COMPANY_TYPE_OPTIONS, TEAM_SIZE_OPTIONS, SKILLS_LIST, countriesList, citiesList, countriesLoading, citiesLoading, userNameAvailable, userNameChecking }) => {
    const animClass = direction === 'right' ? 'step-enter-right' : 'step-enter-left';
    const ScoreBadge = ({ pts, condition }) => (
        <span className="text-green-600 text-xs font-medium whitespace-nowrap" style={{ float: 'right' }}>
            +{pts} points
            {condition && <span className="text-green-400 font-normal"> ({condition})</span>}
        </span>
    );

    if (isEmployee) {
        switch (step) {
            case 1: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <div className="flex flex-col items-center mb-6">
                        <label htmlFor="emp-upload" className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                {formData.profilePicturePreview ? (
                                    <img src={formData.profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] leading-tight text-center px-1">Click to<br /><span className="text-[var(--primary-color)] text-[10px]  font-medium underline">Upload</span></span>
                                )}
                            </div>
                        </label>
                        <input id="emp-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Company Name <StatusIcon condition={formData.company.trim().length > 0} /></span></label>
                        <div className="relative">
                            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" name="company" value={formData.company} onChange={handleInputChange}
                                placeholder="Acme Corp" className="!pl-10" />
                        </div>
                    </div>
                </div>
            );
            case 2: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Country <StatusIcon condition={!!formData.country} /></span></label>
                            <Select
                                options={countriesList}
                                value={countriesList.find(c => c.value === formData.country) || null}
                                onChange={(option) => {
                                    handleInputChange({ target: { name: 'country', value: option?.value || '' } });
                                    handleInputChange({ target: { name: 'city', value: '' } });
                                }}
                                placeholder="Search for a country..."
                                isSearchable
                                isLoading={countriesLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>City <StatusIcon condition={!!formData.city} falseClass="text-yellow-500" /></span></label>
                            <Select
                                options={citiesList}
                                value={citiesList.find(c => c.value === formData.city) || null}
                                onChange={(option) => handleInputChange({ target: { name: 'city', value: option?.value || '' } })}
                                placeholder={formData.country ? "Search for a city..." : "Select a country first"}
                                isSearchable
                                isLoading={citiesLoading}
                                isDisabled={!formData.country}
                            />
                        </div>
                    </div>
                </div>
            );
            case 3: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <p className="text-sm text-gray-500 mb-2"><span>Company Type <StatusIcon condition={!!formData.companyType} /></span></p>
                    <PillSelect options={COMPANY_TYPE_OPTIONS} selected={formData.companyType}
                        onSelect={(v) => handleInputChange({ target: { name: 'companyType', value: v } })} single />
                </div>
            );
            case 4: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <p className="text-sm text-gray-500 mb-2"><span>Team Size <StatusIcon condition={!!formData.members} /></span></p>
                    <PillSelect options={TEAM_SIZE_OPTIONS} selected={formData.members}
                        onSelect={(v) => handleInputChange({ target: { name: 'members', value: v } })} single vertical />
                </div>
            );
            case 5: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Description <StatusIcon condition={formData.description.trim().length > 0} falseClass="text-yellow-500" /></span></label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange}
                            rows={6} placeholder="Tell us about your company, mission, and what makes it great..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none resize-none transition-all" />
                    </div>
                </div>
            );
        }
    } else {
        switch (step) {
            case 1: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary-color)]/10 to-emerald-100 flex items-center justify-center shadow-inner">
                            <AtSign size={40} className="text-[var(--primary-color)]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <span>Username <StatusIcon condition={formData.userName?.length >= 10 && userNameAvailable === true} /><ScoreBadge pts={2} /></span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                            <input type="text" name="userName" value={formData.userName} onChange={handleInputChange}
                                placeholder="yourusername" className="!pl-7 !pr-10" maxLength={15} />
                            {userNameChecking && (
                                <Loader size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {!userNameChecking && userNameAvailable === true && formData.userName?.length >= 10 && (
                                <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {!userNameChecking && userNameAvailable === false && formData.userName?.length >= 10 && (
                                <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400">This will be your unique profile URL: aflacareers.com/candidate/{formData.userName || "username"}</p>
                            <span className="text-xs text-gray-400">{formData.userName?.length || 0}/15</span>
                        </div>
                        {formData.userName?.length > 0 && formData.userName?.length < 10 && (
                            <p className="text-xs text-orange-500 mt-1">Must be at least 10 characters</p>
                        )}
                        {!userNameChecking && userNameAvailable === true && formData.userName?.length >= 10 && formData.userName?.length <= 15 && (
                            <p className="text-xs text-green-600 mt-1">Username is available</p>
                        )}
                        {!userNameChecking && userNameAvailable === false && (
                            <p className="text-xs text-red-500 mt-1">Username is already taken</p>
                        )}
                        {userNameChecking && formData.userName?.length >= 10 && (
                            <p className="text-xs text-gray-400 mt-1">Checking availability...</p>
                        )}
                    </div>
                </div>
            );
            case 2: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <div className="flex flex-col items-center mb-6">
                        <label htmlFor="candidate-upload" className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                {formData.profilePicturePreview ? (
                                    <img src={formData.profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] leading-tight text-center px-1">Click to<br /><span className="text-[var(--primary-color)] text-[10px]  font-medium underline">Upload</span></span>
                                )}
                            </div>
                        </label>
                        <input id="candidate-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                    <div className="text-xs text-gray-400 mb-4 ">
                        <span>Profile Picture <StatusIcon condition={!!formData.profilePicturePreview} falseClass="text-yellow-500" /></span><ScoreBadge pts={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 "><span>First Name <StatusIcon condition={formData.firstName.trim().length > 0} /></span><ScoreBadge pts={3} /></label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Last Name <StatusIcon condition={formData.lastName.trim().length > 0} falseClass="text-yellow-500" /></span></label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                        </div>
                    </div>
                </div>
            );
            case 3: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <p className="text-sm text-gray-500 mb-2 "><span>Country + City <StatusIcon condition={!!formData.country && !!formData.city} falseClass="text-yellow-500" /></span><ScoreBadge pts={6} condition="3+3" /></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Country <StatusIcon condition={!!formData.country} /></span></label>
                            <Select
                                options={countriesList}
                                value={countriesList.find(c => c.value === formData.country) || null}
                                onChange={(option) => {
                                    handleInputChange({ target: { name: 'country', value: option?.value || '' } });
                                    handleInputChange({ target: { name: 'city', value: '' } });
                                }}
                                placeholder="Search for a country..."
                                isSearchable
                                isLoading={countriesLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>City <StatusIcon condition={!!formData.city} falseClass="text-yellow-500" /></span></label>
                            <Select
                                options={citiesList}
                                value={citiesList.find(c => c.value === formData.city) || null}
                                onChange={(option) => handleInputChange({ target: { name: 'city', value: option?.value || '' } })}
                                placeholder={formData.country ? "Search for a city..." : "Select a country first"}
                                isSearchable
                                isLoading={citiesLoading}
                                isDisabled={!formData.country}
                            />
                        </div>
                    </div>
                </div>
            );
            case 4: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <p className="text-sm text-gray-500 mb-2 "><span>Category <StatusIcon condition={!!formData.category} /></span><ScoreBadge pts={3} /></p>
                    <PillSelect options={candidateCategories.map(c => c.name)}
                        selected={formData.category}
                        onSelect={(v) => handleInputChange({ target: { name: 'category', value: v } })} single />
                </div>
            );
            case 5: return (
                <div className={`space-y-6 ${animClass} pb-6`}>
                    <p className="text-sm text-gray-500 mb-2 "><span>Skills <StatusIcon condition={formData.skills.length >= 3} falseClass="text-yellow-500" /></span><ScoreBadge pts={5} condition="min 2" /></p>
                    <PillSelect options={SKILLS_LIST} selected={formData.skills}
                        onSelect={toggleSkill} multi />
                    {formData.skills.length < 3 && formData.skills.length > 0 && (
                        <p className="text-xs text-orange-500 mt-2">Select at least 3 skills to continue</p>
                    )}
                </div>
            );
        }
    }
    return null;
};

/* ─── Pill Select ─── */
const PillSelect = ({ options, selected, onSelect, single, multi, vertical }) => {
    const containerClass = vertical
        ? 'flex flex-col gap-2'
        : 'flex flex-wrap gap-3';

    return (
        <div className={containerClass}>
            {options.map((opt, i) => {
                const isSelected = single ? selected === opt : multi && selected.includes(opt);
                return (
                    <button key={opt} onClick={() => onSelect(opt)}
                        style={{ animationDelay: `${i * 40}ms` }}
                        className={[
                            'pill-pop px-5 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 cursor-pointer',
                            vertical ? 'w-full text-left' : '',
                            isSelected
                                ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-md shadow-[var(--primary-color)]/20'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--primary-color)] hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]',
                        ].filter(Boolean).join(' ')}>
                        {multi && (
                            <span className={[
                                'inline-block w-4 h-4 rounded border-2 mr-2 align-middle transition-all',
                                isSelected ? 'bg-white border-white' : 'border-gray-300',
                            ].filter(Boolean).join(' ')}>
                                {isSelected && <CheckCircle size={14} className="text-[var(--primary-color)]" />}
                            </span>
                        )}
                        {opt}
                    </button>
                );
            })}
        </div>
    );
};

const FLOATING_ICONS = {
    employee: {
        1: [
            { icon: Building, color: '#007456', top: '10%', left: '5%', rotate: -15 },
            { icon: Briefcase, color: '#0d9488', top: '15%', right: '8%', rotate: 20 },
            { icon: Users, color: '#10b981', bottom: '22%', left: '10%', rotate: -8 },
            { icon: Star, color: '#eab308', bottom: '12%', right: '5%', rotate: 12 },
            { icon: Award, color: '#f59e0b', top: '45%', left: '2%', rotate: 25 },
        ],
        2: [
            { icon: MapPin, color: '#007456', top: '8%', left: '8%', rotate: -20 },
            { icon: Globe, color: '#0284c7', top: '12%', right: '10%', rotate: 10 },
            { icon: Navigation, color: '#0d9488', bottom: '20%', left: '5%', rotate: -30 },
            { icon: Compass, color: '#10b981', bottom: '10%', right: '8%', rotate: 25 },
            { icon: MapPin, color: '#eab308', top: '55%', right: '3%', rotate: -10 },
        ],
        3: [
            { icon: Briefcase, color: '#007456', top: '10%', left: '5%', rotate: -12 },
            { icon: Building, color: '#14b8a6', top: '18%', right: '5%', rotate: 15 },
            { icon: Layers, color: '#0d9488', bottom: '18%', left: '10%', rotate: -5 },
            { icon: Award, color: '#f97316', bottom: '22%', right: '8%', rotate: 30 },
            { icon: Star, color: '#eab308', top: '45%', left: '3%', rotate: 20 },
        ],
        4: [
            { icon: Users, color: '#065f46', top: '8%', left: '5%', rotate: -10 },
            { icon: User, color: '#007456', top: '15%', right: '8%', rotate: 20 },
            { icon: Star, color: '#f59e0b', bottom: '18%', left: '8%', rotate: -25 },
            { icon: Target, color: '#10b981', bottom: '22%', right: '5%', rotate: 15 },
            { icon: Award, color: '#0d9488', top: '50%', right: '2%', rotate: -15 },
        ],
        5: [
            { icon: Heart, color: '#e11d48', top: '10%', left: '8%', rotate: -15 },
            { icon: Globe, color: '#007456', top: '12%', right: '5%', rotate: 10 },
            { icon: Heart, color: '#f43f5e', bottom: '20%', left: '5%', rotate: -20 },
            { icon: Sparkles, color: '#eab308', bottom: '12%', right: '10%', rotate: 25 },
            { icon: Star, color: '#10b981', top: '50%', left: '50%', rotate: 30 },
        ],
    },
    user: {
        1: [
            { icon: AtSign, color: '#6d28d9', top: '10%', left: '5%', rotate: -12 },
            { icon: User, color: '#7c3aed', top: '15%', right: '8%', rotate: 15 },
            { icon: Globe, color: '#0284c7', bottom: '18%', left: '10%', rotate: -5 },
            { icon: Award, color: '#eab308', bottom: '22%', right: '5%', rotate: 25 },
            { icon: CheckCircle, color: '#10b981', top: '45%', left: '2%', rotate: 20 },
        ],
        2: [
            { icon: User, color: '#6d28d9', top: '10%', left: '5%', rotate: -15 },
            { icon: Smile, color: '#e11d48', top: '15%', right: '8%', rotate: 20 },
            { icon: Star, color: '#eab308', bottom: '22%', left: '10%', rotate: -8 },
            { icon: Award, color: '#7c3aed', bottom: '12%', right: '5%', rotate: 12 },
            { icon: Sparkles, color: '#8b5cf6', top: '45%', left: '2%', rotate: -20 },
        ],
        3: [
            { icon: MapPin, color: '#6d28d9', top: '8%', left: '8%', rotate: -20 },
            { icon: Globe, color: '#0284c7', top: '12%', right: '10%', rotate: 10 },
            { icon: Compass, color: '#7c3aed', bottom: '20%', left: '5%', rotate: -30 },
            { icon: Navigation, color: '#8b5cf6', bottom: '10%', right: '8%', rotate: 25 },
            { icon: MapPin, color: '#eab308', top: '55%', right: '3%', rotate: 15 },
        ],
        4: [
            { icon: Star, color: '#eab308', top: '10%', left: '5%', rotate: -12 },
            { icon: Award, color: '#6d28d9', top: '18%', right: '5%', rotate: 15 },
            { icon: Target, color: '#a78bfa', bottom: '18%', left: '10%', rotate: -5 },
            { icon: Briefcase, color: '#e11d48', bottom: '22%', right: '8%', rotate: 30 },
            { icon: Star, color: '#7c3aed', top: '50%', left: '50%', rotate: -10 },
        ],
        5: [
            { icon: Code, color: '#7c3aed', top: '8%', left: '5%', rotate: -10 },
            { icon: Zap, color: '#eab308', top: '15%', right: '8%', rotate: 20 },
            { icon: Sparkles, color: '#8b5cf6', bottom: '18%', left: '8%', rotate: -25 },
            { icon: Target, color: '#e11d48', bottom: '22%', right: '5%', rotate: 15 },
            { icon: Award, color: '#a78bfa', top: '50%', right: '2%', rotate: -15 },
        ],
    },
};

/* ─── Step Preview (Right Panel) ─── */
const StepPreview = ({ step, direction, isEmployee, formData, illustrations }) => {
    const key = isEmployee ? 'employee' : 'user';
    const src = illustrations?.[key]?.[step];
    const icons = FLOATING_ICONS[key]?.[step] || [];

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center">
            {icons.map((item, i) => {
                const IconComp = item.icon;
                const pos = {};
                if (item.top) pos.top = item.top;
                if (item.left) pos.left = item.left;
                if (item.right) pos.right = item.right;
                if (item.bottom) pos.bottom = item.bottom;

                return (
                    <div
                        key={`${step}-${i}`}
                        className="absolute pointer-events-none fade-up icon-float"
                        style={{ ...pos, transform: `rotate(${item.rotate}deg)`, animationDelay: `${i * 0.12}s` }}
                    >
                        <div
                            className="icon-hover"
                            style={{ animation: `float-icon ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite alternate` }}
                        >
                            <IconComp size={36 + i * 8} style={{ color: item.color, opacity: 0.5 }} />
                        </div>
                    </div>
                );
            })}
            <PreviewWrapper>
                {src ? (
                    <img key={step} src={src} alt="" className="w-full max-w-md h-auto object-contain fade-up relative z-10" />
                ) : (
                    <div className="w-48 h-48 rounded-2xl bg-gray-10 flex items-center justify-center text-gray-400">
                        <span className="text-sm">No illustration</span>
                    </div>
                )}
            </PreviewWrapper>
        </div>
    );
};

const PreviewWrapper = ({ children }) => (
    <div className="flex flex-col items-center justify-center fade-up">
        {children}
    </div>
);

/* ─── Completion Screen ─── */
const CompletionScreen = ({ isEmployee }) => {
    const confettiColors = ['#007456', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];
    const pieces = Array.from({ length: 30 }, (_, i) => i);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[var(--accent-color)] flex flex-col items-center justify-center overflow-hidden relative px-4">
            {/* Confetti */}
            {pieces.map(i => (
                <div key={i} className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 20}%`,
                        animationDelay: `${Math.random() * 1.5}s`,
                        backgroundColor: confettiColors[i % confettiColors.length],
                        width: `${6 + Math.random() * 6}px`,
                        height: `${6 + Math.random() * 6}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }} />
            ))}

            <div className="text-center relative z-10 max-w-lg w-full">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-emerald-400 mx-auto flex items-center justify-center scale-in shadow-lg shadow-[var(--primary-color)]/30">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline className="checkmark-svg" points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-6 fade-up" style={{ animationDelay: '0.3s' }}>
                    Profile Complete!
                </h2>
                <p className="text-gray-500 mt-2 fade-up" style={{ animationDelay: '0.5s' }}>
                    {isEmployee
                        ? 'Your company profile is ready. Start posting jobs and finding talent!'
                        : 'Your profile is set up. Start finding your dream job!'}
                </p>

                <div className="mt-8 space-y-3 fade-up" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--primary-color)]">
                        <Sparkles size={16} />
                        <span>Redirecting you in a moment...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
