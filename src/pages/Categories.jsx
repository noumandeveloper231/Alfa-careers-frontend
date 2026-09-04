import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";

// React Icons
import Navbar from "../components/Navbar";
import { getCategoryIcon } from "../utils/categoryIcons";
import { Search } from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([])

  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const getAllJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/jobs/getalljobs")
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/categories');
      if (data.success) {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
    getAllJobs();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log(jobs)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar className={"max-w-6xl mx-auto"} />
      <main className="flex-1 ">
        {/* Header Section */}
        <div className="bg-[#f9f9f9]">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-8">
            <div className=" flex items-center gap-4 mb-6">
              <div>
                <p className="text-md font-bold text-black uppercase ">Job Categories</p>
                <h4 className="text-4xl font-semibold text-black mt-2">Find Jobs by Categories</h4>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                className="!pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
            </p>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse all categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((cat, index) => {
                const Icon = getCategoryIcon(cat?.icon || 'Tag');
                return (
                  <Link
                    to={`/categories/${cat.slug}`}
                    key={index}
                  >
                    <div
                      className="group bg-white hover:bg-gray-50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100"

                    >
                      <div className="flex flex-col items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon size={24} className="text-[var(--primary-color)]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                            {cat.name}
                          </h4>
                          <p className="text-black mb-3">
                            {jobs.filter(job => job.category === cat.slug)?.length || 0} jobs
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Categories;
