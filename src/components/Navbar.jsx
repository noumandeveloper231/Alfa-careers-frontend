import { useContext, useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { FiMenu, FiX } from "react-icons/fi";
import Loading from "./Loading";
import Img from "./Image"; // Assuming this is a local component for image rendering

// React iCONS
import { Gauge, HelpCircle, Building2, UserCircle, LogOut, User, FileText } from "lucide-react";
import { FaSearch } from "react-icons/fa";

import {
  Briefcase,
  LayoutDashboard,
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  Calendar,
  Settings,
} from "lucide-react";

// --- Configuration ---
const USER_NAV_LINKS = [
  { to: "/", icon: Gauge, label: "Home" },
  { to: "/jobs", icon: Briefcase, label: "Find Jobs" },
  { to: "/candidates", icon: Building2, label: "Candidates" },
  { to: "/companies", icon: HelpCircle, label: "Companies" },
];

const Navbar = ({ className }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, loading, backendUrl, setIsLoggedIn, setUserData, userData, isSearchOpen, setIsSearchOpen } =
    useContext(AppContext);

  const handleNavClick = (item) => {
    if (item.key === "logout") {
      logout();
    } else {
      navigate(item.path);
    }
    // Close mobile sidebar after navigation
    setIsMenuOpen(false);
  };

  let navLinks;

  if (userData?.role === "employee") {
    navLinks = [
      { name: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
      { name: "Jobs", key: "jobs", icon: <Briefcase size={20} />, path: "/dashboard/jobs" },
      { name: "Applicants", key: "applicants", icon: <Users size={20} />, path: "/dashboard/applicants" },
      { name: "Candidates", key: "candidates", icon: <UserCheck size={20} />, path: "/dashboard/candidates" },
      { name: "Package", key: "package", icon: <Heart size={20} />, path: "/dashboard/package" },
      { name: "Messages", key: "messages", icon: <MessageSquare size={20} />, path: "/dashboard/messages" },
      { name: "Meetings", key: "meetings", icon: <Calendar size={20} />, path: "/dashboard/meetings" },
      { name: "Company", key: "company", icon: <Building2 size={20} />, path: "/dashboard/company" },
      { name: "Settings", key: "settings", icon: <Settings size={20} />, path: "/dashboard/settings" },
      { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
    ];
  } else {
    navLinks = [
      { name: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
      { name: "Profile", key: "profile", icon: <User size={20} />, path: "/dashboard/profile" },
      { name: "My Resume", key: "resume", icon: <FileText size={20} />, path: "/dashboard/resume" },
      { name: "My Jobs", key: "my-jobs", icon: <Briefcase size={20} />, path: "/dashboard/my-jobs" },
      { name: "Following", key: "my-following", icon: <Briefcase size={20} />, path: "/dashboard/my-following" },
      { name: "Setting", key: "setting", icon: <Settings size={20} />, path: "/dashboard/settings" },
      { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
    ]
  }


  if (userData && userData.isAdmin) {
    navLinks.push({ name: "Admin", key: "admin", icon: <UserCircle size={20} />, path: "/admin" });
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [followedAccounts, setFollowedAccounts] = useState([]);

  // Refs for managing outside clicks
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Set default credentials for Axios
  axios.defaults.withCredentials = true;

  // --- Utility Functions ---

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
    // Ensure mobile menu is closed when opening dropdown
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
    // Ensure dropdown is closed when opening mobile menu
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // --- API Functions ---

  const logout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        toast.success(data.message);
        handleLinkClick("/"); // Navigates and closes menus
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const checkIsAdmin = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/check-admin`);
      setIsAdmin(data.success && data.isAdmin);
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    }
  };

  const getFollowedAccounts = async () => {
    if (userData?.role === "user") {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/followedaccounts`);
        if (data.success) {
          setFollowedAccounts(data.companies);
        }
      } catch (error) {
        console.error("Followed accounts fetch failed:", error);
      }
    } else {
      setFollowedAccounts([]);
    }
  };

  // Check Admin status on login change
  useEffect(() => {
    if (isLoggedIn) {
      checkIsAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn, backendUrl]);

  // Fetch followed accounts when user logs in/out or role changes
  useEffect(() => {
    getFollowedAccounts();
  }, [userData?.role, isLoggedIn, backendUrl]);

  // Handle outside clicks for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // User dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state
  if (loading) {
    return <Loading />;
  }

  const DesktopNavLinks = () => (
    <div className="hidden md:flex items-center gap-6">
      {USER_NAV_LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={`font-medium relative text-sm pb-2 transition-colors duration-200 ${location.pathname === to
            ? "font-bold text-[var(--primary-color)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary-color)]"
            : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
        >
          {label}
        </NavLink>
      ))}
    </div>
  );

  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 duration-300 ease-in-out md:hidden transition-all ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {isLoggedIn && userData ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userData.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{userData.name || "User"}</p>
                <p className="text-sm text-gray-500 capitalize">{userData.role || "Member"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <UserCircle size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Guest</p>
                <p className="text-sm text-gray-500">Not signed in</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-6 space-y-2">
          {USER_NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => handleLinkClick(to)}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === to
                ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}

          {isLoggedIn && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <NavLink
                to="/dashboard"
                onClick={() => handleLinkClick("/dashboard")}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === "/dashboard"
                  ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <UserCircle size={20} />
                <span className="font-medium">Dashboard</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => handleLinkClick("/admin")}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${location.pathname === "/admin"
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Gauge size={20} />
                  <span className="font-medium">Admin Panel</span>
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Bottom Action */}
        <div className="absolute bottom-6 left-6 right-6">
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="flex items-center justify-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => handleLinkClick("/login")}
              className="flex items-center justify-center gap-3 w-full p-3 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );

  const UserProfileDropdown = () => (
    <div
      ref={userDropdownRef}
      className="relative flex items-center gap-4"
    >
      <div className="relative flex items-center gap-4">
        {/* Pill UI */}
        <div
          className={`flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${userData?.isActive ? "bg-green-500" : "bg-red-500"} animate-pulse`}></span>
          <span className={`text-sm font-medium ${userData?.isActive ? "text-green-500" : "text-red-500"}`}>
            {userData?.isActive ?
              "Active" :
              "InActive"}
          </span>
        </div>

        {userData?.profileScore === 100 && userData?.reviewStatus === "underReview" ?
          <div
            className={`flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm`}
          >
            <span className={`w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse`}></span>
            <span className={`text-sm font-medium text-yellow-500`}>
              Under Review
            </span>
          </div> :
          null}

      </div>


      {/* Profile/Followed Accounts Button */}
      <div className="flex relative group items-center gap-3 cursor-pointer">
        <button
          className="h-9 w-9 text-white rounded-full bg-black overflow-hidden ring-2 ring-transparent hover:ring-[var(--primary-color)] transition-all duration-200 focus:outline-none"
          aria-label="User menu"
        >
          {userData?.profilePicture ? (
            <Img
              src={userData.profilePicture}
              style="w-full h-full object-cover"
            />

          ) : (
            <span className="text-lg font-semibold flex items-center justify-center h-full w-full">
              {userData?.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </button>
        <h4 className="hidden lg:block text-sm font-medium">
          {userData?.name ? userData?.name : userData?.role === "user" ? "Candidate" : "Employer"}
        </h4>


        {/* DROPDOWN */}
        <div
          className="
    absolute top-full right-0 z-50 mt-1 w-50
    rounded shadow-xl border border-gray-100 bg-white
    transition-all duration-500 ease-in-out
    opacity-0 translate-y-6 invisible
    group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible
  "
        >
          <ul className="space-y-1 px-6 py-3">
            {navLinks.map((item) => (
              <li key={item.key}>
                <span
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-4 px-4 w-40 py-1.5 rounded-3xl text-left transition-colors cursor-pointer text-gray-600 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]`}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {
        userData?.role === "employee" ?
          <NavLink
            to={"/dashboard/jobs/post"}
            onClick={() => setIsMenuOpen(false)}
          >
            <button className="primary-btn">
              Post a job
            </button>
          </NavLink>
          :
          <NavLink
            to={"/dashboard/profile"}
            onClick={() => setIsMenuOpen(false)}
          >
            <button className="primary-btn">
              Update Profile
            </button>
          </NavLink>

      }


      {/* Dropdown Menu */}

    </div>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-6">
      <NavLink
        to={"/login"}
        className="font-medium text-sm text-[var(--primary-color)] transition-colors duration-200"
        onClick={() => setIsMenuOpen(false)}
      >
        Login
      </NavLink>
      <NavLink
        to={"/employer-landing"}
        onClick={() => setIsMenuOpen(false)}
      >
        <button className="primary-btn">
          Post a job
        </button>
      </NavLink>
    </div>
  );

  // --- Main Render ---
  return (
    <div className={`w-full py-4 px-4 md:px-6 lg:px-8`}>

      <nav className={`w-full ${location.pathname.includes("dashboard") || location.pathname.includes("admin") ? "bg-white" : ""} py-3 relative z-999 ${className}`}>
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Desktop Links */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>

            <div className={`flex items-center gap-10`}>
              <NavLink to={"/"}>
                {/* The image styling should be outside the component if possible, or ensure it's responsive */}
                <Img src="/logo.webp" style={`${location.pathname.includes("dashboard") || location.pathname.includes("admin") ? "hidden" : ""} w-28 sm:w-32`} alt="Company Logo" />
              </NavLink>
              <DesktopNavLinks />
            </div>
          </div>

          <div className="md:hidden items-center gap-4" onClick={() => setIsSearchOpen(true)}>
            <FaSearch />
          </div>

          {/* Right Section - Auth/User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? <UserProfileDropdown /> : <AuthButtons />}
          </div>
        </div>

        {/* Mobile Sidebar Content */}
        <MobileSidebar />
      </nav>
    </div>
  );
};

export default Navbar;