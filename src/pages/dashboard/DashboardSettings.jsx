import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const Settings = React.lazy(() => import("../../components/Settings"));

const DashboardSettings = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  );
};

export default DashboardSettings;
