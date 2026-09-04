import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const CompanyProfileComponent = React.lazy(() => import("../../components/EmployeeProfile"));

const CompanyProfile = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CompanyProfileComponent />
    </Suspense>
  );
};

export default CompanyProfile;
