import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminJobSeekerPackages = React.lazy(() => import("../../components/AdminJobSeekerPackages"));

const AdminJobSeekerPackagesPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminJobSeekerPackages />
    </Suspense>
  );
};

export default AdminJobSeekerPackagesPage;
