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

export default function UpdateVictims() {
  const { user } = useAuth();

  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("All");

  // Fetch all victims/witnesses on mount
  useEffect(() => {
    async function fetchPeople() {
      try {
        const res = await axios.get("http://localhost:8000/api/victims/all");
        setPeople(res.data);
      } catch (error) {
        console.error("Failed to fetch list:", error);
      }
    }
    fetchPeople();
  }, []);

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
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <Link
            to="/admin/victims/"
            className="flex items-center space-x-2  text-[#132333] px-4 py-2 rounded-md hover:text-[#1323339f] transition-colors  w-fit"
          >
            <IoArrowBackOutline size={20} />
            <span className="font-medium">Back</span>
          </Link>

          {people.length === 0 ? (
            <Loader />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                  Update Victim Risk Assessment
                </h1>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           

                {filteredPeople.map(({ id, type }) => (
                  <div
                    key={id}
                    className="cursor-pointer bg-white border rounded-lg p-4 shadow hover:shadow-lg flex flex-col space-y-3"
                  >
                    <div
                      className="flex items-center space-x-3"
                      onClick={() => setSelectedId(id)}
                    >
                      <IoPersonOutline size={40} className="text-gray-600" />
                      <div>
                        <p className="font-semibold truncate">
                          ID: {id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {type}
                        </p>
                      </div>
                    </div>



                    {/* Update Button */}
                    <Link
                      to={`/admin/victims/update/${id}`}
                      className="bg-[#fbbe24bd] text-white text-center py-1 roundedhover:bg-[#fbbe247a]"
                    >
                      Update
                    </Link>

                    {/* View Risk History Button */}
                    <Link
                      to={`/admin/victims/risk-history/${id}`}
                      className="bg-gray-600 text-white text-center py-1 rounded hover:bg-gray-700"
                    >
                      View Risk History
                    </Link>
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

                          {/* Render additional details dynamically */}
                          {Object.entries(selectedPerson)
                            .filter(
                              ([key]) =>
                                ![
                                  "id",
                                  "type",
                                  "created_at",
                                  "updated_at",
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

// DetailRow Component for consistent styling
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-700">{label}:</span>
    <span className="bg-gray-100 px-3 py-1 rounded text-sm break-words">
      {value}
    </span>
  </div>
);
