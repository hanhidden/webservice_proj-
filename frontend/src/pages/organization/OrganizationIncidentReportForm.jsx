import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../auth";
import Header from "../../components/All/header";
import Sidebar from "../../components/user_homepage/Sidebar";

const OrganizationIncidentReportForm = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    reporter_type: "organization",
    reporter_id: null, // Will be set to organization user ID
    anonymous: false,
    contact_info: { email: "", phone: "", preferred_contact: "email" },
    incident_details: {
      date: "",
      incident_title: "",
      description: "",
      location: {
        country: "",
        city: "",
        coordinates: { type: "Point", coordinates: [] },
      },
      violation_types: [],
    },
    evidence: [],
    victim_details: {
      demographics: {
        first_name: "",
        last_name: "",
        gender: "",
        birthdate: "",
      },
      contact_info: { email: "", phone: "", preferred_contact: "email" },
    },
  });

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Predefined violation types
  const violationTypes = [
    { value: "physical_violence", label: "Physical Violence" },
    { value: "verbal_abuse", label: "Verbal Abuse" },
    { value: "discrimination", label: "Discrimination" },
    { value: "psychological_abuse", label: "Psychological Abuse" },
    { value: "economic_abuse", label: "Economic Abuse" },
    { value: "stalking", label: "Stalking" },
    { value: "cyberbullying", label: "Cyberbullying" },
    { value: "hate_crime", label: "Hate Crime" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    // Get organization user ID from authenticated user
    const orgId = user?.user_id;
    if (orgId) {
      setOrganizationId(orgId);
      setForm(prev => ({
        ...prev,
        reporter_id: orgId
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([31.5, 35.0], 8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
      
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.remove();
        }
        markerRef.current = L.marker([lat, lng]).addTo(map);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            incident_details: {
              ...prev.incident_details,
              location: {
                country: data.address?.country || "",
                city: data.address?.city || data.address?.town || data.address?.village || "",
                coordinates: {
                  type: "Point",
                  coordinates: [lng, lat],
                },
              },
            },
          }));
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        }
      });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle change for inputs including nested fields
  const handleChange = (e, fieldPath = []) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    let path = [...fieldPath, name];

    setForm((prev) => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = val;
      return updated;
    });
  };

  const handleReporterTypeChange = (e) => {
    const newReporterType = e.target.value;
    setForm(prev => ({
      ...prev,
      reporter_type: newReporterType,
      reporter_id: newReporterType === "organization" ? organizationId : null
    }));
  };

  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setForm((prev) => ({
      ...prev,
      incident_details: {
        ...prev.incident_details,
        violation_types: options,
      },
    }));
  };

  // Calculate age from birthdate string
  const calculateAge = (birthdateString) => {
    if (!birthdateString) return null;
    const birthDate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate file type - only allow image, pdf, video
  const isValidFileType = (file) => {
    const allowedTypes = ['image/', 'video/', 'application/pdf'];
    return allowedTypes.some(type => file.type.startsWith(type));
  };

  // Handle file selection for evidence
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate all file types
    const invalidFiles = files.filter(file => !isValidFileType(file));
    if (invalidFiles.length > 0) {
      alert("Invalid file types detected. Only images, PDFs, and videos are allowed.");
      e.target.value = '';
      return;
    }

    // Calculate total size
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert("The total size of selected evidence files exceeds 15 MB. Please select smaller files.");
      e.target.value = '';
      return;
    }

    setEvidenceFiles(files);
  };

  const handleSubmit = async () => {
  
    const payload = JSON.parse(JSON.stringify(form));
  
    // Calculate age
    if (payload.victim_details?.demographics?.birthdate) {
      payload.victim_details.demographics.age = calculateAge(
        payload.victim_details.demographics.birthdate
      );
    }
  
    // Handle contact info based on reporter type and anonymous status
    if (form.reporter_type === "witness" && form.anonymous) {
      payload.contact_info = {
        email: "anonymous",
        phone: "anonymous",
        preferred_contact: "anonymous"
      };
    } else if (form.reporter_type === "victim") {
      payload.contact_info = {
        email: null,
        phone: null,
        preferred_contact: null
      };
    } else if (form.reporter_type === "organization") {
      // Keep organization contact info as provided
      payload.reporter_id = organizationId;
    }
  
    const cleanField = (obj, field) => {
      if (obj[field] === "") obj[field] = null;
    };
  
    if (payload.victim_details?.demographics) {
      cleanField(payload.victim_details.demographics, 'first_name');
      cleanField(payload.victim_details.demographics, 'last_name');
      cleanField(payload.victim_details.demographics, 'gender');
      cleanField(payload.victim_details.demographics, 'birthdate');
    }
  
    if (payload.victim_details?.contact_info) {
      cleanField(payload.victim_details.contact_info, 'email');
      cleanField(payload.victim_details.contact_info, 'phone');
    }
  
    try {
      // Upload evidence files first
      let uploadedEvidence = [];
  
      if (evidenceFiles.length > 0) {
        for (let i = 0; i < evidenceFiles.length; i++) {
          const file = evidenceFiles[i];
          const uploaded = await uploadSingleEvidence(file, null);
          uploadedEvidence.push({
            url: uploaded.url,
            type: uploaded.type,
            description: uploaded.description
          });
        }
      }
  
      payload.evidence = uploadedEvidence;
  
      const res = await fetch("http://localhost:8000/api/incident_reports/reports", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      if (res.status === 413) {
        alert("The total upload size exceeds the limit. Please reduce the size of your evidence files and try again.");
        return;
      }
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.detail || 'Report submission failed');
      }
  
      setCurrentReportId(data.id);
      alert("Report submitted successfully!");
      
      // Reset form
      setForm({
        reporter_type: "organization",
        reporter_id: organizationId,
        anonymous: false,
        contact_info: { email: "", phone: "", preferred_contact: "email" },
        incident_details: {
          date: "",
          incident_title: "",
          description: "",
          location: {
            country: "",
            city: "",
            coordinates: { type: "Point", coordinates: [] },
          },
          violation_types: [],
        },
        evidence: [],
        victim_details: {
          demographics: {
            first_name: "",
            last_name: "",
            gender: "",
            birthdate: "",
          },
          contact_info: { email: "", phone: "", preferred_contact: "email" },
        },
      });
      setEvidenceFiles([]);
      
    } catch (err) {
      alert(`Error submitting report: ${err.message}`);
    }
  };
  
  // Helper function to upload a single evidence file
  const uploadSingleEvidence = async (file, reportId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    
    // Determine file type
    let fileType;
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf') fileType = 'pdf';
    
    formData.append("type", fileType);
    formData.append("description", "Uploaded via incident form");
    formData.append("report_id", reportId);
  
    const res = await fetch("http://localhost:8000/api/evidence/", {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  };

  // Determine when to show reporter contact info
  const showReporterContactInfo = 
    (form.reporter_type === "witness" && !form.anonymous) ||
    form.reporter_type === "organization";
  
  // Determine when to show victim details
  const showVictimDetails = form.reporter_type === "victim" || 
    (form.reporter_type === "witness" && !form.anonymous) ||
    form.reporter_type === "organization";

return (
  <>
    <Header />

    <div className="flex h-screen">
       <Sidebar role="organization" />
      <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto py-10 px-4">
       
        <div
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-8"
        >
          {/* Title */}
          <div className="border-b pb-4">
            <h2 className="text-3xl font-bold text-gray-900">Submit Incident Report</h2>
            <p className="text-gray-600 mt-2">Report incidents on behalf of your organization</p>
          </div>

          {/* Reporter Type */}
          <section>
            <label className="block font-semibold mb-3 text-lg">Reporter Type</label>
            <select
              name="reporter_type"
              value={form.reporter_type}
              onChange={handleReporterTypeChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="victim">Victim</option>
              <option value="witness">Witness</option>
              <option value="organization">Organization</option>
            </select>
            {form.reporter_type === "organization" && (
              <p className="text-sm text-blue-600 mt-2">
                Reporting as: Organization (ID: {organizationId})
              </p>
            )}
          </section>

          {/* Anonymous Checkbox */}
          {(form.reporter_type === "witness" || form.reporter_type === "victim") && (
            <section>
              <label className="inline-flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={form.anonymous}
                  onChange={(e) => handleChange(e)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-lg">Submit Anonymously</span>
              </label>
            </section>
          )}

          {/* Reporter Contact Info */}
          {showReporterContactInfo && (
            <section className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">
                {form.reporter_type === "organization"
                  ? "Organization Contact Info"
                  : "Your Contact Info"}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.contact_info.email}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.contact_info.phone}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium mb-2">Preferred Contact Method</label>
                  <select
                    name="preferred_contact"
                    value={form.contact_info.preferred_contact}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Incident Details */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4 text-lg">Incident Details</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Date of Incident</label>
                  <input
                    type="date"
                    name="date"
                    value={form.incident_details.date}
                    onChange={(e) => handleChange(e, ["incident_details"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Incident Title</label>
                  <input
                    type="text"
                    name="incident_title"
                    value={form.incident_details.incident_title}
                    onChange={(e) => handleChange(e, ["incident_details"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief title describing the incident"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.incident_details.description}
                  onChange={(e) => handleChange(e, ["incident_details"])}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed description of the incident..."
                  required
                />
              </div>
            </div>
          </section>

          {/* Violation Types */}
          <section>
            <label className="block font-semibold mb-3 text-lg">Violation Types</label>
            <select
              multiple
              value={form.incident_details.violation_types}
              onChange={handleMultiSelect}
              className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {violationTypes.map((type) => (
                <option key={type.value} value={type.value} className="py-2">
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-2">
              Hold Ctrl (or Cmd on Mac) to select multiple options
            </p>
          </section>

          {/* Location Map */}
          <section>
            <label className="block font-semibold mb-3 text-lg">Incident Location</label>
            <p className="text-gray-600 mb-4">Click on the map to select the incident location</p>
            <div
              id="map"
              style={{ height: "350px" }}
              className="mb-4 rounded-lg border-2 border-gray-300"
            />
            <div className="bg-gray-100 p-4 rounded-lg grid md:grid-cols-3 gap-4">
              <div><strong>Country:</strong> {form.incident_details.location.country || "Not selected"}</div>
              <div><strong>City:</strong> {form.incident_details.location.city || "Not selected"}</div>
              <div>
                <strong>Coordinates:</strong>{" "}
                {form.incident_details.location.coordinates.coordinates.length === 2
                  ? `${form.incident_details.location.coordinates.coordinates[1].toFixed(5)}, ${form.incident_details.location.coordinates.coordinates[0].toFixed(5)}`
                  : "Not selected"}
              </div>
            </div>
          </section>

          {/* Evidence Upload */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Upload Evidence</h3>
            <p className="text-sm text-gray-600 mb-4">
              Only images, PDFs, and videos are allowed (Max 15MB total)
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {evidenceFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {evidenceFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 bg-white rounded border">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {file.type.split("/")[0].toUpperCase()}
                      </span>
                      <span className="flex-1 text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Victim Details */}
          {showVictimDetails && (
            <section className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">Victim Details</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.victim_details.demographics.first_name}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.victim_details.demographics.last_name}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={form.victim_details.demographics.gender}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={form.victim_details.demographics.birthdate}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.victim_details.demographics.birthdate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Age: {calculateAge(form.victim_details.demographics.birthdate)}
                    </p>
                  )}
                </div>
              </div>

              <h4 className="font-semibold mb-4">Victim Contact Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.victim_details.contact_info.email}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.victim_details.contact_info.phone}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium mb-2">Preferred Contact Method</label>
                  <select
                    name="preferred_contact"
                    value={form.victim_details.contact_info.preferred_contact}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Submit Incident Report
          </button>
        </div>
      </div>
    </div>
      </main>

    </div>
  
  </>
);

    
};

export default OrganizationIncidentReportForm;