import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AddAssistantComponent = React.lazy(() => import("../../components/AddAssistant"));

const AdminAddAssistant = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AddAssistantComponent />
    </Suspense>
  );
};

export default AdminAddAssistant;
