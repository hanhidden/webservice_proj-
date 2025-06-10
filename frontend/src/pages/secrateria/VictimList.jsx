

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../auth";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { Link } from "react-router-dom";
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoShieldOutline,
  IoHeartOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import Loader from "../../components/All/Loader";

export default function VictimList() {
  const { user } = useAuth();

  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("All");
  const [caseId, setCaseId] = useState("");
  const [searching, setSearching] = useState(false);

  const [availableCases, setAvailableCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  useEffect(() => {
    async function fetchCaseIds() {
      setLoadingCases(true);
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/cases/getall");
        setAvailableCases(res.data.case_ids || []);
      } catch (error) {
        console.error("Failed to fetch case IDs:", error);
        setAvailableCases([]);
      } finally {
        setLoadingCases(false);
      }
    }
    fetchCaseIds();
  }, []);

  useEffect(() => {
    if (caseId.trim() !== "") return;

    async function fetchPeople() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/victims/all");
        setPeople(res.data);
      } catch (error) {
        console.error("Failed to fetch list:", error);
        setPeople([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPeople();
  }, [caseId]);

  const handleCaseSelection = async (selectedCaseId) => {
    if (!selectedCaseId) {
      setCaseId("");
      setSearching(false);
      setSelectedId(null);
      setSelectedPerson(null);
      return;
    }

    setCaseId(selectedCaseId);
    setLoading(true);
    setSearching(true);
    setSelectedId(null);
    setSelectedPerson(null);

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/victims/case/${selectedCaseId}`
      );
      setPeople(res.data);
    } catch (error) {
      console.error("Failed to fetch by case ID:", error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedId) return;

    async function fetchPersonDetails() {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/victims/${selectedId}`
        );
        setSelectedPerson(res.data);
      } catch (error) {
        console.error("Failed to fetch person details:", error);
        setSelectedPerson(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPersonDetails();
  }, [selectedId]);

  const closePopup = () => {
    setSelectedId(null);
    setSelectedPerson(null);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const filteredPeople = people.filter((person) =>
    sortOrder === "All"
      ? true
      : person.type.toLowerCase() === sortOrder.toLowerCase()
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "string" && value.trim() === "") return "N/A";
    return value.toString();
  };

  const getBooleanIcon = (value) => {
    if (typeof value === "boolean") {
      return value ? (
        <IoCheckmarkCircleOutline className="text-emerald-600" size={18} />
      ) : (
        <IoCloseCircleOutline className="text-red-500" size={18} />
      );
    }
    return null;
  };

  const getIconForField = (key) => {
    const iconMap = {
      email: <IoMailOutline className="text-slate-600" />,
      phone: <IoCallOutline className="text-slate-600" />,
      address: <IoLocationOutline className="text-slate-600" />,
      created_at: <IoCalendarOutline className="text-slate-600" />,
      updated_at: <IoTimeOutline className="text-slate-600" />,
    };
    return iconMap[key] || <IoPersonOutline className="text-slate-600" />;
  };

  const renderSpecialSection = (key, value, icon, bgColor, borderColor) => {
    if (
      !value ||
      (typeof value === "object" && Object.keys(value).length === 0)
    ) {
      return null;
    }

    return (
      <div className={`${bgColor} rounded-xl p-6 border ${borderColor}`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center capitalize">
          {icon}
          {key.replace(/_/g, " ")}
        </h3>
        {typeof value === "object" ? (
          <div className="space-y-3">
            {Object.entries(value).map(([subKey, subValue]) => (
              <DetailRow
                key={subKey}
                icon={getBooleanIcon(subValue) || getIconForField(subKey)}
                label={subKey.replace(/_/g, " ")}
                value={formatValue(subValue)}
                isBooleanValue={typeof subValue === "boolean"}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-stone-200">
            <p className="text-slate-700">{formatValue(value)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <Link
            to="/secretaria/victims/"
            className="flex items-center space-x-2 text-slate-700 px-4 py-2 rounded-md hover:text-slate-900 transition-colors w-fit"
          >
            <IoArrowBackOutline size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Victim & Witness List
            </h1>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="sort"
                className="text-sm font-medium text-slate-700"
              >
                Filter by Type:
              </label>
              <select
                id="sort"
                value={sortOrder}
                onChange={handleSortChange}
                className="border border-stone-300 rounded px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="All">All</option>
                <option value="victim">Victim</option>
                <option value="witness">Witness</option>
              </select>
            </div>
          </div>

          {/* Case ID selector dropdown */}
          <div className="my-4 flex space-x-2 items-center">
            <div className="flex-grow">
              <label
                htmlFor="caseSelector"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Select Case ID:
              </label>
              <select
                id="caseSelector"
                value={caseId}
                onChange={(e) => handleCaseSelection(e.target.value)}
                disabled={loadingCases}
                className="w-full border border-stone-300 rounded px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              >
                <option value="">All Cases</option>
                {availableCases.map((caseItem) => (
                  <option key={caseItem._id} value={caseItem.case_id}>
                    {caseItem.case_id}
                  </option>
                ))}
              </select>
              {loadingCases && (
                <p className="text-sm text-slate-500 mt-1">
                  Loading case IDs...
                </p>
              )}
            </div>

            {/* Clear selection */}
            {searching && (
              <button
                onClick={() => handleCaseSelection("")}
                className="text-red-600 underline ml-2 self-end pb-2"
              >
                Show All Cases
              </button>
            )}
          </div>

          {/* Display current selection */}
          {searching && caseId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Showing results for case:</span>{" "}
                {caseId}
              </p>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : filteredPeople.length === 0 ? (
            <p className="text-slate-600 mt-8 text-center">
              {searching
                ? `No victims/witnesses found for case: ${caseId}`
                : "No results found."}
            </p>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPeople.map(({ id, type, demographics }) => (
                  <div
                    key={id}
                    className="cursor-pointer bg-white border border-bg-gray-100 rounded-lg p-4 shadow hover:shadow-lg flex items-center space-x-3 transition-all duration-200 hover:scale-105"
                    onClick={() => setSelectedId(id)}
                  >
                    <IoPersonOutline size={40} className="text-slate-600" />
                    <div>
                      <p className="font-semibold truncate text-slate-800">
                        {demographics?.first_name} {demographics?.last_name}
                      </p>
                      <p className="text-sm text-slate-600 capitalize">
                        {type}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        ID: {id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Popup Modal */}
              {selectedId && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4">
                  <div className="bg-[#f7f5f1] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out border border-stone-200">
                    {/* Header */}
                    <div className="bg-slate-800 text-stone-100 p-6 relative">
                      <button
                        onClick={closePopup}
                        className="absolute top-4 right-4 text-stone-200 hover:text-white transition-colors duration-200 bg-slate-700 rounded-full p-2 hover:bg-slate-600"
                      >
                        <AiOutlineClose size={20} />
                      </button>

                      {!loading && selectedPerson && (
                        <div className="flex items-center space-x-4">
                          <div className="bg-stone-200 rounded-full p-3">
                            <IoPersonOutline
                              size={32}
                              className="text-slate-800"
                            />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">
                              {selectedPerson.demographics?.first_name}{" "}
                              {selectedPerson.demographics?.last_name}
                            </h2>
                            <p className="text-stone-300 capitalize text-lg">
                              {selectedPerson.type}
                            </p>
                          </div>
                        </div>
                      )}

                      {loading && (
                        <div className="flex items-center space-x-4">
                          <div className="animate-pulse bg-stone-200 rounded-full p-3">
                            <IoPersonOutline
                              size={32}
                              className="text-slate-800"
                            />
                          </div>
                          <div>
                            <div className="h-8 bg-stone-200 rounded w-48 animate-pulse"></div>
                            <div className="h-4 bg-stone-200 rounded w-24 mt-2 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-100">
                      {loading && (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
                          <span className="ml-3 text-slate-600">
                            Loading details...
                          </span>
                        </div>
                      )}

                      {!loading && selectedPerson && (
                        <div className="space-y-6">
                          {/* Basic Information Card */}
                          <div className="bg-[#e5dfd3b0] rounded-xl p-6 border border-stone-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                              <IoPersonOutline className="mr-2 text-slate-600" />
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DetailRow
                                icon={getIconForField("id")}
                                label="ID"
                                value={selectedPerson.id}
                              />
                              <DetailRow
                                icon={getIconForField("type")}
                                label="Type"
                                value={selectedPerson.type}
                              />
                              <DetailRow
                                icon={getIconForField("created_at")}
                                label="Created At"
                                value={formatDate(selectedPerson.created_at)}
                              />
                              <DetailRow
                                icon={getIconForField("updated_at")}
                                label="Updated At"
                                value={formatDate(selectedPerson.updated_at)}
                              />
                            </div>
                          </div>

                          {/* Demographics Card */}
                          {selectedPerson.demographics && (
                            <div className=" bg-[#e5dfd3b0] rounded-xl p-6 border border-amber-200">
                              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <IoPersonOutline className="mr-2 text-amber-700" />
                                Demographics
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(
                                  selectedPerson.demographics
                                ).map(([key, val]) => (
                                  <DetailRow
                                    key={key}
                                    icon={
                                      getBooleanIcon(val) ||
                                      getIconForField(key)
                                    }
                                    label={key.replace(/_/g, " ")}
                                    value={formatValue(val)}
                                    isBooleanValue={typeof val === "boolean"}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Contact Information Card */}
                          {selectedPerson.contact_info && (
                            <div className="bg-[#e5dfd3b0] rounded-xl p-6 border border-blue-200">
                              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <IoMailOutline className="mr-2 text-blue-700" />
                                Contact Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(
                                  selectedPerson.contact_info
                                ).map(([key, val]) => (
                                  <DetailRow
                                    key={key}
                                    icon={
                                      getBooleanIcon(val) ||
                                      getIconForField(key)
                                    }
                                    label={key.replace(/_/g, " ")}
                                    value={formatValue(val)}
                                    isBooleanValue={typeof val === "boolean"}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Risk Assessment Card */}
                          {selectedPerson.risk_assessment &&
                            renderSpecialSection(
                              "risk_assessment",
                              selectedPerson.risk_assessment,
                              <IoShieldOutline className="mr-2 text-red-700" />,
                              "bg-[#e5dfd3b0]",
                              "border-red-200"
                            )}


                          {selectedPerson.support_services &&
                            Array.isArray(selectedPerson.support_services) && (
                              <div className="bg-[#e5dfd3b0] rounded-xl p-6 border border-emerald-200">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                  <IoHeartOutline className="mr-2 text-emerald-700" />
                                  Support Services
                                </h3>
                                <div className="space-y-4">
                                  {selectedPerson.support_services.map(
                                    (service, index) => (
                                      <div
                                        key={index}
                                        className="bg-white rounded-lg p-4 border border-stone-200"
                                      >
                                        <h4 className="text-md font-semibold text-slate-700 mb-2">Service {index + 1}</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {Object.entries(service).map(
                                            ([key, val]) => (
                                              <DetailRow
                                                key={key}
                                                icon={
                                                  getBooleanIcon(val) ||
                                                  getIconForField(key)
                                                }
                                                label={key.replace(/_/g, " ")}
                                                value={formatValue(val)}
                                                isBooleanValue={
                                                  typeof val === "boolean"
                                                }
                                              />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Additional Information */}
                          {Object.entries(selectedPerson)
                            .filter(
                              ([key]) =>
                                ![
                                  "id",
                                  "type",
                                  "created_at",
                                  "updated_at",
                                  "demographics",
                                  "contact_info",
                                  "risk_assessment",
                                  "support_services",
                                ].includes(key)
                            )
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="bg-[#e5dfd3b0] rounded-xl p-6 border border-slate-200"
                              >
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center capitalize">
                                  <IoPersonOutline className="mr-2 text-slate-600" />
                                  {key.replace(/_/g, " ")}
                                </h3>
                                {typeof value === "object" ? (
                                  <div className="space-y-3">
                                    {Object.entries(value).map(
                                      ([subKey, subValue]) => (
                                        <DetailRow
                                          key={subKey}
                                          icon={
                                            getBooleanIcon(subValue) ||
                                            getIconForField(subKey)
                                          }
                                          label={subKey.replace(/_/g, " ")}
                                          value={formatValue(subValue)}
                                          isBooleanValue={
                                            typeof subValue === "boolean"
                                          }
                                        />
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg p-4 border border-stone-200">
                                    <p className="text-slate-700">
                                      {formatValue(value)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

                      {!loading && !selectedPerson && (
                        <div className="text-center p-8">
                          <div className="text-red-500 mb-4">
                            <IoPersonOutline
                              size={48}
                              className="mx-auto opacity-50"
                            />
                          </div>
                          <p className="text-red-600 font-medium">
                            Failed to load person details.
                          </p>
                          <p className="text-slate-500 text-sm mt-2">
                            Please try again or contact support if the issue
                            persists.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}



              
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const DetailRow = ({ icon, label, value, isBooleanValue }) => (
  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-stone-150 hover:shadow-sm transition-shadow duration-200">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 capitalize truncate">
        {label}
      </p>
      <div className="flex items-center space-x-2">
        <p
          className={`text-sm break-words ${
            isBooleanValue
              ? value === "Yes"
                ? "text-emerald-700 font-medium"
                : "text-red-600 font-medium"
              : "text-slate-600"
          }`}
        >
          {value || "N/A"}
        </p>
      </div>
    </div>
  </div>
);
