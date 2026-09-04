import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const CandidatesComponent = React.lazy(() => import("../../components/Candidates"));

const Candidates = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CandidatesComponent />
    </Suspense>
  );
};

export default Candidates;
