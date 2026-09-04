import React, { Suspense } from "react";
import Loading from "../../components/Loading";

const AdminListedBlogsComponent = React.lazy(() => import("../../components/AdminListedBlogs"));

const AdminBlogManagement = () => {
  return (
    <Suspense fallback={<Loading />}>
      <AdminListedBlogsComponent />
    </Suspense>
  );
};

export default AdminBlogManagement;
