// // components/AdminSidebar.jsx
// import { useContext, useState, useEffect } from "react";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Briefcase,
//   Building,
//   User,
//   Users2,
//   LogOut,
//   Menu,
//   X,
//   Blocks,
//   Package,
//   ChevronLeft,
//   ChevronRight,
//   Hammer,
//   Settings
// } from "lucide-react";
// import { MdAssistant, MdRequestPage } from "react-icons/md";
// import Img from "./Image";
// import { FaArrowLeft } from "react-icons/fa";

// const AdminSidebar = ({ activeTab }) => {
//   const { backendUrl, setIsLoggedIn, setUserData, isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const navigate = useNavigate();

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   // Close mobile sidebar when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isMobileOpen && !event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-btn')) {
//         setIsMobileOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isMobileOpen]);

//   // Modern navigation structure with routes
//   const navLinks = [
//     { name: "Analytics", key: "analytic-dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
//     { name: "Job Requests", key: "job-requests", icon: <Building size={20} />, path: "/admin/job-requests" },
//     { name: "Users", key: "users", icon: <User size={20} />, path: "/admin/users" },
//     { name: "Employers", key: "employers", icon: <Users2 size={20} />, path: "/admin/employers" },
//     // { name: "Employee Requests", key: "employee-profile-requests", icon: <MdRequestPage size={20} />, path: "/admin/employee-profile-requests" },
//     { name: "All Jobs", key: "jobs", icon: <Briefcase size={20} />, path: "/admin/jobs" },
//     { name: "Packages", key: "packages", icon: <Package size={20} />, path: "/admin/packages" },
//     {
//       name: "All Assistant", key: "all-assistant", icon: <MdAssistant size={20} />, path: "/admin/all-assistant",
//       subTabs: [
//         { name: "Add Assistant", key: "add-assistant", icon: <MdAssistant size={20} />, path: "/admin/add-assistant" },
//       ]
//     },
//     {
//       name: "Blogs", key: "blog-management", icon: <Blocks size={20} />, path: "/admin/blog-management", subTabs: [
//         { name: "Add Blog", key: "add-blog", icon: <Blocks size={20} />, path: "/admin/add-blog" },
//       ]
//     },
//     { name: "Settings", key: "settings", icon: <Settings size={20} />, path: "/admin/settings" },
//     { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
//   ];

//   const handleNavClick = (item) => {
//     if (item.key === "logout") {
//       logout();
//     } else {
//       navigate(item.path);
//     }
//     // Close mobile sidebar after navigation
//     setIsMobileOpen(false);
//   };

//   const handleMobile = () => {
//     setIsMobile(window.innerWidth < 768);
//   }

//   useEffect(() => {
//     window.addEventListener("resize", handleMobile);
//     return () => {
//       window.removeEventListener("resize", handleMobile);
//     };
//   }, []);

//   const logout = async () => {
//     try {
//       const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
//       if (data.success) {
//         setIsLoggedIn(false);
//         setUserData(false);
//         navigate("/");
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsMobileOpen(!isMobileOpen)}
//         className={`mobile-menu-btn fixed top-1/2 translate-y-1/2 z-9999 lg:hidden bg-[var(--primary-color)] text-white p-2 rounded-r-lg shadow-lg ${isMobileOpen ? 'left-64' : 'left-0'} transition-all duration-300 ease-in-out cursor-pointer`}
//       >
//         {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
//       </button>

//       {/* Mobile Overlay */}
//       {isMobileOpen && (
//         <div className="fixed inset-0 bg-black/70 z-9998 lg:hidden" />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         sidebar
//         ${isMobile ? 'w-72' : isSidebarOpen ? 'w-16' : 'w-64'}
//         bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300
//         fixed left-0 top-0 z-9999
//         ${isMobileOpen ? 'translate-x-0 absolute' : '-translate-x-full lg:translate-x-0'}
//       `}>
//         {/* Logo Section */}
//         <div className="flex items-center justify-between p-4">
//           <div className="flex items-center gap-3">
//             <Img src={'/logo.webp'} />
//           </div>

//           {/* Desktop collapse button */}
//           <span
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             className="cursor-pointer hidden lg:flex items-center justify-center p-2 rounded-lg transition-colors"
//           >
//             <FaArrowLeft className={`text-gray-600 hover:text-[var(--primary-color)] transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
//           </span>

//           {/* Mobile close button */}
//           <button
//             onClick={() => setIsMobileOpen(false)}
//             className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X size={20} className="text-gray-600" />
//           </button>
//         </div>

//         {/* Navigation Links */}
//         <nav className={`overflow-y-auto ${isSidebarOpen ? 'flex-1 px-2' : 'flex-1 px-7'} py-4`}>
//           <ul className="space-y-1">
//             {navLinks.map((item) => (
//               <li key={item.key} className="relative group">
//                 <span
//                   onClick={() => handleNavClick(item)}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl text-left transition-colors cursor-pointer ${activeTab === item.key
//                     ? 'bg-[var(--accent-color)] text-[var(--primary-color)]'
//                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }`}
//                 >
//                   <span className="flex-shrink-0">
//                     {item.icon}
//                   </span>
//                   {!isSidebarOpen && (
//                     <div className="w-full font-medium flex items-center justify-between">{item.name} {item.subTabs && <ChevronRight />}</div>
//                   )}
//                 </span>

//                 {/* Floating Sub-tabs */}
//                 {item.subTabs && (
//                   <div className="absolute left-full top-0 pl-2 w-56 hidden group-hover:block z-50">
//                     <div className="bg-white rounded-lg border border-gray-100 overflow-hidden p-2">
//                       {item.subTabs.map((subItem) => (
//                         <div
//                           key={subItem.key}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleNavClick(subItem);
//                           }}
//                           className={`flex items-center gap-3 px-3 py-2.5 rounded-3xl cursor-pointer transition-colors mb-1 last:mb-0
//                             ${activeTab === subItem.key ? 'bg-[var(--accent-color)] text-[var(--primary-color)]' : 'text-gray-600 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]'}
//                           `}
//                         >
//                           <span className="flex-shrink-0 scale-90">
//                             {subItem.icon}
//                           </span>
//                           <span className="font-medium text-sm">{subItem.name}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>
//     </>
//   );
// };

// export default AdminSidebar;


// components/AdminSidebar.jsx
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Building,
  User,
  Users2,
  LogOut,
  Menu,
  X,
  Blocks,
  Package,
  ChevronRight,
  Settings
} from "lucide-react";
import { MdAssistant } from "react-icons/md";
import Img from "./Image";
import { FaArrowLeft } from "react-icons/fa";

const AdminSidebar = ({ activeTab }) => {
  const { backendUrl, setIsLoggedIn, setUserData, isSidebarOpen, setIsSidebarOpen } =
    useContext(AppContext);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".mobile-menu-btn")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  const handleMobile = () => setIsMobile(window.innerWidth < 768);

  useEffect(() => {
    window.addEventListener("resize", handleMobile);
    return () => window.removeEventListener("resize", handleMobile);
  }, []);

  const navLinks = [
    { name: "Analytics", key: "analytic-dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { name: "Job Requests", key: "job-requests", icon: <Building size={20} />, path: "/admin/job-requests" },
    { name: "Users", key: "users", icon: <User size={20} />, path: "/admin/users" },
    { name: "Employers", key: "employers", icon: <Users2 size={20} />, path: "/admin/employers" },
    { name: "All Jobs", key: "jobs", icon: <Briefcase size={20} />, path: "/admin/jobs" },
    {
      name: "Packages", key: "packages", icon: <Package size={20} />, path: "/admin/packages/employee", subTabs: [
        { name: "Employee", key: "employee-packages", icon: <Package size={20} />, path: "/admin/packages/employee" },
        { name: "Job Seeker", key: "job-seeker-packages", icon: <Package size={20} />, path: "/admin/packages/job-seeker" },
      ]
    },
    { name: "All Assistant", key: "all-assistant", icon: <MdAssistant size={20} />, path: "/admin/all-assistant" },
    { name: "Blogs", key: "blog-management", icon: <Blocks size={20} />, path: "/admin/blog-management" },
    { name: "Settings", key: "settings", icon: <Settings size={20} />, path: "/admin/settings" },
    { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
  ];

  const handleNavClick = (item) => {
    if (item.key === "logout") {
      logout();
    } else {
      navigate(item.path);
    }
    setIsMobileOpen(false);
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(false);
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`mobile-menu-btn fixed top-1/2 translate-y-1/2 z-9999 lg:hidden bg-[var(--primary-color)] text-white p-2 rounded-r-lg shadow-lg ${isMobileOpen ? "left-72" : "left-0"
          } transition-all duration-300 ease-in-out cursor-pointer`}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/70 z-9998 lg:hidden" />}

      {/* Sidebar */}
      <div
        className={`
        sidebar
        ${isMobile ? "w-72" : isSidebarOpen ? "w-16" : "w-64"}
        bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300
        fixed left-0 top-0 z-9999
        ${isMobileOpen ? "translate-x-0 absolute" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4">
          <Img src={"/logo.webp"} style={!isSidebarOpen ? "w-45" : "hidden"} />

          <span
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="cursor-pointer hidden lg:flex items-center justify-center p-2 rounded-lg"
          >
            <FaArrowLeft
              className={`text-gray-600 transition-transform ${isSidebarOpen ? "rotate-180" : ""
                }`}
            />
          </span>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`${isSidebarOpen ? "flex-1 px-2" : "flex-1 px-7"} py-4`}>
          <ul className="space-y-1">
            {navLinks.map((item) => (
              <li key={item.key} className="relative group">
                <span
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl cursor-pointer transition-colors ${activeTab === item.key
                      ? "bg-[var(--accent-color)] text-[var(--primary-color)]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {item.icon}
                  {!isSidebarOpen && (
                    <div className="w-full font-medium flex items-center justify-between">
                      {item.name} {item.subTabs && <ChevronRight size={16} />}
                    </div>
                  )}
                </span>

                {item.subTabs && (
                  <div className="absolute left-full top-0 pl-2 w-56 hidden group-hover:block z-50">
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden p-2">
                      {item.subTabs.map((subItem) => (
                        <div
                          key={subItem.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavClick(subItem);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-3xl cursor-pointer transition-colors mb-1 last:mb-0
                            ${activeTab === subItem.key ? 'bg-[var(--accent-color)] text-[var(--primary-color)]' : 'text-gray-600 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]'}
                          `}
                        >
                          <span className="flex-shrink-0 scale-90">
                            {subItem.icon}
                          </span>
                          <span className="font-medium text-sm">{subItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
