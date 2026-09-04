import axios from 'axios';
import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaCamera, FaPlus, FaTrash, FaVideo } from 'react-icons/fa';
import { Save, Image as ImageIcon, Loader, Upload, X, CheckCircle, Phone, Briefcase, MapPin, FileText, Award, Globe, Check } from 'lucide-react'
import Img from './Image';
import CustomSelect from './CustomSelect';
import ImageCropPortal from '../portals/ImageCropPortal';
import { useLocation } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';
import { TiptapEditor } from './TiptapEditor';

// Predefined Skills List
import SkillsSelector from './SkillsSelector';
import PhoneInputField from './PhoneInputField';
import StatusIcon from './StatusIcon';
import Select from './Select';
import LocationPickerMap from './LocationPickerMap';
import { validate } from '../../lib/validation';
import { getCountries, getCitiesForCountry } from '../../lib/location';
import { calculateProfileScore, SCORE } from '../../lib/profileScore';
import { IoMdWarning } from 'react-icons/io';
import Tooltip from './Tooltip';

const LANGUAGES = [
    { value: 'english', label: 'English' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'turkish', label: 'Turkish' },
    { value: 'french', label: 'French' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'german', label: 'German' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'italian', label: 'Italian' },
    { value: 'dutch', label: 'Dutch' },
    { value: 'polish', label: 'Polish' },
    { value: 'swedish', label: 'Swedish' },
    { value: 'danish', label: 'Danish' },
    { value: 'norwegian', label: 'Norwegian' },
    { value: 'finnish', label: 'Finnish' },
];

const MyProfile = () => {
    const { userData, backendUrl, setUserData } = useContext(AppContext);
    const location = useLocation();

    const [activeTab, setActiveTab] = useState("basic");
    // Initial State
    const [formData, setFormData] = useState({
        // Basic Info
        name: "",
        lastName: "",
        age: "",
        email: "",
        phone: "",
        currentPosition: "",
        category: "",
        description: "",
        dob: "",
        gender: "male",
        language: [],
        qualification: "",
        experienceYears: "1-2 years",
        offeredSalary: 0,
        salaryType: "month",
        // Location
        address: "",
        city: "",
        state: "",
        country: "",
        postal: "",
        latitude: null,
        longitude: null,
        // Portfolio
        portfolio: "",
        // Predefined Social Links
        linkedin: "",
        x: "",
        facebook: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        github: "",
        // Custom Social Networks
        customSocialNetworks: [],
        // Video
        videoUrl: "",
        // Arrays
        education: [],
        experience: [],
        skills: [],
        projects: [],
        awards: [],
    });
    const [loading, setLoading] = useState(false);
    const [previewProfileScore, setPreviewProfileScore] = useState(0);

    // Update preview score whenever formData changes
    useEffect(() => {
        const score = calculateProfileScore(formData);
        setPreviewProfileScore(score);
    }, [formData]);

    // Initialize preview score from userData on mount
    useEffect(() => {
        if (userData) {
            const score = calculateProfileScore(userData);
            setPreviewProfileScore(score);
        }
    }, []);

    // Field refs for focusing
    const fieldRefs = useRef({});

    // Handle focusField and tab from query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlTab = params.get('tab');
        const urlFocusField = params.get('focusField');

        if (urlTab) setActiveTab(urlTab);

        if (urlFocusField) {
            const raf = requestAnimationFrame(() => {
                const el = fieldRefs.current[urlFocusField];
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.focus({ preventScroll: true });
                }
            });
            // Clean up URL params after focus
            params.delete('focusField');
            params.delete('tab');
            const newUrl = params.toString()
                ? `${location.pathname}?${params}`
                : location.pathname;
            window.history.replaceState({}, '', newUrl);
            return () => cancelAnimationFrame(raf);
        }
    }, [location.search]);


    // Image Crop Portal State
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [cropConfig, setCropConfig] = useState({
        shape: 'rect',
        aspect: 1,
        imageType: 'profile'
    });

    // Username availability & cooldown state
    const [userNameAvailable, setUserNameAvailable] = useState(null);
    const [userNameChecking, setUserNameChecking] = useState(false);
    const [userNameUpdatedAt, setUserNameUpdatedAt] = useState(null);
    const [originalUserName, setOriginalUserName] = useState('');

    // Load data from userData
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                ...userData,
                // Ensure arrays are initialized
                language: userData.language || [],
                customSocialNetworks: userData.customSocialNetworks || [],
                education: userData.education || [],
                experience: userData.experience || [],
                skills: userData.skills || [],
                projects: userData.projects || [],
                awards: userData.awards || []
            }));
            setOriginalUserName(userData.userName || '');
            setUserNameUpdatedAt(userData.userNameUpdatedAt || userData.updatedAt || null);
        }
    }, [userData]);

    // Location state
    const [countriesList, setCountriesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([30.375, 69.345]);
    const [mapZoom, setMapZoom] = useState(5);

    // Store original location from userData for auto-fill restoration
    const [originalLocation, setOriginalLocation] = useState({
        address: userData?.address || '',
        city: userData?.city || '',
        postal: userData?.postal || '',
    });

    // Store temporary location data when user changes country/city
    const [savedLocation, setSavedLocation] = useState(null);

    // Function to geocode a location and get coordinates
    const getCoordinatesFromLocation = async (locationString) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'AflaCareers/1.0' } }
            );
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                    };
                }
            }
        } catch {
            // Return null on error
        }
        return null;
    };

    // Update map center when country or city changes
    useEffect(() => {
        if (!formData.country && !userData?.country) return;

        const updateMapCenter = async () => {
            const country = formData.country || userData?.country;
            const city = formData.city || userData?.city;

            if (!country) {
                setMapCenter([30.375, 69.345]);
                setMapZoom(5);
                return;
            }

            let searchStr = country;
            if (city) {
                searchStr = `${city}, ${country}`;
            }

            const coords = await getCoordinatesFromLocation(searchStr);
            if (coords) {
                setMapCenter([coords.lat, coords.lng]);
                setMapZoom(city ? 10 : 6);
            } else {
                setMapZoom(city ? 10 : 5);
            }
        };

        updateMapCenter();
    }, [formData.country, formData.city, userData?.country, userData?.city]);

    // Update original location when userData changes
    useEffect(() => {
        if (userData) {
            setOriginalLocation({
                address: userData.address || '',
                city: userData.city || '',
                postal: userData.postal || '',
            });

            // Initialize map center from userData on mount
            if (userData.country) {
                const initMapCenter = async () => {
                    let searchStr = userData.country;
                    if (userData.city) {
                        searchStr = `${userData.city}, ${userData.country}`;
                    }
                    const coords = await getCoordinatesFromLocation(searchStr);
                    if (coords) {
                        setMapCenter([coords.lat, coords.lng]);
                        setMapZoom(userData.city ? 10 : 6);
                    }
                };
                initMapCenter();
            }
        }
    }, [userData]);

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

    // Debounced username availability check
    const debounceTimer = useRef(null);

    useEffect(() => {
        const name = formData.userName?.trim();

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!name || name.length < 10 || name.length > 15 || name === originalUserName) {
            setUserNameAvailable(null);
            setUserNameChecking(false);
            return;
        }

        setUserNameChecking(true);

        debounceTimer.current = setTimeout(async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/check-username/${encodeURIComponent(name)}`);
                setUserNameAvailable(data.available);
                if (data.userNameUpdatedAt) {
                    setUserNameUpdatedAt(data.userNameUpdatedAt);
                }
            } catch {
                setUserNameAvailable(null);
            } finally {
                setUserNameChecking(false);
            }
        }, 500);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [formData.userName, backendUrl, originalUserName]);

    // Handle navigation from dashboard
    useEffect(() => {
        if (location.state) {
            const { activeTab: navTab, focusField } = location.state;

            if (navTab) {
                setActiveTab(navTab);
            }

            // Focus on field after tab switch
            if (focusField) {
                setTimeout(() => {
                    const fieldElement = fieldRefs.current[focusField];
                    if (fieldElement) {
                        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Add highlight animation
                        fieldElement.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
                        setTimeout(() => {
                            fieldElement.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
                        }, 2000);
                    }
                }, 300);
            }

            // Clear navigation state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index, field, key, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index] = { ...updatedArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const addArrayItem = (field, initialItem) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], initialItem]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // ---------- Project Images Handlers ----------
    const [uploadingProjectImages, setUploadingProjectImages] = useState({});

    const uploadProjectImages = async (files, projectIdx) => {
        if (!files || files.length === 0) return;

        setUploadingProjectImages(prev => ({ ...prev, [projectIdx]: true }));

        try {
            const formDataUpload = new FormData();
            Array.from(files).forEach(file => {
                formDataUpload.append("projectImages", file);
            });
            formDataUpload.append("projectIdx", projectIdx);

            const { data } = await axios.post(`${backendUrl}/api/user/upload-project-images`, formDataUpload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (data.success) {
                setFormData(prev => {
                    const updatedProjects = [...prev.projects];
                    updatedProjects[projectIdx].images = data.images;
                    return { ...prev, projects: updatedProjects };
                });
                toast.success("Images uploaded");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setUploadingProjectImages(prev => ({ ...prev, [projectIdx]: false }));
        }
    };

    const deleteProjectImage = (projectIdx, imageUrl) => {
        setFormData(prev => {
            const updatedProjects = [...prev.projects];
            updatedProjects[projectIdx].images = updatedProjects[projectIdx].images.filter(img => img !== imageUrl);
            return { ...prev, projects: updatedProjects };
        });
    };

    // Save Profile
    const validateAndFocusField = (fieldKey) => {
        const el = fieldRefs.current[fieldKey];
        if (!el) return;
        if (typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
        } else if (typeof el.highlight === 'function') {
            el.highlight();
            el.focus?.();
        }
    };

    const updateProfile = async () => {
        if (formData?.videoUrl && !formData?.videoUrl?.startsWith("https://")) {
            validateAndFocusField('videoUrl');
            return toast.warn("Invalid Video Url")
        }

        const socialRules = [
            { key: 'linkedin', val: (v) => validate(v, 'linkedinUrl').valid, label: 'LinkedIn' },
            { key: 'x', val: (v) => validate(v, 'xUrl').valid, label: 'X' },
            { key: 'facebook', val: (v) => validate(v, 'facebookUrl').valid, label: 'Facebook' },
            { key: 'instagram', val: (v) => validate(v, 'instagramUrl').valid, label: 'Instagram' },
            { key: 'youtube', val: (v) => validate(v, 'youtubeUrl').valid, label: 'YouTube' },
            { key: 'tiktok', val: (v) => validate(v, 'tiktokUrl').valid, label: 'TikTok' },
            { key: 'github', val: (v) => validate(v, 'githubUrl').valid, label: 'GitHub' },
        ];

        for (const { key, val, label } of socialRules) {
            if (formData[key] && !val(formData[key])) {
                validateAndFocusField(key);
                toast.error(`Invalid ${label} URL`);
                return;
            }
        }

        // Required field validations
        if (!validate(formData.name || '', 'notEmpty').valid) {
            validateAndFocusField('name');
            return toast.error('First Name is required');
        }
        if (!validate(formData.category || '', 'notEmpty').valid) {
            validateAndFocusField('category');
            return toast.error('Category is required');
        }
        if (!validate(formData.currentPosition || '', 'notEmpty').valid) {
            validateAndFocusField('currentPosition');
            return toast.error('Current Position is required');
        }
        if (!validate(formData.country || '', 'notEmpty').valid) {
            validateAndFocusField('country');
            return toast.error('Country is required');
        }

        // Username validation
        const userName = formData.userName?.trim();
        if (userName.length < 10 || userName.length > 15) {
            validateAndFocusField('userName');
            return toast.error('Username must be between 10 and 15 characters');
        }

        if (userName !== originalUserName && userNameAvailable === false) {
            validateAndFocusField('userName');
            return toast.error('Username is already taken');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: formData,
            });
            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Image Selection Handlers
    const handleProfilePictureSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropConfig({
                shape: 'round',
                aspect: 1,
                imageType: 'profile'
            });
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCoverImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropConfig({
                shape: 'rect',
                aspect: 16 / 9,
                imageType: 'cover'
            });
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob) => {
        if (cropConfig.imageType === 'profile') {
            await uploadProfilePicture(croppedBlob);
        } else {
            await uploadCoverImage(croppedBlob);
        }
        setCropPortalOpen(false);
    };

    const [profilePictureLoading, setProfilePictureLoading] = useState(false)

    const uploadProfilePicture = async (blob) => {
        const formData = new FormData();
        formData.append('profilePicture', blob, 'profile.jpg');
        setProfilePictureLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofilepicture`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error("Profile picture upload failed");
        } finally {
            setProfilePictureLoading(false);
        }
    };

    const [coverImageloading, setCoverImageloading] = useState(false);

    const uploadCoverImage = async (blob) => {
        const formData = new FormData();
        formData.append('coverImage', blob, 'cover.jpg');
        setCoverImageloading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updatecoverimage`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message || "Cover image updated successfully");
            }
        } catch (error) {
            toast.error("Cover image upload failed");
        } finally {
            setCoverImageloading(false)
        }
    };

    const [candidateCategories, setCandidateCategories] = useState([])

    const getCandidateCategories = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/candidate-categories`);
            if (data.success) {
                setCandidateCategories(data.categories || []);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getCandidateCategories()
    }, [])

    // const SCORE = SCORE
    const ScoreBadge = ({ field, condition }) => {
        const pts = SCORE[field];
        if (!pts) return null;
        return (
            <span className="text-green-600 p-0 text-xs font-medium whitespace-nowrap" style={{ float: 'right' }}>
                +{pts} points
                {condition && <span className="text-green-400 font-normal"> ({condition})</span>}
            </span>
        );
    };

    // Tabs Configuration
    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "education", label: "Education" },
        { id: "experience", label: "Experience" },
        { id: "skills", label: "Skills" },
        { id: "projects", label: "Projects" },
        { id: "awards", label: "Awards" },
    ];

    const handleCancel = () => {
        if (userData) {
            setFormData({
                ...userData,
                language: userData.language || [],
                customSocialNetworks: userData.customSocialNetworks || [],
                education: userData.education || [],
                experience: userData.experience || [],
                skills: userData.skills || [],
                projects: userData.projects || [],
                awards: userData.awards || [],
            });
        }
    };

    return (
        <div className='w-full bg-white rounded-xl border border-gray-200 p-6 md:p-8 pb-20 md:pb-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                </div>
                {/* <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="primary-btn flex items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                </button> */}
            </div>
            <div className='mb-6'>
                <div className='flex min-w-sm'>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`cursor-pointer px-6 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className='w-full flex gap-8'>
                <div className='w-full md:w-[65%]'>
                    {/* Content */}
                    <div className='w-full'>
                        {/* 1️⃣ Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className='space-y-8'>
                                {/* Cover Image */}
                                <div className='flex flex-col relative'>
                                    <div className='flex mb-4 items-center gap-4'>
                                        <div ref={el => fieldRefs.current['profilePicture'] = el}>
                                            <label htmlFor="profilePicture" className='whitespace-nowrap'><span>Profile Picture <StatusIcon condition={validate(userData?.profilePicture || '', 'url').valid} falseClass="text-yellow-500" /></span><ScoreBadge field="profilePicture" /></label>
                                            <div className='w-45 h-36 rounded-md overflow-hidden flex items-center justify-center'>
                                                <div className='relative flex items-center justify-center border border-gray-300 w-36 h-36 rounded-md object-cover'>
                                                    {profilePictureLoading ? <div className='flex items-center justify-center'>
                                                        <Loader className='w-12 h-12 animate-spin' />
                                                    </div> :
                                                        <Img
                                                            src={userData?.profilePicture || '/placeholder.png'}
                                                            style="w-36 h-36 rounded-md object-cover "
                                                        />
                                                    }
                                                    <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer hover:bg-[var(--primary-color)]/80 transition'>
                                                        <FaCamera size={14} className='text-white' />
                                                        <input type="file" accept="image/*" className='hidden' onChange={handleProfilePictureSelect} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div ref={el => fieldRefs.current['coverImage'] = el} className='w-full'>
                                            <label className=''><span>Cover Image</span><ScoreBadge field="coverImage" /></label>
                                            <div className='relative w-full h-36 bg-gray-50 rounded-md overflow-hidden group border border-gray-300'>
                                                {userData?.coverImage ? (
                                                    <>
                                                        {coverImageloading ? <div className='flex w-full h-full items-center justify-center'>
                                                            <Loader className='w-12 h-12 animate-spin' />
                                                        </div> :
                                                            <Img
                                                                src={userData.coverImage}
                                                                style="w-full h-full object-cover"
                                                            />
                                                        }
                                                    </>
                                                ) : (
                                                    <div className='w-full h-full'>
                                                        <img src="/placeholder.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
                                                    </div>
                                                )}
                                                <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] p-2 rounded-full cursor-pointer hover:bg-[var(--primary-color)]/80 transition'>
                                                    <FaCamera size={14} className='text-white' />
                                                    <input type="file" accept="image/*" className='hidden' onChange={handleCoverImageSelect} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='md:col-span-2 space-y-4 mt-16 md:mt-0'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <label className=''><span>First Name <StatusIcon condition={validate(formData.name || '', 'notEmpty').valid} /></span><ScoreBadge field="name" /></label>
                                                <input
                                                    ref={el => fieldRefs.current['name'] = el}
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder='First Name'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Last Name</label>
                                                <input
                                                    ref={el => fieldRefs.current['lastName'] = el}
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    placeholder='Last Name'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''><span>Username <StatusIcon condition={validate(formData.userName || '', 'notEmpty').valid} /></span><ScoreBadge field="userName" />{userNameUpdatedAt && formData.userName === originalUserName && (() => {
                                                    const daysSince = Math.floor((Date.now() - new Date(userNameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
                                                    const daysLeft = 30 - daysSince;
                                                    const color = daysSince < 30 ? 'text-orange-500' : 'text-gray-400';
                                                    return <span className={`${color} text-xs font-medium ml-2`}>{daysSince < 30 ? `${daysLeft}d remaining` : `${daysSince}d ago`}</span>;
                                                })()}</label>
                                                <div className='relative'>
                                                    <input
                                                        ref={el => fieldRefs.current['userName'] = el}
                                                        type="text"
                                                        name="userName"
                                                        value={formData.userName}
                                                        onChange={handleChange}
                                                        placeholder='johndoe'
                                                        maxLength={15}
                                                        className='!pr-10'
                                                        disabled={userNameUpdatedAt && Math.floor((Date.now() - new Date(userNameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)) < 30}
                                                    />
                                                    {userNameChecking && (
                                                        <Loader size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                                    )}
                                                    {!userNameChecking && userNameAvailable === true && formData.userName?.length >= 10 && formData.userName !== originalUserName && (
                                                        <CheckCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                                    )}
                                                    {!userNameChecking && userNameAvailable === false && formData.userName?.length >= 10 && formData.userName !== originalUserName && (
                                                        <X size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-400 mt-1">Profile URL: /candidates/{formData.category || "..."}/{formData.userName || "username"}</p>
                                                    <span className="text-xs text-gray-400">{(formData.userName || '').length}/15</span>
                                                </div>
                                                {formData.userName?.length > 0 && formData.userName?.length < 10 && (
                                                    <p className="text-xs text-orange-500 mt-1">Must be at least 10 characters</p>
                                                )}
                                                {!userNameChecking && userNameAvailable === true && formData.userName?.length >= 10 && formData.userName?.length <= 15 && formData.userName !== originalUserName && (
                                                    <p className="text-xs text-green-600 mt-1">Username is available</p>
                                                )}
                                                {!userNameChecking && userNameAvailable === false && formData.userName !== originalUserName && (
                                                    <p className="text-xs text-red-500 mt-1">Username is already taken</p>
                                                )}
                                                {userNameChecking && formData.userName?.length >= 10 && (
                                                    <p className="text-xs text-gray-400 mt-1">Checking availability...</p>
                                                )}
                                                {userNameUpdatedAt && formData.userName === originalUserName && (() => {
                                                    const daysSince = Math.floor((Date.now() - new Date(userNameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
                                                    if (daysSince < 30) {
                                                        const daysLeft = 30 - daysSince;
                                                        return <p className="text-xs text-orange-500 mt-1">Username locked — can be changed again in {daysLeft} day{daysLeft > 1 ? 's' : ''}</p>;
                                                    }
                                                    return <p className="text-xs text-gray-400 mt-1">Current username (no change)</p>;
                                                })()}
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    disabled
                                                    className='w-full border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
                                                    placeholder='Email'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''><span>Phone <StatusIcon condition={validate(formData.phone || '', 'notEmpty').valid} falseClass="text-yellow-500" /></span><ScoreBadge field="phone" /></label>
                                                <div className='relative'>
                                                    <PhoneInputField
                                                        ref={el => fieldRefs.current['phone'] = el}
                                                        type="tel"
                                                        setFormData={setFormData}
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder='Phone Number'
                                                        className={
                                                            `border ${userData?.isPhoneVerified
                                                                ? "border-green-500"
                                                                : "border-red-500"
                                                            } items-center`
                                                        }
                                                    />

                                                    {/* Verification Icon with Tooltip */}

                                                    <Tooltip onClick={() => navigate('/dashboard/settings')} className={"absolute top-1/2 right-3 -translate-y-1/2 -bg-conic-300 "} text={userData?.isPhoneVerified ? "Phone Number Verified" : "Phone Number is not Verified"}>
                                                        {userData?.isPhoneVerified ? (
                                                            <Check className="text-green-500" />
                                                        ) : (
                                                            <IoMdWarning className="text-red-500" />
                                                        )}
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''><span>Current Position <StatusIcon condition={validate(formData.currentPosition || '', 'notEmpty').valid} /></span><ScoreBadge field="currentPosition" /></label>
                                                <input
                                                    ref={el => fieldRefs.current['currentPosition'] = el}
                                                    type="text"
                                                    name="currentPosition"
                                                    value={formData.currentPosition}
                                                    onChange={handleChange}
                                                    placeholder='Current Position'
                                                />
                                            </div>
                                            <div className='space-y-1 col-span-1 md:col-span-2'>
                                                <label className=''><span>Language</span><ScoreBadge field="language" /></label>
                                                <Select
                                                    ref={el => fieldRefs.current['language'] = el}
                                                    isMulti
                                                    name="language"
                                                    value={(formData.language || []).map(lang => LANGUAGES.find(l => l.value === lang)).filter(Boolean)}
                                                    className={"mt-1.5"}
                                                    onChange={(options) => {
                                                        if ((options || []).length > 5) return toast.error('Maximum 5 languages allowed');
                                                        setFormData({ ...formData, language: (options || []).map(o => o.value) });
                                                    }}
                                                    options={LANGUAGES}
                                                    placeholder="Select languages (max 5)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className='border-gray-100' />

                                {/* Details */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-1'>
                                        <label className=''><span>Date of Birth</span><ScoreBadge field="dob" /></label>
                                        <input
                                            ref={el => fieldRefs.current['dob'] = el}
                                            type="date"
                                            name="dob"
                                            value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                                            onChange={handleChange}
                                            placeholder={Date.now().toLocaleString()}
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className=''><span>Age</span><ScoreBadge field="age" /></label>
                                        <CustomSelect
                                            ref={el => fieldRefs.current['age'] = el}
                                            name="age"
                                            value={formData.age}
                                            className={"mt-1.5"}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        >
                                            <option value="18-25">18-25</option>
                                            <option value="25-30">25-30</option>
                                            <option value="30-35">30-35</option>
                                            <option value="35-40">35-40</option>
                                        </CustomSelect>
                                    </div>
                                    <div className='space-y-1'>
                                        <label className=''><span>Gender</span><ScoreBadge field="gender" /></label>
                                        <CustomSelect
                                            ref={el => fieldRefs.current['gender'] = el}
                                            name="gender"
                                            value={formData.gender}
                                            className={"mt-1.5"}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </CustomSelect>
                                    </div>
                                    <div ref={el => fieldRefs.current['category'] = el} className='space-y-1'>
                                        <label className=''><span>Category <StatusIcon condition={validate(formData.category || '', 'notEmpty').valid} /></span><ScoreBadge field="category" /></label>
                                        <Select
                                            options={candidateCategories?.map(cat => ({ value: cat?.slug, label: cat?.name })) || []}
                                            value={formData.category ? { value: formData.category, label: candidateCategories?.find(c => c.slug === formData.category)?.name || formData.category } : null}
                                            onChange={(option) => setFormData({ ...formData, category: option?.value || '' })}
                                            placeholder="Select Category"
                                            isSearchable
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className=''><span>Qualification</span><ScoreBadge field="qualification" /></label>
                                        <CustomSelect
                                            ref={el => fieldRefs.current['qualification'] = el}
                                            className={"mt-1.5"}
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        >
                                            <option value="">Select Qualification</option>
                                            <option value="High School">High School</option>
                                            <option value="Bachelors">Bachelors</option>
                                            <option value="Masters">Masters</option>
                                            <option value="PhD">PhD</option>
                                        </CustomSelect>
                                    </div>
                                    <div className='space-y-1'>
                                        <label className=''><span>Experience <StatusIcon condition={validate(formData.experienceYears || '', 'notEmpty').valid} falseClass="text-yellow-500" /></span><ScoreBadge field="experienceYears" /></label>
                                        <CustomSelect
                                            ref={el => fieldRefs.current['experienceYears'] = el}
                                            className={"mt-1.5"}
                                            name="experienceYears"
                                            value={formData.experienceYears}
                                            onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                        >
                                            <option value="Fresher">Fresher</option>
                                            <option value="1-2 years">1-2 Years</option>
                                            <option value="3-5 years">3-5 Years</option>
                                            <option value="6-8 years">6-8 Years</option>
                                            <option value="9+ years">9+ Years</option>
                                        </CustomSelect>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className="">
                                            <span>Offered Salary</span><ScoreBadge field="offeredSalary" />
                                        </label>
                                        <input
                                            // type="te"
                                            ref={el => fieldRefs.current['offeredSalary'] = el}

                                            type='number'
                                            name="offeredSalary"
                                            value={formData.offeredSalary ?? ''}
                                            onChange={(e) => setFormData({ ...formData, offeredSalary: e.target.value })}
                                            placeholder={userData?.offeredSalary || "30"}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className="">
                                            <span>Salary Type</span><ScoreBadge field="salaryType" />
                                        </label>
                                        <CustomSelect
                                            ref={el => fieldRefs.current['salaryType'] = el}
                                            label="salaryType"
                                            name="salaryType"
                                            value={formData.salaryType || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="day">Per Day</option>
                                            <option value="month">Per Month</option>
                                            <option value="year">Per Year</option>
                                        </CustomSelect>
                                    </div>

                                    <div ref={el => fieldRefs.current['description'] = el} className='col-span-full space-y-1'>
                                        <label className=''><span>Description <StatusIcon condition={validate(formData.description || '', 'notEmpty').valid} falseClass="text-yellow-500" /></span><ScoreBadge field="description" /></label>
                                        <TiptapEditor
                                            value={formData.description}
                                            onChange={(content) =>
                                                handleChange({
                                                    target: { name: "description", value: content }
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <hr className='border-gray-100' />

                                {/* Location */}
                                <div>
                                    <h3 className='text-lg font-semibold text-gray-800 mb-4 '><span>Location</span><ScoreBadge field="city" /></h3>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                        <div className='col-span-full space-y-1'>
                                            <label className=''><span>Address</span><ScoreBadge field="address" /></label>
                                            <input
                                                ref={el => fieldRefs.current['address'] = el}
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder='Enter Your Address here...'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className=''><span>Postal Code</span><ScoreBadge field="postal" /></label>
                                            <input
                                                ref={el => fieldRefs.current['postal'] = el}
                                                type="text"
                                                name="postal"
                                                value={formData.postal}
                                                onChange={handleChange}
                                                placeholder='Enter Your Postal Code here...'
                                            />
                                        </div>
                                        {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> */}
                                        <div ref={el => fieldRefs.current['country'] = el} className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">Country <StatusIcon condition={validate(formData.country || '', 'notEmpty').valid} /></label>
                                            <Select
                                                options={countriesList}
                                                value={countriesList.find(c => c.value === formData.country) || null}
                                                onChange={(option) => {
                                                    const newCountry = option?.value || '';
                                                    const currentCountry = formData.country;

                                                    if (newCountry === currentCountry) return;

                                                    // If switching away from original country, save current location
                                                    if (currentCountry === originalLocation.address.split(',')[0] || currentCountry === formData.country) {
                                                        // Save current location data before clearing
                                                        setSavedLocation({
                                                            address: formData.address,
                                                            city: formData.city,
                                                            state: formData.state,
                                                            postal: formData.postal,
                                                        });
                                                    }

                                                    // Check if returning to original country
                                                    const isReturningToOriginal = newCountry && originalLocation.city && (
                                                        newCountry === userData?.country
                                                    );

                                                    if (isReturningToOriginal && savedLocation) {
                                                        // Restore saved location for this country
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            country: newCountry,
                                                            address: savedLocation.address,
                                                            city: savedLocation.city,
                                                            state: savedLocation.state,
                                                            postal: savedLocation.postal,
                                                        }));
                                                        setSavedLocation(null);
                                                    } else {
                                                        // Clear location fields
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            country: newCountry,
                                                            address: '',
                                                            city: '',
                                                            state: '',
                                                            postal: '',
                                                        }));
                                                    }
                                                }}
                                                placeholder="Search for a country..."
                                                isSearchable
                                                isLoading={countriesLoading}
                                            />
                                        </div>
                                        <div ref={el => fieldRefs.current['city'] = el} className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">City <StatusIcon condition={validate(formData.city || '', 'notEmpty').valid} falseClass="text-yellow-500" /></label>
                                            <Select
                                                options={citiesList}
                                                value={citiesList.find(c => c.value === formData.city) || null}
                                                onChange={(option) => {
                                                    const newCity = option?.value || '';
                                                    const currentCity = formData.city;

                                                    if (newCity === currentCity) return;

                                                    // If switching away from original city, save current state
                                                    if (currentCity && originalLocation.city) {
                                                        setSavedLocation(prev => ({
                                                            ...(prev || {}),
                                                            state: formData.state,
                                                        }));
                                                    }

                                                    // Check if returning to original city
                                                    const isReturningToOriginal = newCity && newCity === originalLocation.city;

                                                    if (isReturningToOriginal) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            city: newCity,
                                                            state: savedLocation?.state || originalLocation.state,
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            city: newCity,
                                                            state: '',
                                                        }));
                                                    }
                                                }}
                                                placeholder={formData.country ? "Search for a city..." : "Select a country first"}
                                                isSearchable
                                                isLoading={citiesLoading}
                                                isDisabled={!formData.country}
                                            />
                                            {/* </div> */}
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <LocationPickerMap
                                            position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                                            defaultCenter={mapCenter}
                                            defaultZoom={mapZoom}
                                            setPosition={() => { }}
                                            onChange={(loc) => {
                                                setFormData(prev => ({ ...prev, ...loc, postal: loc.zip || prev.postal }));
                                            }}
                                        />
                                    </div>
                                </div>

                                <hr className='border-gray-100' />

                                {/* Social Links */}
                                <div>
                                    <h3 className='text-lg font-semibold text-gray-800 mb-4 '><span>Social Networks <span className='text-red-500 text-xs'>At least 2 to boost profile</span></span><ScoreBadge field="social" condition="min 2 links" /></h3>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {/* Predefined Social Links */}
                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                LinkedIn
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['linkedin'] = el}
                                                    type="text"
                                                    name="linkedin"
                                                    value={formData.linkedin}
                                                    onChange={handleChange}
                                                    placeholder="https://linkedin.com/in/yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.linkedin && <StatusIcon condition={validate(formData.linkedin, 'linkedinUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                X
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['x'] = el}
                                                    type="text"
                                                    name="x"
                                                    value={formData.x}
                                                    onChange={handleChange}
                                                    placeholder="https://x.com/yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.x && <StatusIcon condition={validate(formData.x, 'xUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                Facebook
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['facebook'] = el}
                                                    type="text"
                                                    name="facebook"
                                                    value={formData.facebook}
                                                    onChange={handleChange}
                                                    placeholder="https://facebook.com/yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.facebook && <StatusIcon condition={validate(formData.facebook, 'facebookUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                Instagram
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['instagram'] = el}
                                                    type="text"
                                                    name="instagram"
                                                    value={formData.instagram}
                                                    onChange={handleChange}
                                                    placeholder="https://instagram.com/yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.instagram && <StatusIcon condition={validate(formData.instagram, 'instagramUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                YouTube
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['youtube'] = el}
                                                    type="text"
                                                    name="youtube"
                                                    value={formData.youtube}
                                                    onChange={handleChange}
                                                    placeholder="https://youtube.com/@yourchannel"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.youtube && <StatusIcon condition={validate(formData.youtube, 'youtubeUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                TikTok
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['tiktok'] = el}
                                                    type="text"
                                                    name="tiktok"
                                                    value={formData.tiktok}
                                                    onChange={handleChange}
                                                    placeholder="https://tiktok.com/@yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.tiktok && <StatusIcon condition={validate(formData.tiktok, 'tiktokUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='space-y-1'>
                                            <label className=' flex items-center gap-2'>
                                                GitHub
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    ref={el => fieldRefs.current['github'] = el}
                                                    type="text"
                                                    name="github"
                                                    value={formData.github}
                                                    onChange={handleChange}
                                                    placeholder="https://github.com/yourprofile"
                                                    className='!pr-10'
                                                />
                                                <span className='absolute right-3 top-1/2 -translate-y-1/2'>
                                                    {formData.github && <StatusIcon condition={validate(formData.github, 'githubUrl').valid} falseIcon="✘" />}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Social Networks */}
                                    <div className='mt-6 space-y-4'>
                                        <h4 className='text-sm font-semibold text-gray-700'>Other Social Networks</h4>
                                        {formData.customSocialNetworks?.map((net, idx) => (
                                            <div key={idx} className='flex gap-3 items-center'>
                                                <input
                                                    type="text"
                                                    value={net.network}
                                                    onChange={(e) => handleArrayChange(idx, 'customSocialNetworks', 'network', e.target.value)}
                                                    placeholder="Network name"
                                                />
                                                <input
                                                    type="text"
                                                    value={net.url}
                                                    onChange={(e) => handleArrayChange(idx, 'customSocialNetworks', 'url', e.target.value)}
                                                    placeholder="Profile URL"
                                                />
                                                <button
                                                    onClick={() => removeArrayItem('customSocialNetworks', idx)}
                                                    className='text-red-500 hover:bg-red-50 p-2 rounded-lg'
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addArrayItem('customSocialNetworks', { network: '', url: '' })}
                                            className='text-[var(--primary-color)] font-medium text-sm flex items-center gap-2 hover:underline'
                                        >
                                            <FaPlus size={12} /> Add More Social Networks
                                        </button>
                                    </div>

                                    {/* Video URL */}
                                    <div className='mt-6 space-y-1'>
                                        <label className=' text-md'><span>Video Introduction</span><ScoreBadge field="videoUrl" /></label>
                                        <div className='relative mt-1'>
                                            <FaVideo className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                            <input
                                                ref={el => fieldRefs.current['videoUrl'] = el}
                                                type="text"
                                                name="videoUrl"
                                                value={formData.videoUrl}
                                                onChange={handleChange}
                                                placeholder="e.g. YouTube link"
                                                className='!pl-10'
                                            />
                                        </div>
                                    </div>

                                    {/* Portfolio URL */}
                                    <div className='mt-6 space-y-1'>
                                        <label className='text-md'>Portfolio <StatusIcon condition={validate(formData.portfolio || '', 'url').valid} falseClass="text-yellow-500" /></label>
                                        <div className='relative mt-1'>
                                            <input
                                                ref={el => fieldRefs.current['portfolio'] = el}
                                                type="text"
                                                name="portfolio"
                                                value={formData.portfolio || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. https://yourportfolio.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2️⃣ Education Tab */}
                        {activeTab === 'education' && (
                            <div className='space-y-6'>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 "><span>Education</span><ScoreBadge field="education" condition="min 1 entry" /></h3>
                                </div>
                                {formData.education?.map((edu, idx) => (
                                    <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                        <div className='w-full flex items-center justify-between '>
                                            <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                Education {idx + 1}
                                            </h4>
                                            <button
                                                onClick={() => removeArrayItem('education', idx)}
                                                className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <label className=''>Degree Title</label>
                                                <input
                                                    type="text"
                                                    value={edu.title || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'education', 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Level</label>
                                                <input
                                                    type="text"
                                                    value={edu.level || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'education', 'level', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>From</label>
                                                <input
                                                    type="date"
                                                    value={edu.from ? new Date(edu.from).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleArrayChange(idx, 'education', 'from', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>To</label>
                                                <input
                                                    type="date"
                                                    value={edu.to ? new Date(edu.to).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleArrayChange(idx, 'education', 'to', e.target.value)}
                                                />
                                            </div>
                                            <div className='col-span-full space-y-1'>
                                                <label className=''>Description</label>
                                                <TiptapEditor
                                                    value={edu.description || ''}
                                                    onChange={(content) =>
                                                        handleArrayChange(idx, "education", "description", content)
                                                    }
                                                />

                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('education', { title: '', level: '', from: '', to: '', description: '' })}
                                    className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                                >
                                    <FaPlus /> Add Education
                                </button>
                            </div>
                        )}

                        {/* 3️⃣ Experience Tab */}
                        {activeTab === 'experience' && (
                            <div className='space-y-6'>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 "><span>Experience</span><ScoreBadge field="experience" condition="min 1 entry" /></h3>
                                </div>
                                {formData.experience?.map((exp, idx) => (
                                    <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                        <div className='w-full flex items-center justify-between'>
                                            <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                Experience {idx + 1}
                                            </h4>
                                            <button
                                                onClick={() => removeArrayItem('experience', idx)}
                                                className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <label className=''>Job Title</label>
                                                <input
                                                    type="text"
                                                    value={exp.jobTitle || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'experience', 'jobTitle', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Company</label>
                                                <input
                                                    type="text"
                                                    value={exp.company || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'experience', 'company', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>From</label>
                                                <input
                                                    type="date"
                                                    value={exp.from ? new Date(exp.from).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleArrayChange(idx, 'experience', 'from', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>To</label>
                                                <input
                                                    type="date"
                                                    value={exp.to ? new Date(exp.to).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleArrayChange(idx, 'experience', 'to', e.target.value)}
                                                />
                                            </div>
                                            <div className='col-span-full space-y-1'>
                                                <label className=''>Description</label>
                                                <TiptapEditor
                                                    value={exp.description || ''}
                                                    onChange={(content) =>
                                                        handleArrayChange(idx, "experience", "description", content)
                                                    }
                                                />

                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('experience', { jobTitle: '', company: '', from: '', to: '', description: '' })}
                                    className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                                >
                                    <FaPlus /> Add Experience
                                </button>
                            </div>
                        )}

                        {/* 4️⃣ Skills Tab */}
                        {activeTab === 'skills' && (
                            <div ref={el => fieldRefs.current['skills'] = el} className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 "><span>Skills <StatusIcon condition={formData.skills?.length >= 2} falseClass="text-yellow-500" /></span><ScoreBadge field="skills" condition="min 2" /></h3>
                                <SkillsSelector
                                    selectedSkills={formData.skills || []}
                                    onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                                />
                            </div>
                        )}

                        {/* 5️⃣ Projects Tab */}
                        {activeTab === 'projects' && (
                            <div className='space-y-6'>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 "><span>Projects</span><ScoreBadge field="projects" condition="min 1" /></h3>
                                </div>
                                {formData.projects?.map((proj, idx) => (
                                    <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                        <div className='w-full flex items-center justify-between'>
                                            <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                Projects {idx + 1}
                                            </h4>
                                            <button
                                                onClick={() => removeArrayItem('projects', idx)}
                                                className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                                                <div className='space-y-1'>
                                                    <label className=''>Project Title</label>
                                                    <input
                                                        type="text"
                                                        value={proj.title || ''}
                                                        onChange={(e) => handleArrayChange(idx, 'projects', 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className='space-y-1'>
                                                    <label className=''>Link</label>
                                                    <input
                                                        type="text"
                                                        value={proj.link || ''}
                                                        onChange={(e) => handleArrayChange(idx, 'projects', 'link', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Description</label>
                                                <TiptapEditor
                                                    value={proj.description || ''}
                                                    onChange={(content) =>
                                                        handleArrayChange(idx, "projects", "description", content)
                                                    }
                                                />
                                            </div>

                                            {/* Project Images */}
                                            <div className='space-y-1'>
                                                <label className=''>Project Images</label>
                                                <div className='flex flex-col gap-4'>
                                                    {proj.images?.length > 0 && (
                                                        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {proj.images.map((image, imageIdx) => (
                                                                <div key={imageIdx} className="relative group flex flex-col items-center">
                                                                    <Img
                                                                        willOpen
                                                                        src={image}
                                                                        alt={`Project ${idx + 1} - ${imageIdx + 1}`}
                                                                        style="w-full object-cover rounded-2xl border border-gray-200 h-40"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteProjectImage(idx, image)}
                                                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id={`projectImages_${idx}`}
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => uploadProjectImages(e.target.files, idx)}
                                                    />
                                                    <label
                                                        htmlFor={`projectImages_${idx}`}
                                                        className={`text-center py-8 border bg-[var(--accent-color)]  border-[var(--primary-color)]/80 w-38 h-38 gap-2 cursor-pointer justify-center rounded-md ${uploadingProjectImages[idx] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className='flex flex-col w-full h-full items-center gap-2'>
                                                            <Upload className='text-[var(--primary-color)]' />
                                                            <div>
                                                                Upload Images
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('projects', { title: '', link: '', description: '', images: [] })}
                                    className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                                >
                                    <FaPlus /> Add Project
                                </button>
                            </div>
                        )}

                        {/* 6️⃣ Awards Tab */}
                        {activeTab === 'awards' && (
                            <div className='space-y-6'>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 "><span>Awards</span><ScoreBadge field="awards" condition="min 1" /></h3>
                                </div>
                                {formData.awards?.map((award, idx) => (
                                    <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                        <div className='w-full flex items-center justify-between'>
                                            <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                Award {idx + 1}
                                            </h4>
                                            <button
                                                onClick={() => removeArrayItem('awards', idx)}
                                                className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <label className=''>Award Title</label>
                                                <input
                                                    type="text"
                                                    value={award.title || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'awards', 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Date Awarded</label>
                                                <input
                                                    type="date"
                                                    value={award.date ? new Date(award.date).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleArrayChange(idx, 'awards', 'date', e.target.value)}
                                                />
                                            </div>
                                            <div className='col-span-full space-y-1'>
                                                <label className=''>Description</label>
                                                <TiptapEditor
                                                    value={award.description || ''}
                                                    onChange={(content) =>
                                                        handleArrayChange(idx, "awards", "description", content)
                                                    }
                                                />

                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addArrayItem('awards', { title: '', date: '', description: '' })}
                                    className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                                >
                                    <FaPlus /> Add Award
                                </button>
                            </div>
                        )}
                    </div>
                    <div className='bg-white flex gap-4 justify-end border-t border-gray-200 z-50 p-4 sticky bottom-0'>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="secondary-btn flex items-center gap-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className="primary-btn flex items-center gap-2"
                        >
                            <Save size={18} />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
                <div className='w-[35%] flex flex-col items-center pr-4 max-md:hidden'>
                    <div className='sticky top-10 w-full flex flex-col items-center'>
                        <div className='relative w-64 h-64'>
                            <CircularProgressbar
                                value={previewProfileScore}
                                text={`${previewProfileScore}%`}
                                strokeWidth={2.5}
                                styles={buildStyles({
                                    pathColor: "var(--primary-color)",
                                    trailColor: "#e6e6e6",
                                    strokeLinecap: "butt",
                                    textColor: "#000",
                                    textSize: "14px",
                                })}
                            />
                            <div
                                className='absolute top-1/2 mt-10 -translate-1/2 left-1/2 text-center'
                            >
                                Profile Strength
                            </div>
                        </div>
                        {(() => {
                            const recConfig = [
                                { key: 'profilePicture', label: 'Profile Picture', icon: ImageIcon, done: validate(formData.profilePicture || '', 'url').valid },
                                { key: 'phone', label: 'Phone', icon: Phone, done: validate(formData.phone || '', 'notEmpty').valid },
                                { key: 'experienceYears', label: 'Experience', icon: Briefcase, done: validate(formData.experienceYears || '', 'notEmpty').valid },
                                { key: 'city', label: 'City', icon: MapPin, done: validate(formData.city || '', 'notEmpty').valid },
                                { key: 'description', label: 'Description', icon: FileText, done: validate(formData.description || '', 'notEmpty').valid },
                                { key: 'skills', label: 'Skills (min 2)', icon: Award, done: formData.skills?.length >= 2 },
                                { key: 'portfolio', label: 'Portfolio', icon: Globe, done: validate(formData.portfolio || '', 'url').valid },
                            ];
                            const missing = recConfig.filter(r => !r.done);
                            if (missing.length === 0) return null;
                            return (
                                <div className='w-full mt-6 p-5 rounded-xl border border-gray-200 bg-white shadow-sm'>
                                    <h4 className='text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                                        <Award size={14} className='text-[var(--primary-color)]' />
                                        Recommended
                                    </h4>
                                    <div className='space-y-2.5'>
                                        {missing.map(({ key, label, icon: Icon }) => (
                                            <div
                                                key={key}
                                                onClick={() => validateAndFocusField(key)}
                                                className='group flex items-center justify-between text-sm text-gray-600 cursor-pointer bg-gray-50 hover:bg-[var(--accent-color)] border border-gray-200 hover:border-[var(--primary-color)] rounded-lg px-3.5 py-3 transition-all duration-200'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <Icon size={15} className='text-gray-400 group-hover:text-[var(--primary-color)] transition-colors duration-200' />
                                                    <span className='group-hover:text-[var(--primary-color)] transition-colors duration-200 font-medium'>{label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
            <ImageCropPortal
                isOpen={cropPortalOpen}
                onClose={() => setCropPortalOpen(false)}
                imageSrc={selectedImage}
                cropShape={cropConfig.shape}
                aspect={cropConfig.aspect}
                onCropComplete={handleCropComplete}
                requireLandscape={cropConfig.imageType === 'cover'}
                imageType={cropConfig.imageType}
            />
            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50'>
                <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="primary-btn flex items-center gap-2 w-full justify-center"
                >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default MyProfile;
