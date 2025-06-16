import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const roleTabs = {
  secretaria: [
    { to: "/dashboard/secretaria", label: "Dashboard" },
    { to: "/secretaria/ReportsPage", label: "Manage Reports" },
    { to: "/secretaria/victims", label: "Manage Victims" },
    { to: "/secretaria/manage-cases", label: "Manage Cases" },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Admin Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/cases", label: " Show Cases" },
    { to: "/admin/victims", label: "Manage Victims" },
  
    { to: "/admin/AdminReportsPage", label: "Admin Reports" },
  ],
  organization: [
    { to: "/dashboard/organization", label: "Dashboard" },
    { to: "/organization/reports", label: "Submit Report" },
  ],
  user: [{ to: "/dashboard", label: "My Dashboard" }],
};

function Sidebar({ role = "user" }) {
  const tabs = roleTabs[role] || [];

  return (
    <div className="sidebar flex flex-col">
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
