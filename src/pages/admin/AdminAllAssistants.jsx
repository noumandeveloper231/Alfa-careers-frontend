import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminAssistantsComponent = React.lazy(() => import("../../components/AdminAssistants"));

const AdminAllAssistants = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminAssistantsComponent />
    </Suspense>
  );
};

export default AdminAllAssistants;
