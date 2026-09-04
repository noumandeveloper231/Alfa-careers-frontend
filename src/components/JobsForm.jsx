import { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import CustomSelect from "./CustomSelect";
import Select from "./Select";
import StatusIcon from "./StatusIcon";
import JobCard from "./JobCard";
import slugify from 'slugify'
import { TiptapEditor } from "./TiptapEditor";
import LocationPickerMap from "./LocationPickerMap";
import { AlertTriangle } from "lucide-react";
import { validate } from "../../lib/validation";


const JobForm = ({ setActiveTab }) => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const editJob = location.state?.editJob;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'SQL Server',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Agile', 'Scrum',
    'UI/UX Design', 'Figma Design', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Content Editor', 'Technical Writing', 'Product Manager', 'Communication Skills',
    'BackEnd Developer', 'FrontEnd Developer', 'Full Stack Developer', 'DevOps',
    'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning',
    'Mobile Development', 'iOS Development', 'Android Development', 'React Native', 'Flutter',
    'Testing', 'Unit Testing', 'Integration Testing', 'QA', 'Selenium', 'Jest',
    'Documentation', 'API Development', 'REST API', 'GraphQL', 'Microservices',
    'Problem Solving', 'Team Leadership', 'Project Management', 'Critical Thinking'
  ]);
  const isModifiedView = editJob?.approved === "modified";
  const [viewMode, setViewMode] = useState('updated');
  const editor = useRef(null);
  const fieldRefs = useRef({});

  const isFieldChanged = (fieldKey) => {
    if (!isModifiedView) return false;
    const oldVal = editJob?.[fieldKey];
    const newVal = editJob?.modifiedData?.[fieldKey];
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  };

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

  // Form State
  const [jobData, setJobData] = useState({
    title: "",
    slug: "",
    category: "",
    subCategory: "",
    jobType: "",
    skills: [],
    description: "",
    careerLevel: "",
    experience: "",
    qualifications: "",
    quantity: 1,
    gender: "Any",
    closingDays: 30,
    salaryType: "fixed",
    minSalary: "",
    maxSalary: "",
    fixedSalary: "",
    currency: "USD",
    salaryRate: "Monthly",
    jobApplyType: "Email",
    externalUrl: "",
    userEmail: "",
    location: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    latitude: null,
    longitude: null,
    gallery: [],
    video: "",
    responsibilities: [],
    benefits: [],
    companyProfile: userData?.profilePicture,
  });

  // Pre-populate form if editing an existing job
  useEffect(() => {
    const data = isModifiedView
      ? (viewMode === 'updated' ? editJob?.modifiedData : editJob)
      : editJob;
    if (data) {
      setJobData(prev => ({
        ...prev,
        ...data,
        skills: data.skills || [],
        responsibilities: data.responsibilities || [],
        benefits: data.benefits || [],
        gallery: data.gallery || [],
      }));
    }
  }, [viewMode, isModifiedView, editJob?._id]);

  // Auto-sync location from address parts for backward compat
  useEffect(() => {
    const parts = [jobData.address, jobData.city, jobData.state, jobData.country, jobData.zip].filter(Boolean);
    const synced = parts.join(', ');
    if (jobData.location !== synced) {
      setJobData(prev => ({ ...prev, location: synced }));
    }
  }, [jobData.address, jobData.city, jobData.state, jobData.country, jobData.zip]);

  const [jobs, setJobs] = useState([])
  const [isSlugAvailable, setIsSlugAvailable] = useState(true);

  const getJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`);
      if (data.success) {
        setJobs(data.jobs)
      } else {
        console.error(data.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getJobs()
  }, [])


  const [slugSuggestions, setSlugSuggestions] = useState([]);

  useEffect(() => {
    if (!jobData?.title || !jobData?.slug || jobs.length === 0) return;

    const exists = jobs.some((job) => editJob?._id !== job._id && job.slug === jobData.slug);

    setIsSlugAvailable(!exists);

    if (exists) {
      const base = jobData.slug;
      setSlugSuggestions(generateSlugSuggestions(base));
    } else {
      setSlugSuggestions([]);
    }
  }, [jobData.slug, jobData.title]);

  const getCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/categories`);
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/skills`);
        if (data.success) {
          setAvailableSkills(data.skills.map(s => s.name));
        }
      } catch { /* ignore */ }
    };
    fetchSkills();
  }, [backendUrl]);

  const handleJobChange = (e) => {
    const { name, value } = e.target;

    // Auto-generate slug whenever the title changes so availability checks run
    if (name === "title") {
      const generatedSlug = slugify(value || "", { lower: true });
      setJobData((prev) => ({
        ...prev,
        title: value,
        slug: generatedSlug,
      }));
      return;
    }

    if (name === "category") {
      const selectedCategory = categories.find((cat) => cat.name === value);
      setSubCategories(selectedCategory?.subcategories || []);
      setJobData((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const postJob = async (e) => {
    e.preventDefault();

    if (!validate(jobData.title || '', 'notEmpty').valid) {
      validateAndFocusField('title');
      return toast.error('Job Title is required');
    }
    if (!validate(jobData.slug || '', 'slug').valid) {
      validateAndFocusField('slug');
      return toast.error('Slug is required');
    }
    if (!validate(jobData.category || '', 'notEmpty').valid) {
      validateAndFocusField('category');
      return toast.error('Category is required');
    }
    if (!validate(jobData.jobType || '', 'notEmpty').valid) {
      validateAndFocusField('jobType');
      return toast.error('Job Type is required');
    }
    if (!validate(jobData.description || '', 'notEmpty').valid) {
      validateAndFocusField('description');
      return toast.error('Description is required');
    }
    if (!validate(jobData.city || '', 'notEmpty').valid) {
      validateAndFocusField('location');
      return toast.error('City is required');
    }
    if (!validate(jobData.country || '', 'notEmpty').valid) {
      validateAndFocusField('country');
      return toast.error('Country is required');
    }
    if (!validate(jobData.experience || '', 'notEmpty').valid) {
      validateAndFocusField('experience');
      return toast.error('Experience is required');
    }
    if (!validate(jobData.qualifications || '', 'notEmpty').valid) {
      validateAndFocusField('qualifications');
      return toast.error('Qualification is required');
    }
    if (!jobData.skills || jobData.skills.length === 0) {
      validateAndFocusField('skills');
      return toast.error('At least one skill is required');
    }

    try {
      const payload = {
        ...jobData,
        careerLevel: jobData.careerLevel || undefined,
      };

      const url = editJob
        ? `${backendUrl}/api/jobs/updatejob/${editJob._id}`
        : `${backendUrl}/api/jobs/addjob`;

      const method = editJob ? 'put' : 'post';

      const { data } = await axios[method](url, {
        jobData: payload,
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/dashboard/jobs');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const saveDraft = async (e) => {
    if (e) e.preventDefault();

    const hasRequiredContent =
      jobData.title.trim() !== '' ||
      jobData.slug.trim() !== '' ||
      jobData.category.trim() !== '' ||
      jobData.jobType.trim() !== '' ||
      jobData.description.trim() !== '' ||
      jobData.city.trim() !== '' ||
      jobData.country.trim() !== '' ||
      jobData.experience.trim() !== '' ||
      jobData.qualifications.trim() !== '' ||
      jobData.skills.length > 0;

    if (!hasRequiredContent) {
      toast.error("At least one required field must be filled to save as a draft.");
      return;
    }

    try {
      const payload = {
        ...jobData,
        careerLevel: jobData.careerLevel || undefined,
        companyProfile: userData?.profilePicture || '',
        company: userData?.company || '',
      };

      const url = editJob
        ? `${backendUrl}/api/jobs/updatejob/${editJob._id}`
        : `${backendUrl}/api/jobs/addjob`;

      const method = editJob ? 'put' : 'post';

      const { data } = await axios[method](url, {
        jobData: payload,
        saveAsDraft: true,
      });

      if (data.success) {
        toast.success(data.message);
        setJobData({
          title: "",
          slug: "",
          category: "",
          subCategory: "",
          jobType: "",
          skills: [],
          description: "",
          careerLevel: "",
          experience: "",
          qualifications: "",
          quantity: 1,
          gender: "Any",
          closingDays: 30,
          salaryType: "fixed",
          minSalary: "",
          maxSalary: "",
          fixedSalary: "",
          currency: "USD",
          salaryRate: "Monthly",
          jobApplyType: "Email",
          externalUrl: "",
          userEmail: "",
          location: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zip: "",
          latitude: null,
          longitude: null,
          gallery: [],
          video: "",
          responsibilities: [],
          benefits: []
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const currencyOptions = [
    { value: "USD", label: "USD - United States Dollar" },
    { value: "AED", label: "AED - United Arab Emirates Dirham" },
    { value: "PKR", label: "PKR - Pakistani Rupee" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "BDT", label: "BDT - Bangladesh Taka" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "NZD", label: "NZD - New Zealand Dollar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CNY", label: "CNY - Chinese Yuan" },
  ];

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

  const isFormValid = !!(jobData.title && jobData.slug && jobData.category && jobData.jobType && jobData.description && jobData.city && jobData.country);

  const changedStyle = (fieldKey) => {
    if (!isModifiedView || viewMode !== 'updated') return {};
    if (!isFieldChanged(fieldKey)) return {};
    return { boxShadow: '0 0 0 2px #22c55e', borderColor: '#22c55e' };
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col h-full">
      <div className="p-6 pb-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{editJob ? 'Edit Job' : 'Create a job post'}</h1>
      </div>

      {(editJob?.approved === "approved" || editJob?.approved === "modified") && (
        <div className="mx-6 mt-4 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">This job is currently {editJob?.approved === "modified" ? "under review for modifications" : "published"}.</p>
            <p className="text-yellow-700 mt-1">Any changes you submit will require admin review. The current published version will stay live until approved.</p>
          </div>
        </div>
      )}
      <div className="flex gap-6 p-6 flex-1">
        <form id="job-form" className="flex flex-col gap-8 flex-1" onSubmit={postJob}>
          {/* View mode toggle for modified review */}
          {isModifiedView && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Viewing: <span className={viewMode === 'current' ? 'text-gray-500' : 'text-[var(--primary-color)]'}>{viewMode === 'current' ? 'Current Live Version' : 'Submitted Changes'}</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'current' ? 'updated' : 'current')}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              >
                Show {viewMode === 'current' ? 'Submitted Changes' : 'Current Live Version'}
              </button>
            </div>
          )}
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Info</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title <StatusIcon condition={validate(jobData.title || '', 'notEmpty').valid} /></label>
                <input
                  type="text"
                  name="title"
                  ref={el => fieldRefs.current['title'] = el}
                  value={jobData.title}
                  onChange={handleJobChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                  disabled={isModifiedView}
                  style={changedStyle('title')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug <StatusIcon condition={validate(jobData.slug || '', 'slug').valid} />
                </label>

                <div className="flex items-center w-full bg-[#f9f9f9] border border-gray-300 rounded-md overflow-hidden">

                  <span className="text-gray-600 bg-[#f9f9f9] px-4 py-2 whitespace-nowrap text-sm border-r border-gray-300 tracking-wider">
                    https://alfacareers.com/jobs/<b>{slugify(jobData?.category || "category", { lower: true })}</b>/
                  </span>

                  <input
                    type="text"
                    name="slug"
                    ref={el => fieldRefs.current['slug'] = el}
                    value={
                      jobData.slug?.toLowerCase() ||
                      slugify(jobData.title || "").toLowerCase()
                    }
                    onChange={handleJobChange}
                    className="w-full bg-white px-4 py-2 text-gray-800 outline-none"
                    placeholder="enter-slug-here"
                    required
                    disabled={isModifiedView}
                    style={changedStyle('slug')}
                  />
                </div>
              </div>

              {!isSlugAvailable && slugSuggestions.length > 0 ? (
                <div className="mt-2">
                  <p className="text-red-600 text-sm mb-1">Slug not available. Try one:</p>

                  <div className="flex flex-wrap gap-2">
                    {slugSuggestions.map((s, i) => (
                      <button
                        onClick={() => handleJobChange({ target: { name: "slug", value: s } })}
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
              ) : isSlugAvailable && jobData.slug ? (
                <p className="text-green-600 text-sm mt-1">Slug is available</p>
              ) : null}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Category <StatusIcon condition={validate(jobData.category || '', 'notEmpty').valid} /></label>
                    <Select
                      ref={el => fieldRefs.current['category'] = el}
                      options={categories.map(cat => ({ value: cat.slug, label: cat.name }))}
                      value={jobData.category ? { value: jobData.category, label: categories.find(c => c.slug === jobData.category)?.name || jobData.category } : null}
                      onChange={(option) => {
                        setJobData(prev => ({ ...prev, category: option?.value || '', subCategory: '' }))
                        setSubCategories([])
                      }}
                      placeholder="Select Category"
                      isSearchable
                      isDisabled={isModifiedView}
                      highlighted={isFieldChanged('category')}
                    />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <StatusIcon condition={validate(jobData.jobType || '', 'notEmpty').valid} /></label>
                  <CustomSelect
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleJobChange}
                    ref={el => fieldRefs.current['jobType'] = el}
                    disabled={isModifiedView}
                    fieldChanged={isFieldChanged('jobType')}
                  >
                    <option value="">Select Job Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills <StatusIcon condition={jobData.skills?.length > 0} /></label>
                <Select
                  ref={el => fieldRefs.current['skills'] = el}
                  options={availableSkills.map(s => ({ value: s, label: s }))}
                  value={(jobData.skills || []).map(s => ({ value: s, label: s }))}
                  onChange={(options) => setJobData(prev => ({ ...prev, skills: options ? options.map(o => o.value) : [] }))}
                  isMulti
                  isSearchable
                  placeholder="Search and select skills..."
                  isDisabled={isModifiedView}
                  highlighted={isFieldChanged('skills')}
                />
              </div>

              <div ref={el => fieldRefs.current['description'] = el} tabIndex={-1}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <StatusIcon condition={validate(jobData.description || '', 'notEmpty').valid} /></label>
                <TiptapEditor
                  value={jobData.description}
                  onChange={(content) =>
                    handleJobChange({
                      target: { name: "description", value: content }
                    })
                  }
                  editable={!isModifiedView}
                  className={isFieldChanged('description') && isModifiedView && viewMode === 'updated' ? 'ring-2 ring-green-400 border-green-400' : ''}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Details Section */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Level</label>
                <CustomSelect name="careerLevel" value={jobData.careerLevel} onChange={handleJobChange} disabled={isModifiedView} fieldChanged={isFieldChanged('careerLevel')}>
                  <option value="">Select Career Level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience <StatusIcon condition={validate(jobData.experience || '', 'notEmpty').valid} /></label>
                <CustomSelect name="experience" value={jobData.experience} onChange={handleJobChange} ref={el => fieldRefs.current['experience'] = el} disabled={isModifiedView} fieldChanged={isFieldChanged('experience')}>
                  <option value="">Select Experience</option>
                  <option value="Fresh">Fresh</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                  <option value="5 Years+">5 Years+</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification <StatusIcon condition={validate(jobData.qualifications || '', 'notEmpty').valid} /></label>
                <CustomSelect name="qualifications" value={jobData.qualifications} onChange={handleJobChange} ref={el => fieldRefs.current['qualifications'] = el} disabled={isModifiedView} fieldChanged={isFieldChanged('qualifications')}>
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" name="quantity" value={jobData.quantity} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" min="1" disabled={isModifiedView} style={changedStyle('quantity')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <CustomSelect name="gender" value={jobData.gender} onChange={handleJobChange} disabled={isModifiedView} fieldChanged={isFieldChanged('gender')}>
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Days</label>
                <input type="number" name="closingDays" value={jobData.closingDays} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" min="1" disabled={isModifiedView} style={changedStyle('closingDays')} />
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Salary Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Salary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <CustomSelect name="salaryType" value={jobData.salaryType} onChange={handleJobChange} disabled={isModifiedView} fieldChanged={isFieldChanged('salaryType')}>
                  <option value="fixed">Fixed</option>
                  <option value="range">Range</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <Select
                  options={currencyOptions}
                  value={currencyOptions.find(c => c.value === jobData.currency) || null}
                  onChange={(option) => handleJobChange({ target: { name: 'currency', value: option?.value || '' } })}
                  placeholder="Select Currency"
                  isSearchable
                  isDisabled={isModifiedView}
                  highlighted={isFieldChanged('currency')}
                />
              </div>

              {jobData.salaryType === 'range' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                    <input type="number" name="minSalary" value={jobData.minSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Min" disabled={isModifiedView} style={changedStyle('minSalary')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                    <input type="number" name="maxSalary" value={jobData.maxSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Max" disabled={isModifiedView} style={changedStyle('maxSalary')} />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Salary</label>
                  <input type="number" name="fixedSalary" value={jobData.fixedSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Amount" disabled={isModifiedView} style={changedStyle('fixedSalary')} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                <CustomSelect name="salaryRate" value={jobData.salaryRate} onChange={handleJobChange} disabled={isModifiedView} fieldChanged={isFieldChanged('salaryRate')}>
                  <option value="Hourly">Per Hour</option>
                  <option value="Monthly">Per Month</option>
                  <option value="Yearly">Per Year</option>
                </CustomSelect>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Job Apply Type */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Job Apply Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apply Method</label>
                <CustomSelect name="jobApplyType" value={jobData.jobApplyType} onChange={handleJobChange} disabled={isModifiedView} fieldChanged={isFieldChanged('jobApplyType')}>
                  <option value="Email">By Email</option>
                  <option value="External">External Link</option>
                  <option value="Call">By Call</option>
                </CustomSelect>
              </div>
              {
                jobData.jobApplyType !== "Internal" &&
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {jobData.jobApplyType === 'Email' ? 'Email Address' : jobData.jobApplyType === 'Call' ? 'Phone Number' : 'External URL'}
                  </label>
                  <input
                    type={jobData.jobApplyType === 'Email' ? 'email' : jobData.jobApplyType === 'Call' ? 'tel' : 'url'}
                    name={jobData.jobApplyType === 'Email' ? 'userEmail' : jobData.jobApplyType === 'Call' ? 'userPhone' : 'externalUrl'}
                    value={jobData.jobApplyType === 'Email' ? jobData.userEmail : jobData.jobApplyType === 'Call' ? jobData.userPhone : jobData.externalUrl}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder={jobData.jobApplyType === 'Email' ? 'Enter email address' : jobData.jobApplyType === 'Call' ? 'Enter phone number' : 'https://example.com/apply'}
                    disabled={isModifiedView}
                    style={changedStyle(jobData.jobApplyType === 'Email' ? 'userEmail' : jobData.jobApplyType === 'Call' ? 'userPhone' : 'externalUrl')}
                  />
                </div>
              }

            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Location (Map + Address) */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={jobData.address}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="Street address"
                    disabled={isModifiedView}
                    style={changedStyle('address')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City <StatusIcon condition={validate(jobData.city || '', 'notEmpty').valid} /></label>
                  <input
                    type="text"
                    name="city"
                    ref={el => fieldRefs.current['location'] = el}
                    value={jobData.city}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="e.g. New York"
                    required
                    disabled={isModifiedView}
                    style={changedStyle('city')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={jobData.state}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="e.g. NY"
                    disabled={isModifiedView}
                    style={changedStyle('state')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country <StatusIcon condition={validate(jobData.country || '', 'notEmpty').valid} /></label>
                  <input
                    type="text"
                    name="country"
                    value={jobData.country}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="e.g. United States"
                    required
                    disabled={isModifiedView}
                    style={changedStyle('country')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={jobData.zip}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="e.g. 10001"
                    disabled={isModifiedView}
                    style={changedStyle('zip')}
                  />
                </div>
              </div>
              {!isModifiedView && (
                <LocationPickerMap
                  position={jobData.latitude && jobData.longitude ? [jobData.latitude, jobData.longitude] : null}
                  setPosition={(pos) => {
                    if (!pos) {
                      setJobData(prev => ({ ...prev, latitude: null, longitude: null }));
                    }
                  }}
                  onChange={(loc) => {
                    setJobData(prev => ({ ...prev, ...loc }));
                  }}
                />
              )}
            </div>
          </section>

        </form>
        <div className="hidden lg:block w-full max-w-lg">
          <div className="sticky top-0 space-y-4">
            {isModifiedView ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">This is a read-only view of the job modifications. Changes can only be made after an admin reviews the submission.</p>
                <button type="button" onClick={() => setActiveTab("listed-jobs")} className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Back to Jobs</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex gap-3">
                  <button type="button" onClick={saveDraft} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Save as draft</button>
                  <button
                    type="submit"
                    form="job-form"
                    disabled={!isFormValid}
                    className={`flex-1 px-4 py-2 rounded-md font-medium text-white text-sm ${isFormValid ? 'bg-[var(--primary-color)] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {editJob ? 'Save' : 'Post Job'}
                  </button>
                </div>
                <button type="button" onClick={() => setActiveTab("listed-jobs")} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            )}
            <JobCard e={jobData} />
          </div>
        </div>
      </div>
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 space-y-2 z-10">
        {isModifiedView ? (
          <button type="button" onClick={() => setActiveTab("listed-jobs")} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Back to Jobs</button>
        ) : (
          <>
            <div className="flex gap-3">
              <button type="button" onClick={saveDraft} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Save as draft</button>
              <button
                type="submit"
                form="job-form"
                disabled={!isFormValid}
                className={`flex-1 px-4 py-2 rounded-md font-medium text-white text-sm ${isFormValid ? 'bg-[var(--primary-color)] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {editJob ? 'Save' : 'Post Job'}
              </button>
            </div>
            <button type="button" onClick={() => setActiveTab("listed-jobs")} className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
};

export default JobForm;