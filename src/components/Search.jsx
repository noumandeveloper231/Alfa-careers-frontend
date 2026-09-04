import { Building, SearchIcon, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const Search = ({ Param, LocationParam }) => {
  const navigate = useNavigate();
  const location = useLocation()

  const [searchJob, setSearchJob] = useState('')
  const [searchLocation, setSearchLocation] = useState('All Cities')
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [locationSearchTerm, setLocationSearchTerm] = useState('')

  const cities = [
    'All Cities',
    'California',
    'San Francisco',
    'Los Angeles',
    'San Diego',
    'Sacramento',
    'New York',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'Miami',
    'Boston',
    'Seattle',
    'Denver',
    'Atlanta',
    'Dallas',
    'Austin',
    'Lahore'
  ];

  useEffect(() => {
    setSearchJob(Param ?? "");
  }, [Param]);

  useEffect(() => {
    if (LocationParam) setSearchLocation(LocationParam);
  }, [LocationParam]);

  const handleSubmit = (e) => {
    if (!searchJob.trim()) return;
    e.preventDefault();
    let url = `/jobs?job=${encodeURIComponent(searchJob)}`;
    if (searchLocation && searchLocation !== 'All Cities') {
      url += `&location=${encodeURIComponent(searchLocation)}`;
    }
    navigate(url);
  };

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  const handleLocationSelect = (city) => {
    setSearchLocation(city);
    setIsLocationDropdownOpen(false);
    setLocationSearchTerm('');
  };

  // Close dropdown when clicking outside
  const handleLocationBlur = () => {
    setTimeout(() => setIsLocationDropdownOpen(false), 150);
  };

  const handleLocationSearchChange = (e) => {
    setLocationSearchTerm(e.target.value);
  };

  return (
    <section
      id="search"
      className={`bg-white rounded-4xl border border-gray-200 ${location.pathname === '/' ? "max-w-4xl mx-auto" : "max-w-6xl mx-auto"}`}
    >
      <form onSubmit={handleSubmit} className="flex-col flex gap-3 md:flex-row md:gap-0 p-3 md:p-2">
        {/* Job Search Input */}
        <div className="flex flex-1 relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchJob}
            onChange={(e) => setSearchJob(e.target.value)}
            type="text"
            className="border-none !p-0 !pl-12"
            placeholder="Jobs title or keyword"
          />
        </div>

        {/* Location Select Search */}
        <div className="flex flex-1 relative">
          <div className="flex items-center gap-2 px-4 py-3 w-full">
            <Building size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder={searchLocation === 'All Cities' ? 'Location' : searchLocation}
              value={locationSearchTerm}
              onChange={handleLocationSearchChange}
              onFocus={() => setIsLocationDropdownOpen(true)}
              onBlur={handleLocationBlur}
              className="border-none !p-0 !pl-10"
            />
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform cursor-pointer ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            />
          </div>

          {/* Dropdown Menu */}
          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
              <div className="max-h-48 overflow-y-auto py-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={city}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleLocationSelect(city)}
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No locations found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="primary-btn"
        >
          Search
        </button>

        {(Param || (LocationParam && LocationParam !== 'All Cities')) && (
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
          >
            Clear
          </button>
        )}
      </form>
    </section>
  );
};

export default Search;