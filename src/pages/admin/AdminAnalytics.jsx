import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AnalyticDashboard = React.lazy(() => import("../../components/AnalyticDashboard"));

const AdminAnalytics = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AnalyticDashboard />
    </Suspense>
  );
};

export default AdminAnalytics;
