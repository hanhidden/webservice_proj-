import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../auth";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
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

  // New state for case IDs
  const [availableCases, setAvailableCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Fetch available case IDs on component mount
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

  // Fetch all victims/witnesses initially or when no caseId is searched
  useEffect(() => {
    if (caseId.trim() !== "") return; // Skip if searching by caseId

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

  // Handle case selection from dropdown
  const handleCaseSelection = async (selectedCaseId) => {
    if (!selectedCaseId) {
      // If "All Cases" is selected, reset to show all victims
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

  // Fetch full details when selectedId changes
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

  // Close popup handler
  const closePopup = () => {
    setSelectedId(null);
    setSelectedPerson(null);
  };

  // Sort handler
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Apply filtering based on sortOrder
  const filteredPeople = people.filter((person) =>
    sortOrder === "All"
      ? true
      : person.type.toLowerCase() === sortOrder.toLowerCase()
  );

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-1 overflow-y-auto bg-[#f7f5f1] p-8">
          <Link
            to="/secretaria/victims/"
            className="flex items-center space-x-2  text-[#132333] px-4 py-2 rounded-md hover:text-[#1323339f] transition-colors  w-fit"
          >
            <IoArrowBackOutline size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Victim & Witness List</h1>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium">
                Filter by Type:
              </label>
              <select
                id="sort"
                value={sortOrder}
                onChange={handleSortChange}
                className="border border-gray-300 rounded px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Case ID:
              </label>
              <select
                id="caseSelector"
                value={caseId}
                onChange={(e) => handleCaseSelection(e.target.value)}
                disabled={loadingCases}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="">All Cases</option>
                {availableCases.map((caseItem) => (
                  <option key={caseItem._id} value={caseItem.case_id}>
                    {caseItem.case_id}
                  </option>
                ))}
              </select>
              {loadingCases && (
                <p className="text-sm text-gray-500 mt-1">
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
            <p className="text-gray-600 mt-8 text-center">
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
                    className="cursor-pointer bg-white border rounded-lg p-4 shadow hover:shadow-lg flex items-center space-x-3"
                    onClick={() => setSelectedId(id)}
                  >
                    <IoPersonOutline size={40} className="text-gray-600" />
                    <div>
                      <p className="font-semibold truncate">
                        {demographics?.first_name} {demographics?.last_name}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{type}</p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Popup modal */}
              {selectedId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
                    <button
                      onClick={closePopup}
                      className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                    >
                      <AiOutlineClose size={24} />
                    </button>

                    {loading && <p>Loading...</p>}

                    {!loading && selectedPerson && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">
                          Victim/Witness Details
                        </h2>
                        <div className="space-y-2">
                          <DetailRow label="ID" value={selectedPerson.id} />
                          <DetailRow label="Type" value={selectedPerson.type} />
                          <DetailRow
                            label="Created At"
                            value={selectedPerson.created_at}
                          />
                          <DetailRow
                            label="Updated At"
                            value={selectedPerson.updated_at}
                          />

                          {/* Show demographics nicely */}
                          {selectedPerson.demographics && (
                            <>
                              <h3 className="font-semibold mt-4">
                                Demographics
                              </h3>
                              {Object.entries(selectedPerson.demographics).map(
                                ([key, val]) => (
                                  <DetailRow
                                    key={key}
                                    label={key.replace(/_/g, " ")}
                                    value={val?.toString() || ""}
                                  />
                                )
                              )}
                            </>
                          )}

                          {/* Show contact info */}
                          {selectedPerson.contact_info && (
                            <>
                              <h3 className="font-semibold mt-4">
                                Contact Info
                              </h3>
                              {Object.entries(selectedPerson.contact_info).map(
                                ([key, val]) => (
                                  <DetailRow
                                    key={key}
                                    label={key.replace(/_/g, " ")}
                                    value={val?.toString() || ""}
                                  />
                                )
                              )}
                            </>
                          )}

                          {/* Show other details dynamically */}
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
                                ].includes(key)
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <h3 className="font-semibold capitalize mt-4">
                                  {key.replace(/_/g, " ")}
                                </h3>
                                {typeof value === "object" ? (
                                  <pre className="text-sm bg-gray-100 p-2 rounded">
                                    {JSON.stringify(value, null, 2)}
                                  </pre>
                                ) : (
                                  <p className="bg-gray-100 p-2 rounded text-sm">
                                    {value}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {!loading && !selectedPerson && (
                      <p className="text-red-600">Failed to load details.</p>
                    )}
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

// DetailRow Component for label-value pairs
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-b py-1">
    <span className="font-medium capitalize">{label}:</span>
    <span>{value}</span>
  </div>
);
