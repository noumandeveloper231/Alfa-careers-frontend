import axios from 'axios';
import { memo, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Phone, MapPin, Briefcase, Save, Building, FileText, Camera, Clock, Upload, X, Image, ImageIcon, Loader2, Award, Globe, Users } from 'lucide-react'
import Img from './Image';
import Select from './Select';
import { getCountries, getCitiesForCountry } from '../../lib/location';
import SearchSelect from './SelectSearch';
import LocationPickerMap from './LocationPickerMap';

import { MdWarning } from 'react-icons/md';
import CustomSelect from './CustomSelect';
import ImageCropPortal from '../portals/ImageCropPortal';
import slugify from 'slugify'
import { TiptapEditor } from "./TiptapEditor"
import CompanyCard from './CompanyCard'
import StatusIcon from './StatusIcon'
import { validate } from '../../lib/validation'
import { useLocation, useNavigate } from 'react-router-dom'

const EmployeeProfile = () => {
    const { userData, backendUrl, setUserData } = useContext(AppContext);

    const [formData, setFormData] = useState({
        name: userData?.name || "",
        slug: userData?.slug || "",
        foundedIn: userData?.foundedIn || "",
        company: userData?.company || "",
        website: userData?.website || "",
        members: userData?.members || "",
        city: userData?.city || "",
        country: userData?.country || "",
        state: userData?.state || "",
        contactNumber: userData?.contactNumber || "",
        about: userData?.about || "",
        category: userData?.category || "",
        address: userData?.address || "",
        zip: userData?.zip || "",
        latitude: userData?.latitude || null,
        longitude: userData?.longitude || null,
        companyType: userData?.companyType || "",
    });

    const [companyImages, setCompanyImages] = useState(userData?.companyImages || []);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Crop Portal State
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pictureLoading, setPictureLoading] = useState(false);

    const [countriesList, setCountriesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const fieldRefs = useRef({});
    const navigate = useNavigate();
    const location = useLocation();

    const REQUIRED_FIELDS = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'company', label: 'Company Name' },
        { key: 'category', label: 'Category' },
        { key: 'country', label: 'Country' },
        { key: 'city', label: 'City' },
        { key: 'companyType', label: 'Company Type' },
    ];

    const RECOMMENDED_FIELDS = [
        { key: 'profilePicture', label: 'Profile Picture', icon: ImageIcon },
        { key: 'banner', label: 'Cover Image', icon: Image },
        { key: 'about', label: 'About Company', icon: FileText },
        { key: 'website', label: 'Website', icon: Globe },
        { key: 'contactNumber', label: 'Phone Number', icon: Phone },
        { key: 'members', label: 'Company Size', icon: Users },
        { key: 'address', label: 'Address', icon: MapPin },
        { key: 'companyImages', label: 'Company Images', icon: ImageIcon },
    ];

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

    // Ensure slug is populated from company name on mount or whenever company changes
    useEffect(() => {
        if (formData.company && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: slugify(prev.company || "", { lower: true })
            }));
        }
    }, [formData.company, formData.slug]);

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


    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "company") {
            const generatedSlug = slugify(value || "", { lower: true });
            setFormData((prev) => ({
                ...prev,
                company: value,
                slug: generatedSlug,
            }));
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));
    };

    // ---------- Update Profile ----------
    const updateProfile = async (e) => {
        e.preventDefault();

        if (!validate(formData.name || '', 'notEmpty').valid) {
            validateAndFocusField('name');
            return toast.error('Name is required');
        }
        if (!validate(formData.slug || '', 'notEmpty').valid) {
            validateAndFocusField('slug');
            return toast.error('Slug is required');
        }
        if (!validate(formData.company || '', 'notEmpty').valid) {
            validateAndFocusField('company');
            return toast.error('Company Name is required');
        }
        if (!validate(formData.category || '', 'notEmpty').valid) {
            validateAndFocusField('category');
            return toast.error('Category is required');
        }
        if (!validate(formData.country || '', 'notEmpty').valid) {
            validateAndFocusField('country');
            return toast.error('Country is required');
        }
        if (!validate(formData.city || '', 'notEmpty').valid) {
            validateAndFocusField('city');
            return toast.error('City is required');
        }
        if (!validate(formData.companyType || '', 'notEmpty').valid) {
            validateAndFocusField('companyType');
            return toast.error('Company Type is required');
        }

        if (formData?.website && !formData.website.includes("http")) {
            validateAndFocusField('website');
            return toast.error("Enter a Valid Website Url")
        }

        if (formData?.about?.split(" ").length > 150) {
            validateAndFocusField('about');
            return toast.error("About should be between 50 and 150 words")
        }

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
        }
    };

    // Handle profile picture selection
    const handleProfilePictureSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset file input
        e.target.value = '';
    };

    // Handle crop complete
    const handleCropComplete = async (croppedBlob) => {
        if (cropConfig.imageType === 'profile') {
            await uploadProfilePicture(croppedBlob);
        } else if (cropConfig.imageType === 'cover') {
            await uploadBannerImage(croppedBlob);
        }
    };
    const [cropConfig, setCropConfig] = useState({
        shape: 'rect',
        aspect: 1,
        imageType: 'profile'
    });

    const handleBannerImageSelect = (e) => {
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

    // Upload profile picture
    const uploadProfilePicture = async (blob) => {
        setPictureLoading(true);
        const formData = new FormData();
        formData.append("profilePicture", blob, "profile.jpg");

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/updateprofilepicture`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setUserData(data.user);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setPictureLoading(false);
        }
    };

    // ---------- Company Images Upload ----------
    const uploadCompanyImages = async (files) => {
        if (!files || files.length === 0) return;

        setUploadingImages(true);
        const formData = new FormData();

        Array.from(files).forEach(file => {
            formData.append('companyImages', file);
        });

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/upload-company-images`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setCompanyImages(data.images);
                setUserData(prev => ({ ...prev, companyImages: data.images }));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload images");
        } finally {
            setUploadingImages(false);
        }
    };

    const [companies, setCompanies] = useState([])
    const [isSlugAvailable, setIsSlugAvailable] = useState(true);

    const getCompanies = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/allemployees`);
            if (data.success) {
                setCompanies(data.employees)
            } else {
                console.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getCompanies()
    }, [])

    const [slugSuggestions, setSlugSuggestions] = useState([]);

    useEffect(() => {
        if (!formData?.company || !formData?.slug) return;

        const exists = companies.some((company) => company.slug === formData.slug);

        setIsSlugAvailable(!exists);

        if (exists) {
            const base = formData.slug;
            setSlugSuggestions(generateSlugSuggestions(base));
        } else {
            setSlugSuggestions([]);
        }
    }, [formData.slug, formData.company]);

    const generateSlugSuggestions = (base) => {
        const timestamp = Date.now().toString().slice(-4); // last 4 digits
        return [
            `${base}-job`,
            `${base}-vacancy`,
            `${base}-position`,
            `${base}-${timestamp}`,   // impossible-to-collide
            `${base}-${timestamp + 8}`,   // impossible-to-collide
            `${base}-${timestamp + 1}`,   // impossible-to-collide
            `${base}-${timestamp + 9}`,   // impossible-to-collide
        ];
    };

    // ---------- Delete Company Image ----------
    const deleteCompanyImage = async (imageUrl) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/delete-company-image`,
                { imageUrl }
            );

            if (data.success) {
                setCompanyImages(data.images);
                setUserData(prev => ({ ...prev, companyImages: data.images }));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete image");
        }
    };

    const [bannerLoading, setBannerLoading] = useState(false);

    const uploadBannerImage = async (blob) => {
        const formData = new FormData();
        formData.append('banner', blob, 'banner.jpg');
        setBannerLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updatebanner`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message || "Cover image updated successfully");
            }
        } catch (error) {
            toast.error("Cover image upload failed");
        } finally {
            setBannerLoading(false)
        }
    };

    const [companyCategories, setCompanyCategories] = useState([]);

    const getCompanyCategories = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/company-categories`);
            if (data.success) {
                setCompanyCategories(data.categories);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch company categories");
        }
    };

    useEffect(() => {
        getCompanyCategories();
    }, []);


    return (
        <div className='w-full bg-white rounded-xl border border-gray-200 p-6 md:p-8 pb-20 md:pb-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Update Profile</h1>
                </div>
                <button
                    onClick={updateProfile}
                    className="primary-btn flex items-center gap-2 max-md:hidden"
                >
                    <Save size={18} />
                    Save
                </button>
            </div>
            <div className='w-full flex gap-8'>
                <div className='w-full md:w-[65%]'>
                    <div className='w-full'>
                        <div className='space-y-8'>
                            <div>
                                <h4 className='text-lg font-semibold text-gray-800'>Basic Info</h4>
                            </div>
                            <div className='w-full space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Name <StatusIcon condition={validate(formData.name || '', 'notEmpty').valid} />
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    ref={el => fieldRefs.current['name'] = el}
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={userData?.name || "Name"}
                                />
                            </div>
                            <div className='w-full space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Company Name <StatusIcon condition={validate(formData.company || '', 'notEmpty').valid} />
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    ref={el => fieldRefs.current['company'] = el}
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder={userData?.company || "Company"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug <StatusIcon condition={validate(formData.slug || '', 'notEmpty').valid} />
                                </label>

                                <div className="flex items-center w-full bg-[#f9f9f9] border border-gray-300 rounded-md overflow-hidden ">

                                    <span className="text-gray-600 bg-[#f9f9f9] px-4 py-2 whitespace-nowrap text-sm border-r border-gray-300 tracking-wider">
                                        https://alfacareers.com/jobs/companies/
                                    </span>

                                    <input
                                        type="text"
                                        name="slug"
                                        ref={el => fieldRefs.current['slug'] = el}
                                        value={
                                            formData.slug?.toLowerCase() ||
                                            slugify(formData.company || "").toLowerCase()
                                        }
                                        onChange={handleChange}
                                        className="w-full bg-white px-4 py-2 text-gray-800 outline-none"
                                        placeholder="enter-slug-here"
                                        required
                                    />
                                </div>
                            </div>
                            {!isSlugAvailable && slugSuggestions.length > 0 ? (
                                <div>
                                    <p className="text-red-600 text-sm mb-1">Slug not available. Try one:</p>

                                    <div className="flex flex-wrap gap-2">
                                        {slugSuggestions.map((s, i) => (
                                            <button
                                                onClick={() => handleChange({ target: { name: "slug", value: s } })}
                                                key={i}
                                                className="
            bg-[var(--accent-color)]
            text-[var(--primary-color)]
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            flex items-center gap-2
            border border-[var(--primary-color)]/20
          "
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : isSlugAvailable && formData.slug ? (
                                <p className="text-green-600 text-sm mt-1">Slug is available</p>
                            ) : null}

                            <div className='space-y-2' ref={el => fieldRefs.current['about'] = el} tabIndex={-1}>
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    About Company <StatusIcon condition={validate(formData.about || '', 'notEmpty').valid} falseClass="text-yellow-500" />
                                </label>
                                <TiptapEditor
                                    value={formData.about}
                                    onChange={(content) =>
                                        handleChange({
                                            target: { name: "about", value: content }
                                        })
                                    }
                                />
                            </div>

                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Website <StatusIcon condition={validate(formData.website || '', 'url').valid} falseClass="text-yellow-500" />
                                </label>
                                <input
                                    type="text"
                                    name="website"
                                    ref={el => fieldRefs.current['website'] = el}
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder={userData?.website || "https://"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Phone Number <StatusIcon condition={validate(formData.contactNumber || '', 'notEmpty').valid} falseClass="text-yellow-500" />
                                </label>
                                <input
                                    type='tel'
                                    name="contactNumber"
                                    ref={el => fieldRefs.current['contactNumber'] = el}
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder={userData?.contactNumber || "+92 123 456789"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className='bg-gray-50 !border-gray-200 !cursor-not-allowed'
                                    readOnly
                                    placeholder={userData?.email || "+92 123 456789"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Founded In
                                </label>
                                <CustomSelect
                                    label="foundedIn"
                                    name="foundedIn"
                                    value={formData.foundedIn || ""}
                                    onChange={handleChange}
                                >
                                    {
                                        Array.from({ length: 26 }, (_, i) => 2010 + i).map(opt => (
                                            <option value={String(opt)}>{String(opt)}</option>
                                        ))
                                    }
                                </CustomSelect>
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Company Size <StatusIcon condition={validate(formData.members || '', 'notEmpty').valid} falseClass="text-yellow-500" />
                                </label>
                                <CustomSelect
                                    label="Members"
                                    name="members"
                                    value={formData.members || ""}
                                    onChange={handleChange}
                                    ref={el => fieldRefs.current['members'] = el}
                                >
                                    <option value="">Select company size</option>
                                    <option value="0-50">0-50</option>
                                    <option value="50-100">50-100</option>
                                    <option value="100-500">100-500</option>
                                    <option value="500-1000">500-1000</option>
                                    <option value="1000+">1000+</option>
                                </CustomSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Category <StatusIcon condition={validate(formData.category || '', 'notEmpty').valid} />
                                </label>
                                <CustomSelect
                                    label="Category"
                                    name="category"
                                    value={formData.category || ""}
                                    onChange={handleChange}
                                    ref={el => fieldRefs.current['category'] = el}
                                >
                                    {
                                        companyCategories.map(category => (
                                            <option value={category.slug}>{category.name}</option>
                                        ))
                                    }
                                </CustomSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">Company Type <StatusIcon condition={validate(formData.companyType || '', 'notEmpty').valid} /></label>
                                <CustomSelect
                                    name="companyType"
                                    value={formData.companyType || ""}
                                    onChange={handleChange}
                                    ref={el => fieldRefs.current['companyType'] = el}
                                >
                                    <option value="Private Limited Company">Private Limited Company</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Government Organization">Government Organization</option>
                                    <option value="Non-Profit Organization">Non-Profit Organization</option>
                                    <option value="Startup">Startup</option>
                                    <option value="Educational Institute">Educational Institute</option>
                                    <option value="Consultancy / Agency">Consultancy / Agency</option>
                                </CustomSelect>
                            </div>
                            {/* Media */}
                            <div ref={el => fieldRefs.current['media'] = el} tabIndex={-1}>
                                <h4 className='text-lg font-semibold text-gray-800'>Media</h4>
                                <div className='flex w-full items-start gap-4 mt-4'>
                                    <div>
                                        <label htmlFor="profilePicture" className='text-sm font-medium text-gray-700'>Profile Picture <StatusIcon condition={validate(userData?.profilePicture || '', 'url').valid} falseClass="text-yellow-500" /></label>
                                        <div className='mt-1 relative w-36 h-36 rounded-md overflow-hidden flex items-center justify-center'>
                                            <div className='flex items-center justify-center border border-gray-300 w-36 h-36 rounded-md object-cover'>
                                                {pictureLoading ? <div className='flex items-center justify-center'>
                                                    <Loader2 className='w-12 h-12 animate-spin' />
                                                </div> :
                                                    <Img
                                                        src={userData?.profilePicture || '/placeholder.png'}
                                                        style="w-36 h-36 rounded-md object-cover "
                                                    />
                                                }
                                            </div>
                                            <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                                <Camera size={14} />
                                                <input type="file" accept="image/*" className='hidden' onChange={handleProfilePictureSelect} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className='flex-1'>
                                        <label className='text-sm font-medium text-gray-700'>Cover Image <StatusIcon condition={validate(userData?.banner || '', 'url').valid} falseClass="text-yellow-500" /></label>
                                        <div className='mt-1 relative w-full h-36 bg-gray-50 rounded-md overflow-hidden group border border-gray-300'>
                                            {userData?.banner ? (
                                                <>
                                                    {bannerLoading ? <div className='flex w-full h-full items-center justify-center'>
                                                        <Loader2 className='w-12 h-12 animate-spin' />
                                                    </div> :
                                                        <Img
                                                            src={userData.banner}
                                                            style="w-full h-full object-cover"
                                                        />
                                                    }
                                                </>
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-white'>
                                                    <ImageIcon size={48} className='opacity-50' />
                                                </div>
                                            )}
                                            <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                                <Camera size={14} />
                                                <input type="file" accept="image/*" className='hidden' onChange={handleBannerImageSelect} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h4 className='text-lg font-semibold text-gray-800'>Location</h4>
                                <div className='space-y-2 mt-4'>
                                    <label className="text-sm flex items-center gap-2 font-medium text-gray-700">Address <StatusIcon condition={validate(formData.address || '', 'notEmpty').valid} falseClass="text-yellow-500" /></label>
                                    <input
                                        type="text"
                                        name="address"
                                        ref={el => fieldRefs.current['address'] = el}
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder={userData?.address || "e.g, Block A New London"}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <label className="text-sm flex items-center gap-2 font-medium text-gray-700">State/Province</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder={userData?.state || "e.g, Punjab"}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                                        <input
                                            type="text"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            placeholder="e.g. 54000"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Country <StatusIcon condition={validate(formData.country || '', 'notEmpty').valid} /></label>
                                        <Select
                                            options={countriesList}
                                            value={countriesList.find(c => c.value === formData.country) || null}
                                            onChange={(option) => setFormData(prev => ({ ...prev, country: option?.value || '', city: '' }))}
                                            placeholder="Search for a country..."
                                            isSearchable
                                            isLoading={countriesLoading}
                                            ref={el => fieldRefs.current['country'] = el}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">City <StatusIcon condition={validate(formData.city || '', 'notEmpty').valid} /></label>
                                        <Select
                                            options={citiesList}
                                            value={citiesList.find(c => c.value === formData.city) || null}
                                            onChange={(option) => setFormData(prev => ({ ...prev, city: option?.value || '' }))}
                                            placeholder={formData.country ? "Search for a city..." : "Select a country first"}
                                            isSearchable
                                            isLoading={citiesLoading}
                                            isDisabled={!formData.country}
                                            ref={el => fieldRefs.current['city'] = el}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                </div>
                                <div className='mt-4'>
                                    <LocationPickerMap
                                        position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                                        setPosition={() => {}}
                                        onChange={(loc) => {
                                            setFormData(prev => ({ ...prev, ...loc, zip: loc.zip || prev.zip }));
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Gallery */}
                            <div ref={el => fieldRefs.current['gallery'] = el} tabIndex={-1}>
                                <h4 className='text-lg font-semibold text-gray-800'>Gallery <StatusIcon condition={companyImages.length > 0} falseClass="text-yellow-500" /></h4>
                                <div className='flex flex-col gap-4 w-full mt-4'>
                                    {companyImages.length > 0 && (
                                        <div className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {companyImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image}
                                                        alt={`Company ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-md border border-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => deleteCompanyImage(image)}
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
                                        id="companyImages"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => uploadCompanyImages(e.target.files)}
                                    />
                                    <label
                                        htmlFor="companyImages"
                                        className={`text-center py-8 border bg-[var(--accent-color)] border-[var(--primary-color)]/80 w-38 h-38 flex flex-col gap-2 cursor-pointer items-center justify-center rounded-md ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Upload className='text-[var(--primary-color)]' />
                                        <p>Upload Images</p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='w-[35%] pr-4 max-md:hidden'>
                    <div className='sticky top-10 w-full flex flex-col items-center'>
                        <CompanyCard company={userData} />
                        {(() => {
                            const missing = RECOMMENDED_FIELDS.filter(r => {
                                if (r.key === 'profilePicture') return !validate(userData?.profilePicture || '', 'url').valid;
                                if (r.key === 'banner') return !validate(userData?.banner || '', 'url').valid;
                                if (r.key === 'about') return !validate(formData.about || '', 'notEmpty').valid;
                                if (r.key === 'website') return !validate(formData.website || '', 'url').valid;
                                if (r.key === 'contactNumber') return !validate(formData.contactNumber || '', 'notEmpty').valid;
                                if (r.key === 'members') return !validate(formData.members || '', 'notEmpty').valid;
                                if (r.key === 'address') return !validate(formData.address || '', 'notEmpty').valid;
                                if (r.key === 'companyImages') return companyImages.length === 0;
                                return true;
                            });
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
                                                <X size={14} className='text-gray-300 group-hover:text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-all duration-200' />
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
                cropShape="round"
                aspect={1}
                onCropComplete={handleCropComplete}
                requireLandscape={false}
                imageType="profile"
            />
            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50'>
                <button
                    onClick={updateProfile}
                    className="primary-btn flex items-center gap-2 w-full justify-center"
                >
                    <Save size={18} />
                    Save
                </button>
            </div>
        </div>
    )
}

export default EmployeeProfile