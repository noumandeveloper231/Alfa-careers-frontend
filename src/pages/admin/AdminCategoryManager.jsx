import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const CategoryManagerComponent = React.lazy(() => import("../../components/CategoryManager"));

const AdminCategoryManager = () => {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryManagerComponent />
    </Suspense>
  );
};

export default AdminCategoryManager;
