import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import axios from "axios";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import Loader from "../../components/All/Loader";
import { useAuth } from "../../auth";

export default function RiskHistory() {
  const { user } = useAuth();
  const { id } = useParams(); // victim_id from URL
  const [loading, setLoading] = useState(true);
  const [riskHistory, setRiskHistory] = useState([]);
  const [victimDetails, setVictimDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch victim details
        const victimRes = await axios.get(
          `http://localhost:8000/api/victims/${id}`
        );
        setVictimDetails(victimRes.data);

        // Fetch risk history
        const historyRes = await axios.get(
          `http://localhost:8000/api/victims/risk-history/${id}`
        );
        // Sort descending by created_at
        const sortedHistory = historyRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRiskHistory(sortedHistory);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role={user?.role || "user"} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <Loader />
          ) : (
            <>
              <Link
                to="/secretaria/victims/update"
                className="flex items-center space-x-2 text-[#132333] px-4 py-2 rounded-md hover:text-[#1323339f] transition-colors w-fit mb-4"
              >
                <IoArrowBackOutline size={20} />
                <span className="font-medium">Back</span>
              </Link>

              <h1 className="text-2xl font-semibold text-[#132333] mb-4">
                Risk Assessment History
              </h1>

              {victimDetails && (
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <h2 className="text-lg font-medium text-[#132333] mb-2">
                    Victim Details
                  </h2>

                  <p className="text-gray-700">
                    <strong>ID:</strong> {victimDetails.id}
                  </p>
                  <p className="text-gray-700">
                    <strong>Name:</strong>{" "}
                    {victimDetails.demographics?.first_name}{" "}
                    {victimDetails.demographics?.last_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Role:</strong> {victimDetails.type}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {riskHistory.length === 0 ? (
                  <>
                      <p className="text-gray-600 mb-2">
      No risk assessment history found.
    </p>
    <Link
      to={`/secretaria/victims/update/${id}`}
      className="inline-block bg-[#fbbe24bd] text-white text-center py-1 px-4 rounded hover:bg-[#fbbe247a] transition-colors"
    >
      Update Risk assessment
    </Link>
                  </>
                ) : (
                  riskHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-[#132333]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-[#132333]">
                          Assessment Date:
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">
                        <strong>Role:</strong> {entry.role}
                      </p>

                      <div className="mb-2">
                        <h4 className="font-semibold text-[#132333] mb-1">
                          Risk Assessment:
                        </h4>
                        <p className="text-gray-700">
                          <strong>Level:</strong> {entry.risk_assessment.level}
                        </p>
                        <p className="text-gray-700">
                          <strong>Threats:</strong>{" "}
                          {entry.risk_assessment.threats.join(", ")}
                        </p>
                        <p className="text-gray-700">
                          <strong>Protection Needed:</strong>{" "}
                          {entry.risk_assessment.protection_needed
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#132333] mb-1">
                          Support Services:
                        </h4>
                        {entry.support_services.length === 0 ? (
                          <p className="text-gray-600">No support services.</p>
                        ) : (
                          <ul className="list-disc list-inside text-gray-700">
                            {entry.support_services.map((service, index) => (
                              <li key={index}>
                                <span className="font-medium">
                                  {service.type}
                                </span>{" "}
                                - {service.provider} (
                                {service.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                                )
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
