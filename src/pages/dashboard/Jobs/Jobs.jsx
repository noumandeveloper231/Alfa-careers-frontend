import React, { Suspense } from "react";
import Loading from "../../../components/Loading";

const EmployeeJobs = React.lazy(() => import("../../../components/EmployeeJobs"));

const ManageJobs = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EmployeeJobs />
    </Suspense>
  );
};

export default ManageJobs;
