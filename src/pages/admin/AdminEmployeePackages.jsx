import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminEmployeePackages = React.lazy(() => import("../../components/AdminPackages"));

const AdminEmployeePackagesPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminEmployeePackages />
    </Suspense>
  );
};

export default AdminEmployeePackagesPage;
