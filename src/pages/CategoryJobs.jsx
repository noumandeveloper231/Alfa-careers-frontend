import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilter } from "react-icons/fa";
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'sonner';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import NotFound404 from '../components/NotFound404';
import "swiper/css";
import Navbar from '../components/Navbar';
import CustomSelect from '../components/CustomSelect';
import { getCategoryIcon } from '../utils/categoryIcons';
import { getCategoryName } from '../utils/categoryNames';
import Breadcrumbs from '../components/Breadcrumbs';

const CategoryJobs = () => {
  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  let { cat } = useParams();
  console.log('cat', cat)

  const { backendUrl } = useContext(AppContext);

  const [categoryJobs, setCategoryJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [filteredJobType, setFilteredJobType] = useState('jobType');
  const [filteredLocationType, setFilteredLocationType] = useState('locationType');
  const [subCategory, setSubCategory] = useState('');
  const getCategoryJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/jobs/getcategoryjobs`, { cat });
      if (data.success) setCategoryJobs(data.approvedCategoryJobs);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/categories`);
      if (data.success) setCategories(data.categories);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    getCategoryJobs();
    getCategories();
  }, [cat]);

  const filteredJobs = categoryJobs.filter((job) =>
    (filteredLocationType === "locationType" || job.locationType === filteredLocationType) &&
    (filteredJobType === "jobType" || job.jobType === filteredJobType) &&
    (subCategory === '' || job.subCategory === subCategory)
  );

  if (loading || categoriesLoading) return <Loading />;


  const currentCategory = categories.find(cat1 => cat1.slug === cat);

  return (
    <div>
      <Navbar className={"max-w-6xl mx-auto"} />
      <main className='bg-[var(--bg)]  py-10'>

        <div className='max-w-6xl mx-auto'>
          {/* Breadcrumb */}
          <Breadcrumbs />
          <section className={`py-12 border border-[var(--primary-color)]/50 rounded-2xl bg-[var(--accent-color)]`}>
            <h1 className="text-3xl font-bold text-center text-[var(--primary-color)] flex flex-col items-center justify-center gap-2">
              {(() => {
                const Icon = getCategoryIcon(currentCategory?.icon || cat.toLowerCase())
                return Icon ? <Icon size={45} /> : null
              })()}
              {getCategoryName(cat)}
            </h1>
          </section>

          {/* Filters */}
          <section className='p-2 mt-4'>
            <div className='flex items-center gap-8'>
              <h2 className='flex items-center gap-4 font-semibold'>
                <FaFilter className='text-[var(--primary-color)]' /> Filter:
              </h2>
              <div className='flex items-center gap-4'>
                <CustomSelect
                  value={filteredJobType}
                  name={"jobType"}
                  onChange={(e) => setFilteredJobType(e.target.value)}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </CustomSelect>
                <CustomSelect
                  value={filteredLocationType}
                  name={"locationType"}
                  onChange={(e) => setFilteredLocationType(e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="On Site">On Site</option>
                  <option value="Hybrid">Hybrid</option>
                </CustomSelect>
              </div>
            </div>

            <div className='grid my-5 grid-cols-1 md:grid-cols-2 gap-4'>
              {filteredJobs.length !== 0
                ? filteredJobs.map((job, i) => <JobCard key={i} e={job} />)
                : <NotFound404 value={"No Jobs Found"} margin={"my-10"} />}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
};

export default CategoryJobs;
