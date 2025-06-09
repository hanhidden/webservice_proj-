
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { IoArrowBackOutline } from "react-icons/io5";
import Loader from "../../components/All/Loader";

const threatOptions = [
  "intimidation",
  "surveillance",
  "harassment",
  "physical violence",
  "digital threats",
  "legal threats",
  "defamation",
  "financial threats",
  "family threats",
  "forced disappearance",
];

const riskLevels = ["low", "medium", "high", "critical", "extreme"];

const supportServiceStatuses = ["active", "inactive", "pending"];

export default function UpdateVictimform() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    risk_assessment: {
      level: "",
      threats: [],
      protection_needed: false,
    },
    support_services: [],
  });
  const [error, setError] = useState(null);

  // Fetch current victim data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/victims/${id}`);
        setFormData({
          risk_assessment: res.data.risk_assessment || {
            level: "",
            threats: [],
            protection_needed: false,
          },
          support_services: res.data.support_services || [],
        });
      } catch (err) {
        setError("Failed to load victim data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "risk_assessment.level") {
      setFormData((prev) => ({
        ...prev,
        risk_assessment: { ...prev.risk_assessment, level: value },
      }));
    } else if (name === "risk_assessment.protection_needed") {
      setFormData((prev) => ({
        ...prev,
        risk_assessment: {
          ...prev.risk_assessment,
          protection_needed: checked,
        },
      }));
    }
  };

  const toggleThreat = (threat) => {
    setFormData((prev) => {
      const currentThreats = prev.risk_assessment.threats || [];
      const newThreats = currentThreats.includes(threat)
        ? currentThreats.filter((t) => t !== threat)
        : [...currentThreats, threat];

      return {
        ...prev,
        risk_assessment: { ...prev.risk_assessment, threats: newThreats },
      };
    });
  };

  // Support services handlers
  const handleSupportServiceChange = (index, field, value) => {
    const updatedServices = [...formData.support_services];
    updatedServices[index][field] = value;
    setFormData((prev) => ({ ...prev, support_services: updatedServices }));
  };

  const addSupportService = () => {
    setFormData((prev) => ({
      ...prev,
      support_services: [
        ...prev.support_services,
        { type: "", provider: "", status: "" },
      ],
    }));
  };

  const removeSupportService = (index) => {
    const updatedServices = [...formData.support_services];
    updatedServices.splice(index, 1);
    setFormData((prev) => ({ ...prev, support_services: updatedServices }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/victims/${id}`, formData);
      alert("Victim data updated successfully!");
      navigate("/secretaria/victims");
    } catch (err) {
      setError("Failed to update victim data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role={user?.role || "user"} />

    
         <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/admin/victims/update"
              className="flex items-center space-x-2 text-gray-700 mb-4 hover:text-gray-500 transition-colors"
            >
              <IoArrowBackOutline size={20} />
              <span className="font-medium">Back</span>
            </Link>

            <div className="bg-slate-50 rounded-lg shadow-md p-6 md:p-8">
              <h1 className="text-2xl font-bold text-[#1a2f4f] mb-6">
                Update Victim/Witness Info
              </h1>
              <p className="text-gray-700">
                    <strong>ID:</strong> {id}
                  </p>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader />
                </div>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 pt-5">
                  {/* Risk Level */}
                  <div>
                    <label className="block font-semibold mb-2">
                      Risk Level:
                    </label>
                    <select
                      name="risk_assessment.level"
                      value={formData.risk_assessment.level}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fbbe24bd] transition"
                    >
                      <option value="">Select</option>
                      {riskLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Threats */}
                  <div>
                    <label className="block font-semibold mb-2">
                      Threats:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-3 bg-gray-50">
                      {threatOptions.map((threat) => (
                        <label
                          key={threat}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.risk_assessment.threats.includes(threat)}
                            onChange={() => toggleThreat(threat)}
                            className="accent-[#1a2f4f]"
                          />
                          <span>{threat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Protection Needed */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="risk_assessment.protection_needed"
                      checked={formData.risk_assessment.protection_needed}
                      onChange={handleChange}
                      className="accent-[#1a2f4f]"
                    />
                    <label className="font-semibold">
                      Protection Needed
                    </label>
                  </div>

                  {/* Support Services */}
                  <div>
                    <h2 className="text-xl font-bold mb-3">
                      Support Services:
                    </h2>
                    {formData.support_services.map((service, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm mb-4 space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Type */}
                          <div>
                            <label className="block font-semibold mb-1">
                              Type:
                            </label>
                            <input
                              type="text"
                              value={service.type}
                              onChange={(e) =>
                                handleSupportServiceChange(idx, "type", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fbbe24bd] transition"
                            />
                          </div>
                          {/* Provider */}
                          <div>
                            <label className="block font-semibold mb-1">
                              Provider:
                            </label>
                            <input
                              type="text"
                              value={service.provider}
                              onChange={(e) =>
                                handleSupportServiceChange(idx, "provider", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fbbe24bd] transition"
                            />
                          </div>
                          {/* Status */}
                          <div>
                            <label className="block font-semibold mb-1">
                              Status:
                            </label>
                            <select
                              value={service.status}
                              onChange={(e) =>
                                handleSupportServiceChange(idx, "status", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fbbe24bd] transition"
                            >
                              <option value="">Select</option>
                              {supportServiceStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSupportService(idx)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Remove Service
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSupportService}
                      className="bg-[#fbbe24bd] text-white px-4 py-2 rounded-lg hover:bg-[#fbbe247a] transition"
                    >
                      Add Support Service
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`bg-[#1a2f4f] text-white px-6 py-2 rounded-lg hover:bg-[#335d9b] transition ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );









}
