import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [editingReportId, setEditingReportId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");

  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        `http://localhost:8000/api/incident_report/reports?${params.toString()}`
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

  const handleEditClick = (reportId, currentStatus) => {
    setEditingReportId(reportId);
    setEditedStatus(currentStatus);
  };

  const handleApplyEdit = async (reportId) => {
    if (!reportId || !editedStatus) {
      alert("Missing report ID or status");
      return;
    }

    try {
      const url = `http://localhost:8000/api/incident_report/reports/${reportId}?status=${encodeURIComponent(editedStatus)}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      await response.json();
      fetchReports();
      setEditingReportId(null);
      setEditedStatus("");
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
      default:
        return "bg-gray-200 text-[#132333]";
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, dateFilter, cityFilter]);

  return (
    <div className="min-h-screen bg-[#EBE1D5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a4c80] mb-2">Incident Reports</h1>
          <p className="text-[#132333] opacity-75">Manage and track all incident reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-[#beb5aa] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2a4c80] mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#132333] mb-2">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[#beb5aa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a4c80] focus:border-transparent bg-white text-[#132333]"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="turned-into-case">Turned into Case</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#132333] mb-2">Date</label>
              <input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[#beb5aa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a4c80] focus:border-transparent bg-white text-[#132333]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#132333] mb-2">City</label>
              <input
                type="text"
                placeholder="Filter by city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[#beb5aa] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a4c80] focus:border-transparent bg-white text-[#132333] placeholder-[#beb5aa]"
              />
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2a4c80]"></div>
            <span className="ml-3 text-[#132333]">Loading reports...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaInfoCircle className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-12">
            <FaInfoCircle className="mx-auto h-12 w-12 text-[#beb5aa] mb-4" />
            <p className="text-[#132333] text-lg">No reports found.</p>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((r) => {
            const reportId = r.report_id || r.id || r._id;
            const isEditing = editingReportId === reportId;

            return (
              <div
                key={reportId}
                className="bg-white rounded-lg shadow-sm border border-[#beb5aa] hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/admin/reports/${reportId}`)}
              >
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[#2a4c80] mb-3 line-clamp-2">
                    {r.incident_details.incident_title}
                  </h3>

                  {/* Date and Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-[#132333]">
                      <FaCalendarAlt className="text-[#beb5aa] mr-2 flex-shrink-0" />
                      <span>{new Date(r.incident_details.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#132333]">
                      <FaMapMarkerAlt className="text-[#beb5aa] mr-2 flex-shrink-0" />
                      <span>{r.incident_details.location.city}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#132333]">Status:</span>
                      {isEditing ? (
                        <select 
                          value={editedStatus} 
                          onChange={(e) => setEditedStatus(e.target.value)}
                          className="px-2 py-1 text-xs border border-[#beb5aa] rounded focus:outline-none focus:ring-1 focus:ring-[#2a4c80]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="new">New</option>
                          <option value="pending">Pending</option>
                          <option value="turned-into-case">Turned into Case</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(r.status)}`}>
                          {r.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-[#132333] leading-relaxed">
                      <span className="font-medium">Description: </span>
                      {r.incident_details.description.length > 60
                        ? r.incident_details.description.slice(0, 60) + "..."
                        : r.incident_details.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 py-4 bg-[#e9e7e3] border-t border-[#beb5aa]">
                  {isEditing ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyEdit(reportId);
                      }}
                      className="w-full bg-[#2a4c80] text-white px-4 py-2 rounded-md hover:bg-[#1e3a6f] transition-colors duration-200 font-medium"
                    >
                      Apply Changes
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(reportId, r.status);
                      }}
                      className="flex items-center justify-center w-full text-[#2a4c80] hover:bg-[#beb5aa] hover:bg-opacity-30 px-4 py-2 rounded-md transition-colors duration-200 font-medium"
                    >
                      <FaEdit className="mr-2" />
                      Edit Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminReportsPage;