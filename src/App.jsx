import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useContext, useEffect, useState, lazy } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

import { AppContext } from "./context/AppContext";
import Loading from "./components/Loading";
import CompanyProfile from "./pages/CompanyProfile";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboardLayout from "./components/AdminDashboardLayout";
import CandidateProfile from "./pages/CandidateProfile";
import NotFoundPage from "./pages/NotFoundPage";
import EmployerLanding from "./pages/EmployerLanding";
import Blogs from "./pages/Blogs";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import ManageJobs from "./pages/dashboard/Jobs/Jobs";
import PostJobPage from "./pages/dashboard/Jobs/PostJob";
import JobSeekerFollowing from "./components/JobSeekerFollowing";
import AdminSettings from "./components/AdminSettings";
import PrivacyPolicy from "./pages/Privacy-Policy";


// Lazy-loaded components
const Footer = lazy(() => import("./components/Footer"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

const Home = lazy(() => import("./pages/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const FindJobs = lazy(() => import("./pages/FindJobs"));
const CategoryJobs = lazy(() => import("./pages/CategoryJobs"));
const BlogsDetails = lazy(() => import("./pages/BlogsDetails"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const Categories = lazy(() => import("./pages/Categories"));
const CandidatesPage = lazy(() => import("./pages/Candidates"));
const CompaniesPage = lazy(() => import("./pages/Companies"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Dashboard pages
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Applicants = lazy(() => import("./pages/dashboard/Applicants"));
const Candidates = lazy(() => import("./pages/dashboard/Candidates"));
const Package = lazy(() => import("./pages/dashboard/Package"));
const Messages = lazy(() => import("./pages/dashboard/Messages"));
const Meetings = lazy(() => import("./pages/dashboard/Meetings"));
const Company = lazy(() => import("./pages/dashboard/Company"));
const DashboardSettings = lazy(() => import("./pages/dashboard/DashboardSettings"));
const MyProfile = lazy(() => import("./components/MyProfile"));
const MyResume = lazy(() => import("./components/MyResume"));
const MyJobs = lazy(() => import("./components/MyJobs"));

// Admin dashboard pages
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminJobRequests = lazy(() => import("./pages/admin/AdminJobRequests"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEmployees = lazy(() => import("./pages/admin/AdminEmployees"));
const AdminEmployeeProfileRequests = lazy(() => import("./pages/admin/AdminEmployeeProfileRequests"));
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs"));
const AdminAddAssistant = lazy(() => import("./pages/admin/AdminAddAssistant"));
const AdminAllAssistants = lazy(() => import("./pages/admin/AdminAllAssistants"));
const AdminBlogManagement = lazy(() => import("./pages/admin/AdminBlogManagement"));
const AdminAddBlog = lazy(() => import("./pages/admin/AdminAddBlog"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));
const AdminEmployeePackages = lazy(() => import("./pages/admin/AdminEmployeePackages"));
const AdminJobSeekerPackages = lazy(() => import("./pages/admin/AdminJobSeekerPackages"));

// 🔒 Admin-only route
export const AdminRoute = ({ children }) => {
  const { backendUrl, isLoggedIn } = useContext(AppContext);
  const [isAdmin, setIsAdmin] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (unauthorized) {
      toast.error("You are not authorized to access this page");
      setUnauthorized(false);
    }
  }, [unauthorized]);

  useEffect(() => {
    if (isLoggedIn) {
      const checkAdmin = async () => {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/auth/check-admin`,
            { withCredentials: true }
          );
          setIsAdmin(data.isAdmin);
        } catch (err) {
          setIsAdmin(false);
        }
      };
      checkAdmin();
    }
  }, [isLoggedIn, backendUrl]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === null) {
    return <Loading />;
  }

  if (isAdmin) {
    return children;
  } else {
    if (!unauthorized) setUnauthorized(true);
    return <Navigate to="/dashboard" replace />;
  }
};

// 🔐 Protected route
export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AppContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🌍 Main App
const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const { userData, isLoggedIn, loading, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isLoggedIn && userData && !userData.isOnboardingCompleted) {
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [loading, isLoggedIn, userData, location, navigate]);

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/categories`).then(({ data }) => {
      if (data.success) {
        localStorage.setItem('job_categories_cache', JSON.stringify(Object.fromEntries(data.categories.map(c => [c.slug, c.name]))))
      }
    }).catch(() => {})
  }, [backendUrl])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (

    <div className="flex flex-col min-h-screen">
      <Toaster
        position="top-right"
        theme="light"
        richColors
        closeButton
      />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/post" element={<PostJobPage />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="package" element={<Package />} />
            <Route path="messages" element={<Messages />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="company" element={<Company />} />
            <Route path="settings" element={<DashboardSettings />} />

            {/* User Dashboard Routes */}
            <Route path="profile" element={<MyProfile />} />
            <Route path="resume" element={<MyResume />} />
            <Route path="my-jobs" element={<MyJobs />} />
            <Route path="my-following" element={<JobSeekerFollowing />} />
          </Route>
          <Route path="/jobs/:cat/:slug" element={<JobDetails />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminAnalytics />} />
            <Route path="job-requests" element={<AdminJobRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="employers" element={<AdminEmployees />} />
            <Route path="employee-profile-requests" element={<AdminEmployeeProfileRequests />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="packages">
              <Route path="employee" element={<AdminEmployeePackages />} />
              <Route path="job-seeker" element={<AdminJobSeekerPackages />} />
            </Route>
            <Route path="settings" element={<AdminSettings />} />
            <Route path="add-assistant" element={<AdminAddAssistant />} />
            <Route path="all-assistant" element={<AdminAllAssistants />} />
            <Route path="blog-management" element={<AdminBlogManagement />} />
            <Route path="blog/add" element={<AdminAddBlog />} />
          </Route>
          <Route
            path="/editblog"
            element={
              <AdminRoute>
                <EditBlog />
              </AdminRoute>
            }
          />

          <Route path="/companies/:cat/:slug" element={<CompanyProfile />} />
          <Route path="/candidates/:cat/:slug" element={<CandidateProfile />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/jobs" element={<FindJobs />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:cat" element={<CategoryJobs />} />
          <Route path="/blogs/:slug" element={<BlogsDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/employer-landing" element={<EmployerLanding />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </div>
      {location.pathname !== '/onboarding' && <Footer />}
    </div>
  );
};

export default App;