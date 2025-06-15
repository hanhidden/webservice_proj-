import Header from "../../components/All/header";
import Sidebar from "../../components/user_homepage/Sidebar";
import { useAuth } from "../../auth";
import { IoArrowBackOutline } from "react-icons/io5";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function NewCaseForm() {
  const violationTypes = [
    "arbitrary_detention",
    "forced_displacement",
    "home_demolition",
    "settler_violence",
    "checkpoint_abuse",
    "torture",
    "child_detention",
    "settlement_expansion",
    "media_suppression",
    "denial_of_healthcare_access",
    "land_confiscation",
    "targeting_of_infrastructure",
  ];

  const perpetratorTypes = [
    "military_unit",
    "police_unit",
    "intelligence_agency",
    "checkpoint_officer",
    "settler_group",
    "government_authority",
    "border_guard_unit",
    "prison_administration",
    "municipal_authority",
    "demolition_crew",
    "court_system",
    "unknown",
  ];

  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allPeople, setAllPeople] = useState([]); // { id, type }[]
  const [reports, setReports] = useState([]);

  // NEW: Add these state variables for the modal functionality
  const [allVictims, setAllVictims] = useState([]);
  const [allWitnesses, setAllWitnesses] = useState([]);
  const [showVictimModal, setShowVictimModal] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [selectedVictimsInModal, setSelectedVictimsInModal] = useState([]);
  const [selectedWitnessesInModal, setSelectedWitnessesInModal] = useState([]);

  const [form, setForm] = useState({
    selectedReports: [],
    case_id: "",
    title: "",
    description: "",
    priority: "",
    violation_types: [],
    perpetrator: {
      name: "",
      type: "",
    },
    date_occurred: "",
    date_reported: "",
    additionalVictims: [], // NEW: Add these fields
    additionalWitnesses: [], // NEW: Add these fields
  });

  useEffect(() => {
    const fetchAssignedReports = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/incident_reports/assigned",
          {
            params: { secretaria_id: user?.user_id },
          }
        );
        setReports(res.data.assigned_reports);
      } catch (err) {
        console.error("Failed to fetch assigned reports:", err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchAssignedReports();
    } else {
      setLoading(false);
    }
  }, [user?.user_id]);

  const generateCaseId = () => {
    const rand = Math.random().toString().slice(2, 12).padEnd(10, "0");
    return `HRM-${rand}`;
  };

  useEffect(() => {
    // Fetch victims & witnesses once - UPDATED to use the new API
    const fetchVictimsAndWitnesses = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/victims/all");
        if (response.ok) {
          const data = await response.json();

          // Set allPeople for backward compatibility
          setAllPeople(data);

          // Separate victims and witnesses for the new modals
          const victims = data.filter((person) => person.type === "victim");
          const witnesses = data.filter((person) => person.type === "witness");

          setAllVictims(victims);
          setAllWitnesses(witnesses);
        }
      } catch (error) {
        console.error("Error fetching victims and witnesses:", error);
      }
    };

    fetchVictimsAndWitnesses();
  }, []);

  const inheritedPeople = useMemo(() => {
    console.log("Selected Reports:", form.selectedReports);

    const inherited = [];

    console.log("Reports:", reports);
    console.log("Selected Reports:", form.selectedReports);
    console.log("All People:", allPeople);
    reports.forEach((report) => {
      if (form.selectedReports.includes(report._id)) {
        const personId = String(report.victim_id); // force string
        const person = allPeople.find((p) => String(p.id) === personId);
        console.log("Trying to find victim_id:", personId);
        console.log("Matched person:", person);

        if (person) {
          inherited.push(person);
        } else {
          console.warn("Victim not found for victim_id:", personId);
        }
      }
    });

    return inherited;
  }, [form.selectedReports, reports, allPeople]);

  const inheritedVictims = useMemo(() => {
    return inheritedPeople.filter((p) => p.type === "victim");
  }, [inheritedPeople]);
  const inheritedWitnesses = useMemo(() => {
    return inheritedPeople.filter((p) => p.type === "witness");
  }, [inheritedPeople]);

  // NEW: Handler functions for the modals
  const addSelectedVictims = () => {
    setForm((prev) => ({
      ...prev,
      additionalVictims: [
        ...(prev.additionalVictims || []),
        ...selectedVictimsInModal,
      ],
    }));
    setShowVictimModal(false);
    setSelectedVictimsInModal([]);
  };

  const addSelectedWitnesses = () => {
    setForm((prev) => ({
      ...prev,
      additionalWitnesses: [
        ...(prev.additionalWitnesses || []),
        ...selectedWitnessesInModal,
      ],
    }));
    setShowWitnessModal(false);
    setSelectedWitnessesInModal([]);
  };

  const removeAdditionalVictim = (victimId) => {
    setForm((prev) => ({
      ...prev,
      additionalVictims: (prev.additionalVictims || []).filter(
        (id) => id !== victimId
      ),
    }));
  };

  const removeAdditionalWitness = (witnessId) => {
    setForm((prev) => ({
      ...prev,
      additionalWitnesses: (prev.additionalWitnesses || []).filter(
        (id) => id !== witnessId
      ),
    }));
  };

  const handleReportSelection = (id) => {
    setForm((prev) => {
      const selected = prev.selectedReports.includes(id)
        ? prev.selectedReports.filter((i) => i !== id)
        : [...prev.selectedReports, id];
      return { ...prev, selectedReports: selected };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerpetratorChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      perpetrator: { ...prev.perpetrator, [name]: value },
    }));
  };

  const handleViolationToggle = (type) => {
    setForm((prev) => {
      const current = prev.violation_types.includes(type)
        ? prev.violation_types.filter((t) => t !== type)
        : [...prev.violation_types, type];
      return { ...prev, violation_types: current };
    });
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (form.selectedReports.length === 0) {
        setError("Please select at least one report.");
        return;
      }

      if (!form.case_id) {
        form.case_id = generateCaseId();
      }

      const selected = reports.filter((r) =>
        form.selectedReports.includes(r._id)
      );
      const datesOccurred = selected.map(
        (r) => new Date(r.incident_details?.date)
      );
      const datesReported = selected.map((r) => new Date(r.created_at));

      const earliestOccurred = new Date(Math.min(...datesOccurred));
      const earliestReported = new Date(Math.min(...datesReported));

      setForm((prev) => ({
        ...prev,
        date_occurred:
          earliestOccurred instanceof Date && !isNaN(earliestOccurred)
            ? earliestOccurred.toISOString().split("T")[0]
            : "",
        date_reported:
          earliestReported instanceof Date && !isNaN(earliestReported)
            ? earliestReported.toISOString().split("T")[0]
            : "",
        case_id: form.case_id, // make sure case_id is saved here too
      }));

      // Advance to next step after setting form data
      setStep(2);
    } else if (step === 2) {
      // Add validations for step 2 here if needed

      setStep(3); // Move to step 3 or next
    } else {
      // Handle other steps as needed
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    try {
      // Debug: Check if user is available
      console.log("User object:", user);
      console.log("User ID:", user?._id);

      // Validate required fields before submission
      if (!user?.user_id) {
        alert("User information not available. Please log in again.");
        return;
      }

      if (!form.case_id) {
        alert("Case ID is required");
        return;
      }

      // Prepare the payload
      const payload = {
        ...form,
        // Ensure assigned_secretaria is always set
        assigned_secretaria: String(user.user_id), // Convert to string explicitly
        // Convert date strings to ISO format if needed
        date_occurred: form.date_occurred
          ? new Date(form.date_occurred).toISOString()
          : undefined,
        date_reported: form.date_reported
          ? new Date(form.date_reported).toISOString()
          : new Date().toISOString(), // Default to current date if not provided
        // Add any defaults or fix missing fields here
        victims: form.victims || [],
        witnesses: form.witnesses || [],
        perpetrators: form.perpetrators || [],
        updated_at: new Date().toISOString(),
      };

      // Debug: Log the payload
      console.log("Payload being sent:", payload);

      const response = await fetch("http://localhost:8000/api/cases/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Server error:", error);
        throw new Error(error.detail || "Failed to create case");
      }

      const data = await response.json();
      alert("Case created successfully, ID: " + data.id);
      await Promise.all(
        form.selectedReports.map(async (reportId) => {
          try {
            await fetch(
              `http://localhost:8000/api/incident_reports/${reportId}?status=turned-into-case`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );
            console.log(
              `✅ Report ${reportId} status updated to 'turned-into-case'`
            );
          } catch (err) {
            console.error(`❌ Failed to update report ${reportId}:`, err);
          }
        })
      );

      // Proceed to next step
      // setStep(4);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error creating case: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E9E7E3]">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#0D1B2A] rounded-full"></div>
        <p className="mt-4 text-[#0D1B2A]">Loading reports…</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar role={user?.role} />
        <main className="flex-1 bg-[#E9E7E3] p-8 overflow-y-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center mb-6 text-[#0D1B2A]"
          >
            <IoArrowBackOutline size={20} className="mr-2" /> Back
          </button>

          {/* Progress bar */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step === i
                      ? "bg-[#FFD128] text-[#0D1B2A]"
                      : step > i
                        ? "bg-[#0D1B2A] text-white"
                        : "bg-white text-[#9E788F] border-2 border-[#9E788F]"
                  }`}
                >
                  {i}
                </div>
                {i < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${step > i ? "bg-[#0D1B2A]" : "bg-[#9E788F]"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Select Reports */}
          {step === 1 && (
            <form className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">
                Step 1: Select Incident Reports
              </h2>
              {reports.length === 0 ? (
                <p className="text-center text-[#9E788F]">
                  No available reports assigned to you.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reports.map((r) => (
                    <label
                      key={r._id}
                      className={`block p-4 rounded border-2 cursor-pointer ${
                        form.selectedReports.includes(r._id)
                          ? "border-[#FFD128] bg-[#FFD128]/20"
                          : "border-[#E9E7E3] hover:border-[#9E788F]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={form.selectedReports.includes(r._id)}
                        onChange={() => handleReportSelection(r._id)}
                      />
                      <span className="font-semibold text-[#0D1B2A]">
                        {r.report_id}
                      </span>
                      <span className="block text-sm text-[#9E788F] mt-1">
                        {r.incident_details?.date
                          ? new Date(
                              r.incident_details.date
                            ).toLocaleDateString()
                          : "Unknown date"}{" "}
                        – {r.incident_details?.incident_title || "No title"}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {form.selectedReports.length > 0 && (
                <div className="mt-4 bg-[#E9E7E3] p-4 rounded">
                  <p className="text-[#0D1B2A]">
                    ✅ {form.selectedReports.length} selected.
                  </p>
                  <p className="text-xs text-[#9E788F]">
                    A case ID will be generated when you proceed.
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="px-4 py-2 bg-[#E9E7E3] text-[#9E788F] rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={form.selectedReports.length === 0}
                  className="px-4 py-2 bg-[#0D1B2A] text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 border-2 ">
              <h2 className="text-3xl font-bold text-[#0D1B2A] mb-6 border-b-4 border-[#FFD128] pb-2">
                Step 2: Case Details
              </h2>

              {/* Case ID */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Case ID
                </label>
                <input
                  type="text"
                  name="case_id"
                  value={form.case_id}
                  onChange={handleChange}
                  placeholder="CASE-YYYY-MM-DD-optional(COUNT)"
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] font-semibold placeholder-[#FFD128] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                />
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                />
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Violation Types */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-3">
                  Violation Types
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {form.violation_types
                    .concat(
                      // Add any report violation types missing from original list, checked by default
                      form.violation_types
                        .filter((v) => !violationTypes.includes(v))
                        .filter((v, i, arr) => arr.indexOf(v) === i)
                    )
                    .map((type, idx) => (
                      <label
                        key={`${type}-${idx}`}
                        className="flex items-center space-x-2 text-[#0D1B2A] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={form.violation_types.includes(type)}
                          onChange={() => handleViolationToggle(type)}
                          className="w-5 h-5 rounded border-[#FFD128] focus:ring-[#FFD128]"
                        />
                        <span className="capitalize">
                          {type.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}

                  {/* If some violation types from original list are missing from form.violation_types, render those too */}
                  {violationTypes
                    .filter((type) => !form.violation_types.includes(type))
                    .map((type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-2 text-[#0D1B2A] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={form.violation_types.includes(type)}
                          onChange={() => handleViolationToggle(type)}
                          className="w-5 h-5 rounded border-[#FFD128] focus:ring-[#FFD128]"
                        />
                        <span className="capitalize">
                          {type.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Perpetrator Name */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Perpetrator Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.perpetrator.name}
                  onChange={handlePerpetratorChange}
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                />
              </div>

              {/* Perpetrator Type */}
              <div className="mb-6">
                <label className="block text-[#0D1B2A] font-semibold mb-2">
                  Perpetrator Type
                </label>
                <select
                  name="type"
                  value={form.perpetrator.type}
                  onChange={handlePerpetratorChange}
                  className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                >
                  <option value="">Select type</option>
                  {perpetratorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="flex gap-6 mb-6">
                <div className="flex-1">
                  <label className="block text-[#0D1B2A] font-semibold mb-2">
                    Date Occurred
                  </label>
                  <input
                    type="date"
                    name="date_occurred"
                    value={form.date_occurred}
                    onChange={handleChange}
                    className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[#0D1B2A] font-semibold mb-2">
                    Date Reported
                  </label>
                  <input
                    type="date"
                    name="date_reported"
                    value={form.date_reported}
                    onChange={handleChange}
                    className="w-full border-2 border-[#FFD128] rounded-lg px-4 py-3 text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#FFD128]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 bg-[#FFD128] text-black font-semibold rounded-lg hover:bg-[#e6b800] transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#0D1B2A] text-white font-bold rounded-lg hover:bg-[#122436] transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
          )}
          {/* Step 3: Evidence & Participants */}
          {step === 3 && (
            <form className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">
                Step 3: Evidence & Participants
              </h2>

              {/* Inherited Evidence */}
              <div className="mb-8">
                <h3 className="font-semibold text-[#0D1B2A] mb-4">
                  Inherited Evidence
                </h3>

                {reports
                  .filter((r) => form.selectedReports.includes(r._id))
                  .flatMap((r) => r.evidence || []).length === 0 && (
                  <p className="text-gray-600">No inherited evidence.</p>
                )}

                {reports
                  .filter((r) => form.selectedReports.includes(r._id))
                  .flatMap((r) => r.evidence || [])
                  .map((item, idx) => {
                    const fileUrl = `http://localhost:8000${item.url}`;
                    return (
                      <div
                        key={idx}
                        className="mb-6 border rounded-md p-4 shadow-sm bg-[#E9E7E3]"
                      >
                        <p className="font-semibold text-[#0D1B2A] mb-1">
                          Type: {item.type}
                        </p>
                        <p className="mb-2">{item.description}</p>

                        {item.type === "video" && (
                          <video
                            src={fileUrl}
                            controls
                            className="rounded-md shadow max-w-full"
                            style={{ maxHeight: 300 }}
                          />
                        )}
                        {item.type === "pdf" && (
                          <iframe
                            src={fileUrl}
                            title={`PDF Evidence ${idx}`}
                            className="rounded-md shadow w-full"
                            style={{ height: 400 }}
                          />
                        )}
                        {item.type === "image" && (
                          <img
                            src={fileUrl}
                            alt="Evidence"
                            className="max-w-full h-auto rounded-md shadow"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Victims */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0D1B2A] mb-2">Victims</h3>

                {/* Inherited Victims from Selected Reports */}
                <div className="mb-4">
                  <h4 className="font-medium text-[#0D1B2A] mb-2">
                    From Selected Reports:
                  </h4>
                  {inheritedVictims.length === 0 ? (
                    <p className="text-gray-600 italic">
                      No victims inherited from selected reports.
                    </p>
                  ) : (
                    <ul className="list-disc ml-6 text-[#0D1B2A]">
                      {inheritedVictims.map((v) => (
                        <li key={v.id}>
                          {v.name || `Victim ${v.id}`} (ID: {v.id})
                          <span className="italic text-gray-500 ml-2">
                            (inherited)
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Additional Victims */}
                <div className="mb-4">
                  <h4 className="font-medium text-[#0D1B2A] mb-2">
                    Additional Victims:
                  </h4>
                  {form.additionalVictims &&
                    form.additionalVictims.length > 0 && (
                      <ul className="list-disc ml-6 text-[#0D1B2A] mb-2">
                        {form.additionalVictims.map((victimId) => {
                          const victim = allVictims.find(
                            (v) => v.id === victimId
                          );
                          return (
                            <li key={victimId}>
                              {victim?.name || `Victim ${victimId}`} (ID:{" "}
                              {victimId})
                              <button
                                type="button"
                                onClick={() => removeAdditionalVictim(victimId)}
                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                  <button
                    type="button"
                    onClick={() => setShowVictimModal(true)}
                    className="bg-[#415A77] text-white px-4 py-2 rounded-lg hover:bg-[#0D1B2A] transition-colors"
                  >
                    Add New Victim
                  </button>
                </div>
              </div>

              {/* Witnesses */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#0D1B2A] mb-2">Witnesses</h3>

                {/* Inherited Witnesses from Selected Reports */}
                <div className="mb-4">
                  <h4 className="font-medium text-[#0D1B2A] mb-2">
                    From Selected Reports:
                  </h4>
                  {inheritedWitnesses.length === 0 ? (
                    <p className="text-gray-600 italic">
                      No witnesses inherited from selected reports.
                    </p>
                  ) : (
                    <ul className="list-disc ml-6 text-[#0D1B2A]">
                      {inheritedWitnesses.map((w) => (
                        <li key={w.id}>
                          {w.name || `Witness ${w.id}`} (ID: {w.id})
                          <span className="italic text-gray-500 ml-2">
                            (inherited)
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Additional Witnesses */}
                <div className="mb-4">
                  <h4 className="font-medium text-[#0D1B2A] mb-2">
                    Additional Witnesses:
                  </h4>
                  {form.additionalWitnesses &&
                    form.additionalWitnesses.length > 0 && (
                      <ul className="list-disc ml-6 text-[#0D1B2A] mb-2">
                        {form.additionalWitnesses.map((witnessId) => {
                          const witness = allWitnesses.find(
                            (w) => w.id === witnessId
                          );
                          return (
                            <li key={witnessId}>
                              {witness?.name || `Witness ${witnessId}`} (ID:{" "}
                              {witnessId})
                              <button
                                type="button"
                                onClick={() =>
                                  removeAdditionalWitness(witnessId)
                                }
                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                  <button
                    type="button"
                    onClick={() => setShowWitnessModal(true)}
                    className="bg-[#415A77] text-white px-4 py-2 rounded-lg hover:bg-[#0D1B2A] transition-colors"
                  >
                    Add New Witness
                  </button>
                </div>
              </div>

              {/* Victim Selection Modal */}
              {showVictimModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4">
                      Select Victims
                    </h3>

                    {allVictims.length === 0 ? (
                      <p className="text-gray-600">No victims available.</p>
                    ) : (
                      <div className="space-y-2">
                        {allVictims
                          .filter(
                            (v) =>
                              !inheritedVictims.some((iv) => iv.id === v.id) &&
                              !(form.additionalVictims || []).includes(v.id)
                          )
                          .map((victim) => (
                            <label
                              key={victim.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedVictimsInModal.includes(
                                  victim.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVictimsInModal((prev) => [
                                      ...prev,
                                      victim.id,
                                    ]);
                                  } else {
                                    setSelectedVictimsInModal((prev) =>
                                      prev.filter((id) => id !== victim.id)
                                    );
                                  }
                                }}
                                className="rounded border-[#0D1B2A]"
                              />
                              <span>
                                {victim.name || `Victim ${victim.id}`} (ID:{" "}
                                {victim.id})
                              </span>
                            </label>
                          ))}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVictimModal(false);
                          setSelectedVictimsInModal([]);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addSelectedVictims}
                        className="px-4 py-2 bg-[#415A77] text-white rounded hover:bg-[#0D1B2A]"
                      >
                        Add Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Witness Selection Modal */}
              {showWitnessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4">
                      Select Witnesses
                    </h3>

                    {allWitnesses.length === 0 ? (
                      <p className="text-gray-600">No witnesses available.</p>
                    ) : (
                      <div className="space-y-2">
                        {allWitnesses
                          .filter(
                            (w) =>
                              !inheritedWitnesses.some(
                                (iw) => iw.id === w.id
                              ) &&
                              !(form.additionalWitnesses || []).includes(w.id)
                          )
                          .map((witness) => (
                            <label
                              key={witness.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedWitnessesInModal.includes(
                                  witness.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedWitnessesInModal((prev) => [
                                      ...prev,
                                      witness.id,
                                    ]);
                                  } else {
                                    setSelectedWitnessesInModal((prev) =>
                                      prev.filter((id) => id !== witness.id)
                                    );
                                  }
                                }}
                                className="rounded border-[#0D1B2A]"
                              />
                              <span>
                                {witness.name || `Witness ${witness.id}`} (ID:{" "}
                                {witness.id})
                              </span>
                            </label>
                          ))}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWitnessModal(false);
                          setSelectedWitnessesInModal([]);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addSelectedWitnesses}
                        className="px-4 py-2 bg-[#415A77] text-white rounded hover:bg-[#0D1B2A]"
                      >
                        Add Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 bg-[#FFD128] text-black rounded-lg hover:bg-[#e6b800] transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-[#0D1B2A] text-white font-bold rounded-lg hover:bg-[#122436] transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          )}

          {/* Placeholder for upcoming steps */}
        </main>
      </div>
    </>
  );
}
