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
                city:
                  data.address?.city ||
                  data.address?.town ||
                  data.address?.village ||
                  "",
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

 
const handleEvidenceUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", file.type.split("/")[0]); // "video", "image", or "pdf"
  formData.append("description", "Uploaded via incident form");
  formData.append("report_id", currentReportId);  // <-- Add this field


  try {
    const res = await axios.post("http://localhost:8000/api/evidence", formData);
    setForm((prev) => ({
      ...prev,
      evidence: [...prev.evidence, {
        url: res.data.url,
        type: res.data.type,
        description: res.data.description
      }]
    }));
  } catch (error) {
    console.error("Evidence upload failed:", error);
  }
};

  

  // Handle file selection for evidence

  const handleFileChange = async (e) => {
    const files = e.target.files;
    for (let file of files) {
      await handleEvidenceUpload(file);
    }
  };
  


  // Upload evidence files to backend and return array of uploaded file info
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // No need to upload again, evidence already uploaded by handleEvidenceUpload
    const payload = JSON.parse(JSON.stringify(form));
  
    // Calculate age
    if (payload.victim_details?.demographics) {
      payload.victim_details.demographics.age = calculateAge(
        payload.victim_details.demographics.birthdate
      );
    }
  
    // Clean up optional fields
    if (payload.contact_info) {
      if (payload.contact_info.email === "") payload.contact_info.email = null;
      if (payload.contact_info.phone === "") payload.contact_info.phone = null;
    }
  
    if (payload.victim_details?.demographics) {
      if (payload.victim_details.demographics.first_name === "")
        payload.victim_details.demographics.first_name = null;
      if (payload.victim_details.demographics.last_name === "")
        payload.victim_details.demographics.last_name = null;
      if (payload.victim_details.demographics.gender === "")
        payload.victim_details.demographics.gender = null;
    }
  
    if (payload.victim_details?.contact_info) {
      if (payload.victim_details.contact_info.email === "")
        payload.victim_details.contact_info.email = null;
      if (payload.victim_details.contact_info.phone === "")
        payload.victim_details.contact_info.phone = null;
    }
  
    try {
      console.log("Sending payload:", payload);
      const res = await axios.post(
        "http://localhost:8000/api/incident_report/reports",
        payload
      );
      setCurrentReportId(res.data.id);
      alert("Report submitted successfully!");
      console.log("Response:", res.data);
    } catch (err) {
      console.error("Error submitting report:", err);
      if (err.response?.data?.detail) {
        alert("Error submitting report. Please check the form data for errors.");
      } else {
        alert("Error submitting report. Please try again.");
      }
    }
  };
  
  

  const showVictimDetails = form.reporter_type === "victim" || !form.anonymous;

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
              className="input"
            >
              <option value="victim">Victim</option>
              <option value="witness">Witness</option>
              <option value="other">Other</option>
            </select>
          </section>

          {/* Anonymous checkbox */}
          <section>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="anonymous"
                checked={form.anonymous}
                onChange={(e) => handleChange(e)}
                className="checkbox"
              />
              <span>Submit Anonymously</span>
            </label>
          </section>

          {/* Contact info */}
          {!form.anonymous && (
            <section>
              <h3 className="font-semibold mb-2">Your Contact Info</h3>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.contact_info.email}
                onChange={(e) => handleChange(e, ["contact_info"])}
                className="input"
              />
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.contact_info.phone}
                onChange={(e) => handleChange(e, ["contact_info"])}
                className="input"
              />
              <label>Preferred Contact</label>
              <select
                name="preferred_contact"
                value={form.contact_info.preferred_contact}
                onChange={(e) => handleChange(e, ["contact_info"])}
                className="input"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </section>
          )}

          {/* Incident Details */}
          <section>
            <h3 className="font-semibold mb-2">Incident Details</h3>
            <label>Date of Incident</label>
            <input
              type="date"
              name="date"
              value={form.incident_details.date}
              onChange={(e) => handleChange(e, ["incident_details"])}
              className="input"
              required
            />
            <label>Incident Title</label>
            <input
              type="text"
              name="incident_title"
              value={form.incident_details.incident_title}
              onChange={(e) => handleChange(e, ["incident_details"])}
              className="input"
              required
            />
            <label>Description</label>
            <textarea
              name="description"
              value={form.incident_details.description}
              onChange={(e) => handleChange(e, ["incident_details"])}
              className="textarea"
              required
            />
          </section>

          {/* Violation Types (multi-select) */}
          <section>
            <label className="block font-semibold mb-1">Violation Types</label>
            <select
              multiple
              value={form.incident_details.violation_types}
              onChange={handleMultiSelect}
              className="input"
            >
              <option value="physical">Physical Violence</option>
              <option value="verbal">Verbal Abuse</option>
              <option value="sexual">Sexual Harassment</option>
              <option value="discrimination">Discrimination</option>
              <option value="other">Other</option>
            </select>
          </section>

          {/* Location on Map */}
          <section>
            <label className="block font-semibold mb-1">Incident Location (Click on map)</label>
            <div id="map" style={{ height: "300px" }} className="mb-4 rounded border" />
            <div>
              <strong>Country:</strong> {form.incident_details.location.country || "-"} <br />
              <strong>City:</strong> {form.incident_details.location.city || "-"} <br />
              <strong>Coordinates:</strong>{" "}
              {form.incident_details.location.coordinates.coordinates.length === 2
                ? `${form.incident_details.location.coordinates.coordinates[1].toFixed(
                    5
                  )}, ${form.incident_details.location.coordinates.coordinates[0].toFixed(5)}`
                : "-"}
            </div>
          </section>

          {/* Evidence Upload */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Upload Evidence</h3>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileChange}
              className="input"
            />
            {evidenceFiles.length > 0 && (
              <ul className="text-sm text-gray-600 list-disc pl-4">
              {evidenceFiles.map((file, idx) => (
                  <div key={idx}>
                    <p>{file.name}</p>
                    <input
                      type="text"
                      placeholder="Enter description"
                      onChange={(e) => {
                        const desc = e.target.value;
                        setEvidenceFiles((prev) => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], description: desc };
                          return copy;
                        });
                      }}
                    />
                  </div>
              ))}
              </ul>
            )}
          </section>

          {/* Victim Details (shown only if reporter_type is victim or not anonymous) */}
          {showVictimDetails && (
            <section>
              <h3 className="font-semibold mb-2">Victim Details</h3>
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.victim_details.demographics.first_name}
                onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                className="input"
              />
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.victim_details.demographics.last_name}
                onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                className="input"
              />
              <label>Gender</label>
              <select
                name="gender"
                value={form.victim_details.demographics.gender}
                onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                className="input"
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <label>Birthdate</label>
              <input
                type="date"
                name="birthdate"
                value={form.victim_details.demographics.birthdate}
                onChange={(e) => handleChange(e, ["victim_details", "demographics"])}
                className="input"
              />
              {form.victim_details.demographics.birthdate && (
                <p>Age: {calculateAge(form.victim_details.demographics.birthdate)}</p>
              )}

              <h4 className="mt-4 font-semibold">Contact Info</h4>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.victim_details.contact_info.email}
                onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                className="input"
              />
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.victim_details.contact_info.phone}
                onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                className="input"
              />
              <label>Preferred Contact</label>
              <select
                name="preferred_contact"
                value={form.victim_details.contact_info.preferred_contact}
                onChange={(e) => handleChange(e, ["victim_details", "contact_info"])}
                className="input"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </section>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentReportForm;
