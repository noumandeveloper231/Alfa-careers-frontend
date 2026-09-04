import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminUsersComponent = React.lazy(() => import("../../components/AdminUsers"));

const AdminUsers = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminUsersComponent />
    </Suspense>
  );
};

export default AdminUsers;
