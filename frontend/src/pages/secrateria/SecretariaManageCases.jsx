import React, { useEffect, useState } from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const cardBase =
  "p-6 rounded-xl shadow-md transition hover:shadow-lg cursor-pointer text-lg";

function SecretariaManageCases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({
    caseId: "",
    priority: "",
    status: "",
    violationType: "",
  });

  const fetchCases = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/cases/`);
      setCases(response.data);
    } catch (error) {
      console.error("Error fetching cases:", error);
      alert("Failed to fetch cases.");
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchSecretaria = c.assigned_secretaria === user?.user_id;
    const matchCaseId = c.case_id
      .toLowerCase()
      .includes(filters.caseId.toLowerCase());
    const matchPriority = filters.priority
      ? c.priority === filters.priority
      : true;
    const matchStatus = filters.status ? c.status === filters.status : true;
    const matchViolation = filters.violationType
      ? c.violation_types.includes(filters.violationType)
      : true;
    return (
      matchSecretaria &&
      matchCaseId &&
      matchPriority &&
      matchStatus &&
      matchViolation
    );
  });

  const groupedByStatus = (status) =>
    filteredCases.filter((c) => c.status === status);

  const statusColors = {
    open: "#FBBC05",
    closed: "#34A853",
    waiting_for_approval: "#F9AB00",
    approved: "#4285F4",
  };

  const priorityColors = {
    high: "#F44336",
    medium: "#FBBC05",
    low: "#34A853",
  };

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-10 bg-gray-100 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#0d1b2a" }}>
              Manage Cases
            </h1>
            <button
              onClick={() => navigate("/secretaria/create-case")}
              className="bg-[#fbbe24] text-[#0d1b2a] font-bold py-2 px-6 rounded-xl hover:brightness-110"
            >
              + Create New Case
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <input
              name="caseId"
              value={filters.caseId}
              onChange={handleFilterChange}
              placeholder="Filter by Case ID"
              className="p-2 rounded border"
            />
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 rounded border"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="waiting_for_approval">Waiting Approval</option>
              <option value="approved">Approved</option>
              <option value="closed">Closed</option>
            </select>
            <input
              name="violationType"
              value={filters.violationType}
              onChange={handleFilterChange}
              placeholder="Violation Type"
              className="p-2 rounded border"
            />
          </div>

          {/* Cases by Status */}
          {["open", "waiting_for_approval", "approved", "closed"].map(
            (status) => (
              <div key={status} className="mb-8">
                <h2
                  className="text-2xl font-semibold mb-4 capitalize"
                  style={{ color: "#0d1b2a" }}
                >
                  {status.replace(/_/g, " ")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groupedByStatus(status).map((c) => (
                    <div
                      key={c._id}
                      onClick={() => navigate(`/secretaria/case/${c._id}`)}
                      className={`${cardBase}`}
                      style={{
                        backgroundColor: "#F5F3EF",
                        color: "#0d1b2a",
                        border: `3px solid ${statusColors[c.status]}`,
                      }}
                    >
                      <p className="text-lg font-bold mb-2">{c.case_id}</p>
                      <p
                        className="mb-1"
                        style={{
                          color: priorityColors[c.priority],
                          fontWeight: "600",
                        }}
                      >
                        Priority: {c.priority}
                      </p>
                      <p
                        style={{
                          color: statusColors[c.status],
                          fontWeight: "600",
                        }}
                      >
                        Status: {c.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))}
                </div>
                <hr className="my-6 border-gray-300" />
              </div>
            )
          )}
        </main>
      </div>
    </>
  );
}

export default SecretariaManageCases;
