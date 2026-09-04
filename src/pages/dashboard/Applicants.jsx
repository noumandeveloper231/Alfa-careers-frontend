import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const Applications = React.lazy(() => import("../../components/Applications"));

const Applicants = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Applications />
    </Suspense>
  );
};

export default Applicants;
