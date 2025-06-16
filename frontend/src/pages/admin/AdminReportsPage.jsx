import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../../auth";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import Loader from "../../components/All/Loader";
import axios from "axios";

function AdminReportsPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [analytics, setAnalytics] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [editingReportId, setEditingReportId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  // const [selectedSecretariaId, setSelectedSecretariaId] = useState("");
  const [selectedSecretarias, setSelectedSecretarias] = useState({});

  const [secretarias, setSecretarias] = useState([]);

  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/incident_reports/reports/analytics"
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data.analytics || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        `http://localhost:8000/api/incident_reports/reports?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();

      let filtered = data;

      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filtered = filtered.filter((r) => {
          const incidentDate = new Date(r.incident_details.date);
          return incidentDate.toDateString() === filterDate.toDateString();
        });
      }

      if (cityFilter) {
        filtered = filtered.filter((r) =>
          r.incident_details.location.city
            .toLowerCase()
            .includes(cityFilter.toLowerCase())
        );
      }

      setReports(filtered);
    } catch (err) {
      setError(err.message || "Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSecretarias = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/users/role/secretaria"
        );
        setSecretarias(response.data.users);
      } catch (err) {
        console.error("Failed to fetch secretarias:", err);
      }
    };

    fetchSecretarias();
  }, []);

 
  const handleEditClick = (reportId, currentStatus) => {
    setEditingReportId(reportId);
    setEditedStatus(currentStatus);
    setSelectedSecretariaId(""); // Reset on edit start
  };

 
  const handleApplyEdit = async (reportId) => {
  if (!reportId || !editedStatus) {
    alert("Missing report ID or status");
    return;
  }

  const secretariaId = selectedSecretarias[reportId];

  if (editedStatus === "assigned" && !secretariaId) {
    alert("Please select a secretaria for the assigned status.");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("status", editedStatus);
    if (editedStatus === "assigned") {
      params.append("secretaria_id", secretariaId);
    }

    const url = `http://localhost:8000/api/incident_reports/reports/${reportId}?${params.toString()}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    await response.json();
    fetchReports();
    setEditingReportId(null);
    setEditedStatus("");
    setSelectedSecretarias((prev) => {
      const updated = { ...prev };
      delete updated[reportId];
      return updated;
    });
    alert("Status updated successfully!");
  } catch (err) {
    alert(`Failed to apply edit: ${err.message}`);
  }
};


  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "new":
        return "bg-[#fcc844] text-[#132333]";
      case "pending":
        return "bg-[#beb5aa] text-[#132333]";
      case "turned-into-case":
        return "bg-[#2a4c80] text-white";
      case "assigned":
        return "bg-emerald-400 text-white";
      default:
        return "bg-gray-200 text-[#132333]";
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchReports();
  }, [statusFilter, dateFilter, cityFilter]);

  return (
    <>
      <Header />

      <div className="flex h-screen">
        <Sidebar role={user?.role || "user"} />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold text-center text-[#0d1b2a]">
              Incident Reports
            </h2>
          </div>

          <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader />
              </div>
            ) : (
              <>
                {/* Analytics Cards */}
                <p className="text-slate-800 text-xl pb-3 font-extrabold">
                  Violations Types{" "}
                </p>
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {analytics.map(({ violation_type, count }) => (
                    <div
                      key={violation_type}
                      className="rounded-lg shadow border border-gray-300 overflow-hidden"
                    >
                      {/* Top section: violation type */}
                      <div className="bg-[#2a4c80] text-white text-center py-3 font-semibold text-lg">
                        {violation_type.charAt(0).toUpperCase() +
                          violation_type.slice(1)}
                      </div>

                      {/* Bottom section: reports count */}
                      <div className="bg-white text-[#2a4c80] text-center py-4 font-bold text-xl">
                        Reports Count: {count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full h-px bg-gray-300 my-5"></div>

                {/* Filters */}
                <p className="text-slate-800 text-xl pb-3 font-extrabold pt-10">
                  Manage and track all incident reports
                </p>
                <div className="bg-[#e9e7e3] rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-slate-700 mb-4">
                    Filters
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-400 focus:outline-none"
                      >
                        <option value="">All</option>
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="turned-into-case">
                          Turned into Case
                        </option>
                        <option value="assigned">Assigned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Filter by city"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Loading / Error */}
                {loading && <Loader />}

                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded border border-red-300 mb-6">
                    <FaInfoCircle className="inline mr-2" />
                    {error}
                  </div>
                )}

                {!loading && !error && reports.length === 0 && (
                  <div className="text-center py-12">
                    <FaInfoCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-slate-600 text-lg">No reports found.</p>
                  </div>
                )}

                {/* Reports List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((r) => {
                    const reportId = r.report_id || r.id || r._id;
                    const isEditing = editingReportId === reportId;

                    return (
                      <div
                        key={reportId}
                        className="bg-[#e9e7e3] rounded-lg shadow-sm border border-gray-300 hover:shadow-md cursor-pointer overflow-hidden"
                        onClick={() => navigate(`/admin/reports/${reportId}`)}
                      >
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                            {r.incident_details.incident_title}
                          </h3>
                          <div className="text-sm text-slate-600 space-y-1 mb-3">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              {new Date(
                                r.incident_details.date
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 text-gray-400" />
                              {r.incident_details.location.city}
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-sm font-medium text-slate-700">
                              Status:{" "}
                            </span>
                            {isEditing ? (
                              <select
                                value={editedStatus}
                                onChange={(e) =>
                                  setEditedStatus(e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="new">New</option>
                                <option value="pending">Pending</option>
                                <option value="turned-into-case">
                                  Turned into Case
                                </option>
                                <option value="assigned">Assigned</option>
                              </select>
                            ) : (
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            )}

                            {isEditing && editedStatus === "assigned" && (
                              <div className="mt-2">
                                <label className="block text-sm text-gray-700 font-medium mb-1">
                                  Assign to Secretaria:
                                </label>
                                <select
                                 

                                  value={selectedSecretarias[reportId] || ""}
                                  onChange={(e) =>
                                    setSelectedSecretarias((prev) => ({
                                      ...prev,
                                      [reportId]: e.target.value,
                                    }))
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">Select a secretaria</option>
                                  {secretarias.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                      {sec.name || sec.username}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            <span className="font-medium">Description:</span>{" "}
                            {r.incident_details.description.length > 60
                              ? r.incident_details.description.slice(0, 60) +
                                "..."
                              : r.incident_details.description}
                          </p>
                        </div>

                        <div className="bg-[#FFFFFF] border-t border-[#2a4c80] px-6 py-4">
                          {isEditing ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyEdit(reportId);
                              }}
                              className="w-full bg-[#fcc844] text-[#132333] px-4 py-2 rounded hover:bg-[#beb5aa] transition"
                            >
                              Apply Changes
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(reportId, r.status);
                              }}
                              className="w-full text-[#2a4c80] border border-[#2a4c80] px-4 py-2 rounded hover:bg-gray-100 transition"
                            >
                              <FaEdit className="inline mr-2" />
                              Edit Status
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </main>
      </div>
    </>
  );
}

export default AdminReportsPage;
