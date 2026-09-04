import React, { Suspense } from "react";
import Loading from "../../../components/Loading";

import JobForm from "../../../components/JobsForm";

const PostJobPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <JobForm />
    </Suspense>
  );
};

export default PostJobPage;
