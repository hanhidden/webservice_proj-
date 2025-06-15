//import React from "react";
// import Sidebar from "../../components/organization_dashboard/org_sidebar";
// import Header from "../../components/organization_dashboard/org_header";

/*import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";

function OrganizationDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.role || "User"}!
          </h1>
          <p>Select a tab from the sidebar to manage the system.</p>
        </main>
      </div>
    </>
  );
}

export default OrganizationDashboard;*/

import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";

function OrganizationDashboard() {
  
  
  const { user } = useAuth();
  const orgId = user?.user_id; 
  

  const [statusCounts, setStatusCounts] = useState({});
  const [violationCounts, setViolationCounts] = useState([]);
  const [locationCounts, setLocationCounts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  

  // Fetch status counts
  const fetchStatusCounts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/incident_report/organization/${orgId}/count-by-status`);
      if (!res.ok) throw new Error("Error fetching status counts");
      setStatusCounts(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };
  
  

  const fetchViolationCounts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/incident_report/organization/${orgId}/violation-types`);
      if (!res.ok) throw new Error("Error fetching violation counts");
      setViolationCounts(await res.json());
    } catch (err) {
      console.error("Violation aggregation error", err);
    }
  };
  
  const fetchLocationCounts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/incident_report/organization/${orgId}/locations`);
      if (!res.ok) throw new Error("Error fetching location counts");
      setLocationCounts(await res.json());
    } catch (err) {
      console.error("Location aggregation error", err);
    }
  };
  
  // Aggregation endpoints for violation types & location counts
  
  useEffect(() => {
    if (!orgId) return;
    fetchStatusCounts();
    fetchViolationCounts();
    fetchLocationCounts();
    setLoading(false);
  }, [orgId]);
  
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading…</div>;
  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role="organization" />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          <h1 className="text-3xl font-bold text-[#2a4c80] mb-6">Organization Dashboard</h1>

          {/* Status Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {["new","pending","turned-into-case"].map(s =>
              <div key={s} className="bg-[#e9e7e3] p-4 rounded-lg shadow-md border border-[#beb5aa]">
                <h3 className="text-sm text-[#132333] mb-2 capitalize">{s.replace(/_/g," ")}</h3>
                <p className="text-2xl font-bold text-[#2a4c80]">{statusCounts[s] ?? 0}</p>
              </div>
            )}
          </section>

          {/* Violation-type Cards */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#2a4c80] mb-4">Cases by Violation Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {violationCounts.map(({ name, count }) => (
                <div key={name} className="rounded-lg border border-[#2a4c80] overflow-hidden shadow-md">
                  <div className="bg-[#2a4c80] text-white text-center py-2 font-semibold">{name}</div>
                  <div className="bg-white text-[#2a4c80] text-center py-4 font-bold">Count: {count}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Location Cards */}
          <section>
            <h2 className="text-xl font-semibold text-[#2a4c80] mb-4">Cases by Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locationCounts.map(({ name, count }) => (
  <div key={JSON.stringify(name)} className="...">
    <div className="...">
      {/* stringify or access subfields */}
      {typeof name === "object" 
        ? `${name.city || ""}, ${name.country || ""}` 
        : name}
    </div>
    <div className="...">Count: {count}</div>
  </div>
))}

            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default OrganizationDashboard;

