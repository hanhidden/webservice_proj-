// // src/components/org_sidebar.jsx

import { Link } from "react-router-dom";
import { IoDocumentTextOutline } from "react-icons/io5";
import { ImStatsDots } from "react-icons/im";
import { TbReportSearch } from "react-icons/tb";

export default function OrgSidebar() {
  return (
    <aside className="w-64 bg-[#c0b7a6] text-[#1f2937] h-screen p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Navigation</h2>
      <ul className="space-y-4">
        <li>
          <Link
            to="#"
            className="flex items-center space-x-2 hover:bg-[#fbbe247a] px-3 py-2 rounded-md transition-colors"
          >
            <TbReportSearch size={24} />
            <span>Reports</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 hover:bg-[#fbbe247a] px-3 py-2 rounded-md transition-colors"
          >
            <ImStatsDots size={18} />

            <span>Stats</span>
          </Link>

           <Link
            to="/victims/new"
            className="flex items-center space-x-2 hover:bg-yellow-400 px-3 py-2 rounded-md transition-colors"
          >
            <IoDocumentTextOutline size={20} />
            <span>New Victim/Witness</span>
          </Link>
        </li>
        {/* Add more links here as needed */}
      </ul>
    </aside>
  );
}
