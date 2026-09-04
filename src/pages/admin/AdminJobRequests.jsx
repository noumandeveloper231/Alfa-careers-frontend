import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminJobRequestsComponent = React.lazy(() => import("../../components/AdminJobRequests"));

const AdminJobRequests = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminJobRequestsComponent />
    </Suspense>
  );
};

export default AdminJobRequests;
