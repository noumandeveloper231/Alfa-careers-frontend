import { Link, useLocation } from "react-router-dom";
import { getCategoryName } from "../utils/categoryNames";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  // Parse query params
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category"); // e.g., 'shoes'

  return (
    <nav className="text-[#999999] mb-4">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-black text-[#999999]">Home</Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1 && !category; // last if no query

          return (
            <li key={routeTo} className="flex items-center gap-2">
              <span>›</span>
              {isLast ? (
                <span className="font-medium text-gray-700">
                  {getCategoryName(segment)}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-black text-[#999999]"
                >
                  {getCategoryName(segment)}
                </Link>
              )}
            </li>
          );
        })}

        {category && (
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-medium text-gray-700">
              {getCategoryName(category)}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
