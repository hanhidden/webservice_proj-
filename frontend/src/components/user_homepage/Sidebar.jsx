import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";


//  {/* New Link to Victim/Witness List */}
//           <Link
//             to="/victims"
//             className="flex items-center space-x-2 hover:bg-[#0d1b2a] hover:text-white px-3 py-2 rounded-md transition-colors"
//           >
//             <IoPersonOutline size={20} />
//             <span>Victim/Witness List</span>
//           </Link>
const roleTabs = {
  secretaria: [
    { to: "/dashboard/secretaria", label: "Dashboard" },
    { to: "/secretaria/reports", label: "Manage Reports" },
    { to: "/secretaria/victims", label: "Manage Victims" },
    { to: "/secretaria/cases", label: "Manage Cases" },
    { to: "/secretaria/analysis", label: "Analysis & Visualization" },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Admin Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/settings", label: "Settings" },
  ],
  organization: [
    { to: "/dashboard/organization", label: "Dashboard" },
    { to: "/organization/cases", label: "My Cases" },
  ],
  user: [{ to: "/dashboard", label: "My Dashboard" }],
};

function Sidebar({ role = "user" }) {
  const tabs = roleTabs[role] || [];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </h2>
      <nav>
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="sidebar-link">
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
