import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import FooterBottom from "./FooterBottom";

const AdminDashboardLayout = () => {
  const { userData, isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Auto scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Extract active tab from current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") {
      return "analytic-dashboard";
    }
    // Extract the last segment of the path
    const segments = path.split("/");
    return segments[segments.length - 1] || "analytic-dashboard";
  };

  const activeTab = getActiveTabFromPath();

  const handleMobile = () => {
    setIsMobile(window.innerWidth < 768);
  }

  useEffect(() => {
    window.addEventListener("resize", handleMobile);
    return () => {
      window.removeEventListener("resize", handleMobile);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} />
      <div className={`flex-1 transition-all duration-300 ${isMobile ? "ml-0" : isSidebarOpen ? "ml-8" : "ml-64"}`}>
        <Navbar className={isSidebarOpen && "ml-8"} />
        <main className="p-2 md:p-4 lg:p-6">
          <Outlet />
        </main>
        <FooterBottom />
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
