import React, { Suspense, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

// Lazy load the dashboard components
const ApplicantDashboard = React.lazy(() => import("../../components/ApplicantDashboard"));
const EmployeeDashboard = React.lazy(() => import("../../components/EmployeeDashboard"));

const DashboardHome = () => {
  const { userData } = useContext(AppContext);

  const DashboardComponent = userData?.role === "user" ? ApplicantDashboard : EmployeeDashboard;

  return (
    <Suspense fallback={<Loading />}>
      <DashboardComponent />
    </Suspense>
  );
};

export default DashboardHome;
