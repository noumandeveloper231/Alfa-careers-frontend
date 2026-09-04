// // components/Sidebar.jsx
// import { useContext, useState, useEffect } from "react";
// import { AppContext } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Briefcase,
//   Users,
//   UserCheck,
//   Heart,
//   MessageSquare,
//   Calendar,
//   Building2,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   FileText,
//   User,
//   ChevronRight,
//   Plus
// } from "lucide-react";
// import Img from "./Image";
// import { FaArrowLeft } from "react-icons/fa";

// const Sidebar = ({ activeTab }) => {
//   const { backendUrl, setIsLoggedIn, setUserData, isSidebarOpen, setIsSidebarOpen, userData } = useContext(AppContext);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const navigate = useNavigate();

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

//   let navLinks;
//   // Modern navigation structure with routes
//   if (userData.role === "employee") {
//     navLinks = [
//       { name: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
//       {
//         name: "Jobs", key: "jobs", icon: <Briefcase size={20} />, path: "/dashboard/jobs",
//         subTabs: [
//           { name: "Post a Job", key: "post-job", icon: <Briefcase size={20} />, path: "/dashboard/jobs/post" },
//         ]
//       },
//       { name: "Applicants", key: "applicants", icon: <Users size={20} />, path: "/dashboard/applicants" },
//       { name: "Candidates", key: "candidates", icon: <UserCheck size={20} />, path: "/dashboard/candidates" },
//       { name: "Package", key: "package", icon: <Heart size={20} />, path: "/dashboard/package" },
//       { name: "Messages", key: "messages", icon: <MessageSquare size={20} />, path: "/dashboard/messages" },
//       { name: "Meetings", key: "meetings", icon: <Calendar size={20} />, path: "/dashboard/meetings" },
//       { name: "Company", key: "company", icon: <Building2 size={20} />, path: "/dashboard/company" },
//       { name: "Settings", key: "settings", icon: <Settings size={20} />, path: "/dashboard/settings" },
//       { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
//     ];
//   } else {
//     navLinks = [
//       { name: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
//       { name: "Profile", key: "profile", icon: <User size={20} />, path: "/dashboard/profile" },
//       { name: "My Resume", key: "resume", icon: <FileText size={20} />, path: "/dashboard/resume" },
//       { name: "My Jobs", key: "my-jobs", icon: <Briefcase size={20} />, path: "/dashboard/my-jobs" },
//       { name: "My Following", key: "my-following", icon: <Briefcase size={20} />, path: "/dashboard/my-following" },
//       { name: "Setting", key: "setting", icon: <Settings size={20} />, path: "/dashboard/settings" },
//       { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
//     ]
//   }



//   const handleNavClick = (item) => {
//     if (item.key === "logout") {
//       logout();
//     } else {
//       navigate(item.path);
//     }
//     // Close mobile sidebar after navigation
//     setIsMobileOpen(false);
//   };

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
//     <div className="overflow-auto">
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
//         ${isSidebarOpen ? 'w-16' : 'w-64'}
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
//         <nav className={`overflow-y-auto overflow-x- ${isSidebarOpen ? 'flex-1 px-2' : 'flex-1 px-7'} py-4`}>
//           <ul className="space-y-1">
//             {navLinks.map((item) => (
//               <li key={item.key} className="relative group">
//                 <span
//                   onClick={() => handleNavClick(item)}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl text-left transition-colors cursor-pointer
//             ${activeTab === item.key
//                       ? 'bg-[var(--accent-color)] text-[var(--primary-color)]'
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }`}
//                 >
//                   <span className="flex-shrink-0">
//                     {item.icon}
//                   </span>
//                   {!isSidebarOpen &&
//                     <div className="w-full font-medium flex items-center justify-between">{item.name} {item.subTabs && <ChevronRight />}</div>
//                   }
//                 </span>

//                 {/* Render children as absolute dropdown */}
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
//           {
//             userData?.role === "employee" ? (
//               <div className="mt-5 flex flex-col items-center gap-2 text-center bg-[var(--accent-color)] rounded-2xl p-3 border border-[var(--primary-color)]/10">
//                 <h4 className="text-md font-semibold">
//                   Post Your First Job!
//                 </h4>
//                 <p className="text-md">
//                   Your first 2 job postings for just $50 each.
//                 </p>
//                 <button onClick={() => navigate("/dashboard/jobs/post")} className="primary-btn flex items-center gap-2 whitespace-nowrap">
//                   <Plus className="text-white" size={20} /> Post a job
//                 </button>
//               </div>
//             ) :
//               <div className="mt-5 pl-3 text-black">
//                 <div className="flex items-center gap-2">
//                   Profile Strength: <span className="font-medium text-[var(--primary-color)]">{userData?.profileScore}%</span>
//                 </div>
//                 <div className="relative w-full h-1.5 bg-gray-300 rounded-2xl mt-2">
//                   <div
//                     className="h-full absolute top-0 left-0 rounded-2xl"
//                     style={{
//                       width: `${userData?.profileScore}%`,
//                       backgroundColor: 'var(--primary-color)',
//                     }}
//                   />
//                 </div>
//               </div>

//           }
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// components/Sidebar.jsx
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  Calendar,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  User,
  Package,
} from "lucide-react";
import Img from "./Image";
import { FaArrowLeft } from "react-icons/fa";

const Sidebar = ({ activeTab }) => {
  const { backendUrl, setIsLoggedIn, setUserData, isSidebarOpen, setIsSidebarOpen, userData } =
    useContext(AppContext);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
      { name: "My Following", key: "my-following", icon: <Briefcase size={20} />, path: "/dashboard/my-following" },
      { name: "Package", key: "package", icon: <Package size={20} />, path: "/dashboard/package" },
      { name: "Settings", key: "settings", icon: <Settings size={20} />, path: "/dashboard/settings" },
      { name: "Logout", key: "logout", icon: <LogOut size={20} /> },
    ];
  }

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
    <div className="overflow-auto">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`mobile-menu-btn fixed top-1/2 translate-y-1/2 z-9999 lg:hidden bg-[var(--primary-color)] text-white p-2 rounded-r-lg shadow-lg ${isMobileOpen ? "left-64" : "left-0"
          } transition-all duration-300 ease-in-out cursor-pointer`}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMobileOpen && <div className="fixed inset-0 bg-black/70 z-9998 lg:hidden" />}

      <div
        className={`
        sidebar
        ${isSidebarOpen ? "w-16" : "w-64"}
        bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300
        fixed left-0 top-0 z-9999
        ${isMobileOpen ? "translate-x-0 absolute" : "-translate-x-full lg:translate-x-0"}
      `}
      >
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

        <nav className={`${isSidebarOpen ? "flex-1 px-2" : "flex-1 px-7"} py-4`}>
          <ul className="space-y-1">
            {navLinks.map((item) => (
              <li key={item.key}>
                <span
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl cursor-pointer transition-colors
                    ${activeTab === item.key
                      ? "bg-[var(--accent-color)] text-[var(--primary-color)]"
                      : `text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${item.key === "logout" ? "hover:text-red-500" : ""}`
                    }`}
                >
                  {item.icon}
                  {!isSidebarOpen && <div className="font-medium">{item.name}</div>}
                </span>
              </li>
            ))}
          </ul>

          {
            !isSidebarOpen &&
            userData?.role !== "employee" && (
              <div className="mt-5 pl-3 text-black">
                <div className="flex items-center gap-2">
                  Profile Strength:{" "}
                  <span className="font-medium text-[var(--primary-color)]">
                    {userData?.profileScore}%
                  </span>
                </div>
                <div className="relative w-full h-1.5 bg-gray-300 rounded-2xl mt-2">
                  <div
                    className="absolute top-0 left-0 h-full rounded-2xl"
                    style={{
                      width: `${userData?.profileScore}%`,
                      backgroundColor: "var(--primary-color)",
                    }}
                  />
                </div>
              </div>
            )
          }
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
