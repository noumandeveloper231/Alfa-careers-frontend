import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminEmployeesComponent = React.lazy(() => import("../../components/AdminEmployees"));

const AdminEmployees = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminEmployeesComponent />
    </Suspense>
  );
};

export default AdminEmployees;
