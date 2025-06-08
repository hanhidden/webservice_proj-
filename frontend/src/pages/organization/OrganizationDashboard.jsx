import React from "react";
import Sidebar from "../../components/organization_dashboard/org_sidebar";
import Header from "../../components/organization_dashboard/org_header";

function OrganizationDashboard() {
  return (
    <>
      <Header/>
      <div className="flex h-screen">
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Main content on the right */}
        <div className="flex-1 flex items-center justify-center bg-[#f7f5f1]">
          <h1 className="text-4xl font-bold">Hi, I'm Organization</h1>
        </div>
      </div>
    </>
  );
}

export default OrganizationDashboard;
