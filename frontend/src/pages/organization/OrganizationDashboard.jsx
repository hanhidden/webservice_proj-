import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import Loader from "../../components/All/Loader";

function OrganizationDashboard() {
  const { user } = useAuth();
  const orgId = user?.user_id;

  const [statusCounts, setStatusCounts] = useState({});
  const [violationCounts, setViolationCounts] = useState([]);
  const [locationCounts, setLocationCounts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const fetchStatusCounts = async () => {
    const res = await fetch(
      `http://localhost:8000/api/incident_reports/organization/${orgId}/count-by-status`
    );
    if (!res.ok) throw new Error("Error fetching status counts");
    const data = await res.json();
    setStatusCounts(data);
  };

  const fetchViolationCounts = async () => {
    const res = await fetch(
      `http://localhost:8000/api/incident_reports/organization/${orgId}/violation-types`
    );
    if (!res.ok) throw new Error("Error fetching violation counts");
    const data = await res.json();
    setViolationCounts(data);
  };

  const fetchLocationCounts = async () => {
    const res = await fetch(
      `http://localhost:8000/api/incident_reports/organization/${orgId}/locations`
    );
    if (!res.ok) throw new Error("Error fetching location counts");
    const data = await res.json();
    setLocationCounts(data);
  };

  useEffect(() => {
    if (!orgId) {
      console.log("Waiting for user to be loaded...");
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStatusCounts(),
          fetchViolationCounts(),
          fetchLocationCounts(),
        ]);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [orgId]);

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role="organization" />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {loading ? (
            <div className="flex justify-center items-center h-full">
             
              <Loader/>
            </div>
          ) : error ? (
            <div className="text-red-600 p-4">{error}</div>
          ) : (
            <>
              {/* Dashboard Content */}

              <h2 className="text-3xl font-extrabold text-center text-[#0d1b2a] mb-6">
                Organization Dashboard
              </h2>

              <div className="w-full h-px bg-gray-300 my-5"></div>
              <h2 className="text-xl font-semibold text-[#2a4c80] mb-4">
                Reports by Status
              </h2>
              <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {["new", "pending", "turned-into-case"].map((s) => {
                  const statusData = statusCounts[s];

                  return (
                    <div
                      key={s}
                      className="bg-[#e9e7e3] p-4 rounded-lg shadow-md border border-[#beb5aa]"
                    >
                      <h3 className="text-sm text-[#132333] mb-2 capitalize">
                        {s.replace(/_/g, " ")}
                      </h3>

                      <p className="text-2xl font-bold text-[#2a4c80]">
                        {statusData?.count ?? 0}
                      </p>

                      {statusData?.report_ids?.length > 0 && (
                        <>
                          <button
                            onClick={() => setShowDetails((prev) => !prev)}
                            className="text-sm mt-2 underline text-[#2a4c80] hover:text-[#1b345a]"
                          >
                            {showDetails
                              ? "Hide Report IDs"
                              : "Show Report IDs"}
                          </button>

                          {showDetails && (
                            <ul className="mt-2 text-xs text-[#2a4c80] max-h-32 overflow-y-auto bg-white rounded p-2 border border-[#c4bfb9]">
                              {statusData.report_ids.map((id) => (
                                <li key={id} className="break-all py-0.5">
                                  {id}
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </section>
              <div className="w-full h-px bg-gray-300 my-5"></div>
              {/* Violation-type Cards */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-[#2a4c80] mb-4">
                  Reports by Violation Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {violationCounts.map(({ name, count }) => (
                    <div
                      key={name}
                      className="rounded-lg border border-[#2a4c80] overflow-hidden shadow-md"
                    >
                      <div className="bg-[#2a4c80] text-white text-center py-2 font-semibold">
                        {name}
                      </div>
                      <div className="bg-white text-[#2a4c80] text-center py-4 font-bold">
                        Count: {count}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-gray-300 my-5"></div>
              {/* Location Cards */}
              <section>
                <h2 className="text-xl font-semibold text-[#2a4c80] mb-4">
                  Reports by Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {locationCounts.map(({ name, count }) => (
                    <div
                      key={JSON.stringify(name)}
                      className="bg-[#F5F3EF] p-4 rounded-lg shadow-md border-2 border-[#fbbe24] flex flex-col items-center text-center w-full h-auto transition hover:shadow-lg"
                    >
                      <div className="font-medium text-[#2a4c80] mb-2">
                        {typeof name === "object"
                          ? `${name.city || ""}, ${name.country || ""}`
                          : name}
                      </div>
                      <div className="text-[#2a4c80] font-bold">
                        Count: {count}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default OrganizationDashboard;
