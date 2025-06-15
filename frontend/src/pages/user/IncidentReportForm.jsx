import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../../components/user_homepage/Header";


const IncidentReportForm = () => {
  const [form, setForm] = useState({
    reporter_type: "victim",
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

  const handleEvidenceUpload = async (file) => {
    if (!isValidFileType(file)) {
        alert("Only image, PDF, and video files are allowed.");
    return;
  }

    const formData = new FormData();
    formData.append("file", file);
    
    // Determine file type
    let fileType;
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf') fileType = 'pdf';
    
    formData.append("type", fileType);
    formData.append("description", "Uploaded via incident form");
    if (currentReportId) {
      formData.append("report_id", currentReportId);
    }

    try {
      const res = await fetch("http://localhost:8000/api/evidence", {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setForm((prev) => ({
          ...prev,
          evidence: [...prev.evidence, {
            url: data.url,
            type: data.type,
            description: data.description
          }]
        }));
      } else {
        throw new Error(data.detail || 'Upload failed');
      }
    } catch (error) {
      console.error("Evidence upload failed:", error);
      alert("Failed to upload evidence. Please try again.");
    }
  };

  // Handle file selection for evidence
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 200 MB

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
    alert("The total size of selected evidence files exceeds 200 MB. Please select smaller files.");
    e.target.value = '';
    return;
  }

  setEvidenceFiles(files);
};

  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = JSON.parse(JSON.stringify(form));
  
    // Calculate age
    if (payload.victim_details?.demographics?.birthdate) {
      payload.victim_details.demographics.age = calculateAge(
        payload.victim_details.demographics.birthdate
      );
    }
  
    // Handle anonymous logic
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
        alert("The total upload size exceeds the 200 MB limit. Please reduce the size of your evidence files and try again.");
        return;  // Stop submission so user can retry
      }
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.detail || 'Report submission failed');
      }
  
      setCurrentReportId(data.id);
      alert("Report submitted successfully with evidence!");
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
    
    // Update the form state with the uploaded evidence
    setForm((prev) => ({
      ...prev,
      evidence: [...prev.evidence, {
        url: data.url,
        type: data.type,
        description: data.description
      }]
    }));
    
    return data;
  };

  // Determine when to show reporter contact info
  const showReporterContactInfo = form.reporter_type === "witness" && !form.anonymous;
  
  // Determine when to show victim details
  const showVictimDetails = form.reporter_type === "victim" || 
    (form.reporter_type === "witness" && !form.anonymous);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Header />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-8">
          <h2 className="text-2xl font-semibold border-b pb-2">Submit Incident Report</h2>

          {/* Reporter Type */}
          <section>
            <label className="block font-semibold mb-1">Reporter Type</label>
            <select
              name="reporter_type"
              value={form.reporter_type}
              onChange={(e) => handleChange(e)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="victim">Victim</option>
              <option value="witness">Witness</option>
              <option value="other">Other</option>
            </select>
          </section>

          {/* Anonymous checkbox - only show for witness and other */}
          {(form.reporter_type === "witness" || form.reporter_type === "other" || form.reporter_type === "victim") && (
            <section>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="anonymous"
                  checked={form.anonymous}
                  onChange={(e) => handleChange(e)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Submit Anonymously</span>
              </label>
            </section>
          )}

          {/* Reporter Contact info - only for witnesses who are not anonymous */}
          {showReporterContactInfo && (
            <section>
              <h3 className="font-semibold mb-2">Your Contact Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.contact_info.email}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.contact_info.phone}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Preferred Contact</label>
                  <select
                    name="preferred_contact"
                    value={form.contact_info.preferred_contact}
                    onChange={(e) => handleChange(e, ["contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Incident Details */}
          <section>
            <h3 className="font-semibold mb-2">Incident Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Date of Incident</label>
                <input
                  type="date"
                  name="date"
                  value={form.incident_details.date}
                  onChange={(e) => handleChange(e, ["incident_details"])}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  name="incident_title"
                  value={form.incident_details.incident_title}
                  onChange={(e) => handleChange(e, ["incident_details"])}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.incident_details.description}
                  onChange={(e) => handleChange(e, ["incident_details"])}
                  className="w-full p-2 border border-gray-300 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Violation Types (dropdown) */}
          <section>
            <label className="block font-semibold mb-1">Violation Types</label>
            <select
              multiple
              value={form.incident_details.violation_types}
              onChange={handleMultiSelect}
              className="w-full p-2 border border-gray-300 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {violationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
          </section>

          {/* Location on Map */}
          <section>
            <label className="block font-semibold mb-1">Incident Location (Click on map)</label>
            <div id="map" style={{ height: "300px" }} className="mb-4 rounded border" />
            <div className="bg-gray-50 p-3 rounded">
              <div><strong>Country:</strong> {form.incident_details.location.country || "-"}</div>
              <div><strong>City:</strong> {form.incident_details.location.city || "-"}</div>
              <div><strong>Coordinates:</strong>{" "}
                {form.incident_details.location.coordinates.coordinates.length === 2
                  ? `${form.incident_details.location.coordinates.coordinates[1].toFixed(5)}, ${form.incident_details.location.coordinates.coordinates[0].toFixed(5)}`
                  : "-"}
              </div>
            </div>
          </section>

          {/* Evidence Upload - only image, pdf, video */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Upload Evidence</h3>
            <p className="text-sm text-gray-600">Only images, PDFs, and videos are allowed</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {evidenceFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {file.type.split('/')[0].toUpperCase()}
                      </span>
                      <span>{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Victim Details - shown for victims or non-anonymous witnesses */}
          {showVictimDetails && (
            <section>
              <h3 className="font-semibold mb-2">Victim Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.victim_details.demographics.first_name}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.victim_details.demographics.last_name}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.victim_details.demographics.gender}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={form.victim_details.demographics.birthdate}
                    onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.victim_details.demographics.birthdate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Age: {calculateAge(form.victim_details.demographics.birthdate)}
                    </p>
                  )}
                </div>

                <h4 className="mt-6 font-semibold">Victim Contact Info</h4>
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.victim_details.contact_info.email}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.victim_details.contact_info.phone}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Preferred Contact</label>
                  <select
                    name="preferred_contact"
                    value={form.victim_details.contact_info.preferred_contact}
                    onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentReportForm;
