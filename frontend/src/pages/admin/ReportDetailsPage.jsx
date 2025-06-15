import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";

const ReportDetailsPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [evidencePreviews, setEvidencePreviews] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/incident_reports/reports/${id}`);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    const fetchEvidenceFile = async (url) => {
      try {
        const res = await axios.get(`http://localhost:8000${url}`, {
          responseType: 'blob',
        });
        return URL.createObjectURL(res.data);
      } catch (err) {
        console.error("Failed to fetch evidence:", err);
        return null;
      }
    };

    const loadEvidencePreviews = async () => {
      if (report?.evidence?.length > 0) {
        const previews = await Promise.all(
          report.evidence.map(async (item) => ({
            ...item,
            fileUrl: await fetchEvidenceFile(item.url),
          }))
        );
        setEvidencePreviews(previews);
      }
    };

    loadEvidencePreviews();
  }, [report]);

  if (!report) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  const {
    reporter_type,
    anonymous,
    contact_info,
    incident_details,
    victim_details,
    status,
    created_at,
    updated_at,
  } = report;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <div className="flex min-h-screen bg-[#e9e7e3] text-[#132333]">
      <Sidebar role={user?.role || "user"} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-[#2a4c80]">Incident Report Details</h2>

            <div className="space-y-3">
              <p><strong>Report ID:</strong> {id}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Reporter Type:</strong> {reporter_type}</p>
              <p><strong>Anonymous:</strong> {anonymous ? "Yes" : "No"}</p>

              {contact_info && (
                <>
                  <h3 className="font-semibold mt-4">Reporter Contact Info</h3>
                  <p><strong>Email:</strong> {contact_info.email}</p>
                  <p><strong>Phone:</strong> {contact_info.phone}</p>
                  <p><strong>Preferred Contact:</strong> {contact_info.preferred_contact}</p>
                </>
              )}

              {incident_details && (
                <>
                  <h3 className="font-semibold mt-4">Incident Details</h3>
                  <p><strong>Title:</strong> {incident_details.incident_title}</p>
                  <p><strong>Description:</strong> {incident_details.description}</p>
                  <p><strong>Date:</strong> {formatDate(incident_details.date)}</p>
                  <p><strong>Location:</strong> {incident_details.location.city}, {incident_details.location.country}</p>
                  <p><strong>Coordinates:</strong> {incident_details.location.coordinates.coordinates.join(', ')}</p>
                  <p><strong>Violation Types:</strong> {incident_details.violation_types.join(', ')}</p>
                </>
              )}

              {victim_details && (
                <>
                  <h3 className="font-semibold mt-4">Victim Details</h3>
                  <p><strong>Name:</strong> {victim_details.demographics.first_name} {victim_details.demographics.last_name}</p>
                  <p><strong>Gender:</strong> {victim_details.demographics.gender}</p>
                  <p><strong>Age:</strong> {victim_details.demographics.age}</p>
                  <p><strong>Birthdate:</strong> {victim_details.demographics.birthdate}</p>
                  <p><strong>Contact:</strong> {victim_details.contact_info.email} / {victim_details.contact_info.phone}</p>
                  <p><strong>Preferred Contact:</strong> {victim_details.contact_info.preferred_contact}</p>
                </>
              )}

              {evidencePreviews?.length > 0 && (
                <>
                  <h3 className="font-semibold mt-4">Evidence</h3>
                  {evidencePreviews.map((item, idx) => (
                    <div key={idx} className="ml-4 mb-4">
                      <p><strong>Type:</strong> {item.type}</p>
                      <p><strong>Description:</strong> {item.description}</p>
                      {item.type === "video" && item.fileUrl && (
                        <video src={item.fileUrl} controls width="100%" className="rounded-md shadow" />
                      )}
                      {item.type === "pdf" && item.fileUrl && (
                        <iframe src={item.fileUrl} width="100%" height="500px" className="rounded-md shadow" />
                      )}
                      {item.type === "image" && item.fileUrl && (
                        <img src={item.fileUrl} alt="Evidence" className="max-w-full h-auto rounded-md shadow" />
                      )}
                    </div>
                  ))}
                </>
              )}

              <p className="mt-4 text-sm text-[#2a4c80]"><strong>Created At:</strong> {formatDate(created_at)}</p>
              <p className="text-sm text-[#2a4c80]"><strong>Updated At:</strong> {formatDate(updated_at)}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
