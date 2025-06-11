import React, { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { Link } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { TrashIcon } from "@heroicons/react/24/outline";

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

const ethnicities = [
  "Arab",
  "Asian",
  "Black",
  "Hispanic",
  "White",
  "Native American",
  "Pacific Islander",
];
const occupations = ["Student", "Employed", "Unemployed", "Retired"];

export default function Admin_NewVictimForm() {
  const { user } = useAuth();

  const [availableCases, setAvailableCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    anonymous: false,
    demographics: {
      first_name: "",
      last_name: "",
      gender: "",
      age: "",
      birthdate: "",
      ethnicity: "",
      occupation: "",
    },
    contact_info: {
      email: "",
      phone: "",
    },
    cases_involved: [],
    risk_assessment: {
      level: "",
      threats: [],
      protection_needed: false,
    },
    support_services: [],
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === "checkbox" ? checked : value;

    // Handle nested names like "demographics.first_name"
    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      // Special case: if birthdate changes inside demographics, calculate age and update both
      if (parent === "demographics" && child === "birthdate") {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        setFormData((prev) => ({
          ...prev,
          demographics: {
            ...prev.demographics,
            birthdate: value,
            age: age,
          },
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: updatedValue,
        },
      }));
    } else {
      if (name === "birthdate") {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        setFormData((prev) => ({
          ...prev,
          birthdate: value,
          age: age,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    }
  };

  const handleSupportServiceChange = (index, field, value) => {
    const updatedServices = [...formData.support_services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      support_services: updatedServices,
    });
  };

  const addSupportService = () => {
    setFormData({
      ...formData,
      support_services: [
        ...formData.support_services,
        { type: "", provider: "", status: "" },
      ],
    });
  };

  const removeSupportService = (index) => {
    const updatedServices = formData.support_services.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      support_services: updatedServices,
    });
  };

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/cases/getall");
        setAvailableCases(res.data.case_ids || []);
      } catch (err) {
        console.error("Failed to load case IDs:", err);
      } finally {
        setLoadingCases(false);
      }
    }
    loadCases();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting formData:", formData);
    try {
      await axios.post("http://localhost:8000/api/victims", formData);
      alert("Victim created successfully!");

      setFormData(initialFormData);

      setSuccessMessage("Victim created successfully!");

      setStep(1);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        "Error creating victim: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const totalSteps = 6;

  const [setSuccessMessage] = useState("");
  const initialFormData = {
    name: "",
    age: "",
    // ...
  };

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
          <div className="flex justify-center mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mx-1
                        ${
                          step === i + 1
                            ? "bg-[#132333] text-white"
                            : "bg-gray-300 text-gray-700"
                        }
                    `}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#132333]">
              New Victim/Witness
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Type:</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="victim">Victim</option>
                      <option value="witness">Witness</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={formData.anonymous}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="font-semibold">Anonymous</label>
                  </div>
                </div>
              )}

              {/* STEP 2 */}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block font-semibold mb-1">
                      First Name:
                    </label>
                    <input
                      name="demographics.first_name"
                      value={formData.demographics.first_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Last Name:
                    </label>
                    <input
                      name="demographics.last_name"
                      value={formData.demographics.last_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block font-semibold mb-1">Gender:</label>
                    <select
                      name="demographics.gender"
                      value={formData.demographics.gender}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.demographics.gender === "Other" && (
                      <input
                        type="text"
                        name="demographics.gender_other"
                        placeholder="Please specify"
                        value={formData.demographics.gender_other || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                      />
                    )}
                  </div>

                  {/* Birthdate */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Birthdate:
                    </label>
                    <input
                      name="demographics.birthdate"
                      type="date"
                      value={formData.demographics.birthdate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  {/* Ethnicity */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Ethnicity:
                    </label>

                    <select
                      name="demographics.ethnicity"
                      value={formData.demographics.ethnicity}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select Ethnicity</option>
                      {ethnicities.map((ethnicity) => (
                        <option key={ethnicity} value={ethnicity}>
                          {ethnicity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Occupation:
                    </label>
                    <select
                      name="demographics.occupation"
                      value={formData.demographics.occupation}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select Occupation</option>
                      {occupations.map((occupation) => (
                        <option key={occupation} value={occupation}>
                          {occupation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Email:</label>
                    <input
                      name="contact_info.email"
                      type="email"
                      value={formData.contact_info.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Phone:</label>
                    <input
                      name="contact_info.phone"
                      value={formData.contact_info.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 */}

              {step === 4 && (
                <div className="space-y-4">
                  <label className="block font-semibold mb-1">
                    Cases Involved :
                  </label>

                  <p className="text-sm text-gray-500">
                    Select case IDs from the dropdown, or edit the text field
                    directly. Leave empty if no case yet.
                  </p>
                  {loadingCases ? (
                    <p className="text-gray-600">Loading cases…</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Dropdown to add a case */}
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            if (formData.cases_involved.includes(val)) {
                              alert(`Case ID "${val}" is already selected.`);
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                cases_involved: [...prev.cases_involved, val],
                              }));
                            }
                          }
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">Select a case to add</option>
                        {availableCases.map(({ _id, case_id }) => (
                          <option key={_id} value={case_id}>
                            {case_id}
                          </option>
                        ))}
                      </select>

                      {/* Editable text input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.cases_involved.join(", ")}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cases_involved: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0),
                            }))
                          }
                          placeholder="Enter case IDs, separated by commas"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />

                        {/* Clear button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              cases_involved: [],
                            }))
                          }
                          className="flex items-center space-x-1 text-red-600 bg-red-100 border border-red-300 px-3 py-2 rounded hover:bg-red-50 hover:border-red-400 transition"
                        >
                          <TrashIcon className="w-5 h-5" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">
                      Risk Level:
                    </label>
                    <select
                      name="risk_assessment.level"
                      value={formData.risk_assessment.level}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select</option>
                      {riskLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Threats:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {threatOptions.map((threat) => (
                        <label
                          key={threat}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            name="risk_assessment.threats"
                            value={threat}
                            checked={formData.risk_assessment.threats.includes(
                              threat
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => {
                                const current =
                                  prev.risk_assessment.threats || [];
                                return {
                                  ...prev,
                                  risk_assessment: {
                                    ...prev.risk_assessment,
                                    threats: checked
                                      ? [...current, threat]
                                      : current.filter((t) => t !== threat),
                                  },
                                };
                              });
                            }}
                          />
                          <span>{threat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="risk_assessment.protection_needed"
                      checked={formData.risk_assessment.protection_needed}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="font-semibold">Protection Needed</label>
                  </div>
                </div>
              )}

              {/* STEP 6 - Support Services */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-2">Support Services:</h3>
                  {formData.support_services.map((service, index) => (
                    <div key={index} className="border p-4 rounded bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-semibold mb-1">
                            Type:
                          </label>
                          <input
                            value={service.type}
                            onChange={(e) =>
                              handleSupportServiceChange(
                                index,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">
                            Provider:
                          </label>
                          <input
                            value={service.provider}
                            onChange={(e) =>
                              handleSupportServiceChange(
                                index,
                                "provider",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">
                            Status:
                          </label>
                          <select
                            value={service.status}
                            onChange={(e) =>
                              handleSupportServiceChange(
                                index,
                                "status",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2"
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
                        onClick={() => removeSupportService(index)}
                        className="mt-2 bg-[#fbbe24bd] text-white px-2 py-1 rounded hover:bg-[#fbbe247a]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSupportService}
                    className="bg-[#fbbe24bd] text-white px-4 py-2 rounded hover:bg-[#fbbe247a]"
                  >
                    Add Support Service
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Back
                  </button>
                )}
                {step < 6 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#fbbe24bd] text-white px-4 py-2 rounded hover:bg-[#fbbe247a] ml-auto"
                  >
                    Next
                  </button>
                )}
                {step === 6 && (
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
