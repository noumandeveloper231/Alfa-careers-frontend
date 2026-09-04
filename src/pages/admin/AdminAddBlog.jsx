import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminBlogComponent = React.lazy(() => import("../../components/AdminBlog"));

const AdminAddBlog = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminBlogComponent />
    </Suspense>
  );
};

export default AdminAddBlog;
