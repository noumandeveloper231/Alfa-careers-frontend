import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminJobsComponent = React.lazy(() => import("../../components/AdminJobs"));

const AdminJobs = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminJobsComponent />
    </Suspense>
  );
};

export default AdminJobs;
