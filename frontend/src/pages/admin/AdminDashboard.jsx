import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/All/Loader";

import {
  FaUserClock,
  FaUsers,
  FaFolderOpen,
  FaPlusSquare,
  FaFileAlt,
  FaFileUpload,
} from "react-icons/fa";

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/admin/stats"
        );
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-10 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-[#0d1b2a]">
            Welcome, {user?.role || "User"}!
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Here's a quick overview of system stats.
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Pending Approvals"
                value={stats.pending_approval}
                icon={<FaUserClock className="text-yellow-500 text-4xl mb-2" />}
              />
              <StatCard
                title="Total Users"
                value={stats.total_users}
                icon={<FaUsers className="text-blue-600 text-4xl mb-2" />}
              />
              <StatCard
                title="Total Cases"
                value={stats.total_cases}
                icon={<FaFolderOpen className="text-green-600 text-4xl mb-2" />}
              />
              <StatCard
                title="New Cases"
                value={stats.new_cases}
                icon={
                  <FaPlusSquare className="text-purple-600 text-4xl mb-2" />
                }
              />
              <StatCard
                title="Total Reports"
                value={stats.total_reports}
                icon={<FaFileAlt className="text-gray-600 text-4xl mb-2" />}
              />
              <StatCard
                title="New Reports"
                value={stats.new_reports}
                icon={<FaFileUpload className="text-pink-500 text-4xl mb-2" />}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const StatCard = ({ title, value, icon }) => (
  <div className="bg-[#F5F3EF] p-4 rounded-lg shadow-md border-2 border-[#fbbe24] flex flex-col items-center text-center w-full h-auto transition hover:shadow-lg">
    {React.cloneElement(icon, { className: "text-[#0d1b2a] text-2xl mb-1" })}
    <h2 className="text-sm font-medium text-gray-700">{title}</h2>
    <p className="text-xl font-bold text-[#0d1b2a] mt-1">{value}</p>
  </div>
);

export default AdminDashboard;
