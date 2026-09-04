import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const EmployeeProfileRequestsComponent = React.lazy(() => import("../../components/EmployeeProfileRequests"));

const AdminEmployeeProfileRequests = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EmployeeProfileRequestsComponent />
    </Suspense>
  );
};

export default AdminEmployeeProfileRequests;
