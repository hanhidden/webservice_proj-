import React, { useEffect, useState } from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import loader
import Loader from "../../components/All/Loader";

const cardBase =
  "p-10 rounded-2xl shadow-md transition hover:shadow-lg cursor-pointer text-lg font-semibold flex items-center justify-center text-center";

function SecretariaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    closed: 0,
    waiting_for_approval: 0,
    approved: 0,
    open: 0,
    new: 0,
    assigned_reports: 0,
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchData = async () => {
      setLoading(true); // start loading
      try {
        const [caseRes, reportRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/cases/count-by-status`, {
            params: { secretaria_id: user.user_id },
          }),
          axios.get(
            `http://localhost:8000/api/incident_reports/assigned/count`,
            {
              params: { secretaria_id: user.user_id },
            }
          ),
        ]);

        setCounts({
          closed: caseRes.data.closed || 0,
          waiting_for_approval: caseRes.data.waiting_for_approval || 0,
          approved: caseRes.data.approved || 0,
          open: caseRes.data.open || 0,
          new: caseRes.data.new || 0,
          assigned_reports: reportRes.data.assigned_reports || 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        alert("Failed to fetch dashboard data.");
      } finally {
        setLoading(false); // done loading
      }
    };

    fetchData();
  }, [user?.user_id]);

  const goToTable = (type) => {
    navigate(`/secretaria/table/${type}`);
  };

  if (loading) {
    return <Loader />; // Show loader while loading
  }

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-10 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-8" style={{ color: "#0d1b2a" }}>
            Welcome, {user?.role || "User"}!
          </h1>
          <div className="grid grid-cols-1 gap-8">
            {/* Full-width card */}
            <div
              onClick={() => goToTable("closed")}
              className={`${cardBase}`}
              style={{
                backgroundColor: "#fbbe24bd",
                color: "#0d1b2a",
                fontSize: "1.75rem",
                fontWeight: "700",
                cursor: "pointer",
                borderRadius: "1rem",
              }}
            >
              🎉 You have closed {counts.closed} cases!
            </div>

            {/* Grid with 2 cards per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className={`${cardBase}`}
                style={{
                  backgroundColor: "#F5F3EF",
                  color: "#0d1b2a",
                  border: "3px solid #fbbe24",
                  fontSize: "1.5rem",
                  borderRadius: "1rem",
                }}
              >
                🔻 {counts.assigned_reports} reports assigned to you
              </div>

              <div
                onClick={() => goToTable("waiting_for_approval")}
                className={`${cardBase}`}
                style={{
                  backgroundColor: "#F5F3EF",
                  color: "#0d1b2a",
                  border: "3px solid #fbbe24",
                  fontSize: "1.5rem",
                  borderRadius: "1rem",
                }}
              >
                ⏳ {counts.waiting_for_approval} pending cases
              </div>

              <div
                onClick={() => goToTable("approved")}
                className={`${cardBase}`}
                style={{
                  backgroundColor: "#F5F3EF",
                  color: "#0d1b2a",
                  border: "3px solid #fbbe24",
                  fontSize: "1.5rem",
                  borderRadius: "1rem",
                }}
              >
                ✅ {counts.new} new cases
              </div>

              <div
                onClick={() => goToTable("open")}
                className={`${cardBase}`}
                style={{
                  backgroundColor: "#F5F3EF",
                  color: "#0d1b2a",
                  border: "3px solid #fbbe24",
                  fontSize: "1.5rem",
                  borderRadius: "1rem",
                }}
              >
                🛠️ You're currently working on {counts.open} cases
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default SecretariaDashboard;
