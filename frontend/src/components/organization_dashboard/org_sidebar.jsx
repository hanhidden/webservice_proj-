// // src/components/org_sidebar.jsx

import { Link } from "react-router-dom";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";  // added IoPersonOutline for person icon
import { ImStatsDots } from "react-icons/im";
import { TbReportSearch } from "react-icons/tb";
import { AiOutlineHome } from "react-icons/ai";


export default function OrgSidebar() {
  return (
    <aside className="w-64 bg-[#c0b7a6] text-[#1f2937] h-screen p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Navigation</h2>
      <ul className="space-y-4">
        <li>
            <Link
            to="/dashboard/organization"
            className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <AiOutlineHome   size={24} />
            <span>Home</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <TbReportSearch size={24} />
            <span>Reports</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <ImStatsDots size={18} />

            <span>Stats</span>
          </Link>

           <Link
            to="/victims/new"
            className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <IoDocumentTextOutline size={20} />
            <span>New Victim/Witness</span>
          </Link>

            {/* New Link to Victim/Witness List */}
          <Link
            to="/victims"
            className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
          >
            <IoPersonOutline size={20} />
            <span>Victim/Witness List</span>
          </Link>
        </li>
        {/* Add more links here as needed */}
      </ul>
    </aside>
  );
}
