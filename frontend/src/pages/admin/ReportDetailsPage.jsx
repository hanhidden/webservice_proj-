// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import Sidebar from "../../components/user_homepage/Sidebar";
// import Header from "../../components/All/header";
// import { useAuth } from "../../auth";

// const ReportDetailsPage = () => {
//   const { user } = useAuth();
//   const { id } = useParams();
//   const [report, setReport] = useState(null);
//   const [evidencePreviews, setEvidencePreviews] = useState([]);

//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/api/incident_reports/reports/${id}`
//         );
//         setReport(response.data);
//       } catch (error) {
//         console.error("Error fetching report:", error);
//       }
//     };

//     fetchReport();
//   }, [id]);

//   useEffect(() => {
//     const fetchEvidenceFile = async (url) => {
//       try {
//         const res = await axios.get(`http://localhost:8000${url}`, {
//           responseType: "blob",
//         });
//         return URL.createObjectURL(res.data);
//       } catch (err) {
//         console.error("Failed to fetch evidence:", err);
//         return null;
//       }
//     };

//     const loadEvidencePreviews = async () => {
//       if (report?.evidence?.length > 0) {
//         const previews = await Promise.all(
//           report.evidence.map(async (item) => ({
//             ...item,
//             fileUrl: await fetchEvidenceFile(item.url),
//           }))
//         );
//         setEvidencePreviews(previews);
//       }
//     };

//     loadEvidencePreviews();
//   }, [report]);

//   if (!report) {
//     return <div className="text-center mt-10 text-gray-500">Loading...</div>;
//   }

//   const {
//     reporter_type,
//     anonymous,
//     contact_info,
//     incident_details,
//     victim_details,
//     status,
//     created_at,
//     updated_at,
//   } = report;

//   const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

//   return (
//     <>
//       <Header />

//       <div className="flex h-screen">
//         <Sidebar role={user?.role || "user"} />
//         <main className="flex-1 p-6 overflow-auto">
//           <div className="bg-slate-100 p-8 rounded-xl shadow-md max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold mb-4 text-center text-[#2a4c80]">
//               Incident Report Details
//             </h2>

//             <div className="space-y-3">
//               <p>
//                 <strong>Report ID:</strong> {id}
//               </p>
//               <p>
//                 <strong>Status:</strong> {status}
//               </p>
//               <p>
//                 <strong>Reporter Type:</strong> {reporter_type}
//               </p>
//               <p>
//                 <strong>Anonymous:</strong> {anonymous ? "Yes" : "No"}
//               </p>

//               {contact_info && (
//                 <>
//                   <h3 className="font-semibold mt-4">Reporter Contact Info</h3>
//                   <p>
//                     <strong>Email:</strong> {contact_info.email}
//                   </p>
//                   <p>
//                     <strong>Phone:</strong> {contact_info.phone}
//                   </p>
//                   <p>
//                     <strong>Preferred Contact:</strong>{" "}
//                     {contact_info.preferred_contact}
//                   </p>
//                 </>
//               )}

//               {incident_details && (
//                 <>
//                   <h3 className="font-semibold mt-4">Incident Details</h3>
//                   <p>
//                     <strong>Title:</strong> {incident_details.incident_title}
//                   </p>
//                   <p>
//                     <strong>Description:</strong> {incident_details.description}
//                   </p>
//                   <p>
//                     <strong>Date:</strong> {formatDate(incident_details.date)}
//                   </p>
//                   <p>
//                     <strong>Location:</strong> {incident_details.location.city},{" "}
//                     {incident_details.location.country}
//                   </p>
//                   <p>
//                     <strong>Coordinates:</strong>{" "}
//                     {incident_details.location.coordinates.coordinates.join(
//                       ", "
//                     )}
//                   </p>
//                   <p>
//                     <strong>Violation Types:</strong>{" "}
//                     {incident_details.violation_types.join(", ")}
//                   </p>
//                 </>
//               )}

//               {victim_details && (
//                 <>
//                   <h3 className="font-semibold mt-4">Victim Details</h3>
//                   <p>
//                     <strong>Name:</strong>{" "}
//                     {victim_details.demographics.first_name}{" "}
//                     {victim_details.demographics.last_name}
//                   </p>
//                   <p>
//                     <strong>Gender:</strong>{" "}
//                     {victim_details.demographics.gender}
//                   </p>
//                   <p>
//                     <strong>Age:</strong> {victim_details.demographics.age}
//                   </p>
//                   <p>
//                     <strong>Birthdate:</strong>{" "}
//                     {victim_details.demographics.birthdate}
//                   </p>
//                   <p>
//                     <strong>Contact:</strong>{" "}
//                     {victim_details.contact_info.email} /{" "}
//                     {victim_details.contact_info.phone}
//                   </p>
//                   <p>
//                     <strong>Preferred Contact:</strong>{" "}
//                     {victim_details.contact_info.preferred_contact}
//                   </p>
//                 </>
//               )}

//               {evidencePreviews?.length > 0 && (
//                 <>
//                   <h3 className="font-semibold mt-4">Evidence</h3>
//                   {evidencePreviews.map((item, idx) => (
//                     <div key={idx} className="ml-4 mb-4">
//                       <p>
//                         <strong>Type:</strong> {item.type}
//                       </p>
//                       <p>
//                         <strong>Description:</strong> {item.description}
//                       </p>
//                       {item.type === "video" && item.fileUrl && (
//                         <video
//                           src={item.fileUrl}
//                           controls
//                           width="100%"
//                           className="rounded-md shadow"
//                         />
//                       )}
//                       {item.type === "pdf" && item.fileUrl && (
//                         <iframe
//                           src={item.fileUrl}
//                           width="100%"
//                           height="500px"
//                           className="rounded-md shadow"
//                         />
//                       )}
//                       {item.type === "image" && item.fileUrl && (
//                         <img
//                           src={item.fileUrl}
//                           alt="Evidence"
//                           className="max-w-full h-auto rounded-md shadow"
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </>
//               )}

//               <p className="mt-4 text-sm text-[#2a4c80]">
//                 <strong>Created At:</strong> {formatDate(created_at)}
//               </p>
//               <p className="text-sm text-[#2a4c80]">
//                 <strong>Updated At:</strong> {formatDate(updated_at)}
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>

//     </>
//   );
// };

// export default ReportDetailsPage;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  MapPin,
  User,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
} from "lucide-react";
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
        const response = await axios.get(
          `http://localhost:8000/api/incident_reports/reports/${id}`
        );
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    const fetchEvidenceFile = async (url) => {
      try {
        const res = await axios.get(`http://localhost:8000${url}`, {
          responseType: "blob",
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading report details...</p>
        </div>
      </div>
    );
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
    assigned_secretaria,
  } = report;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "turned-into-case":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "new":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar role={user?.role || "user"} />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Reports</span>
              </button>
            </div>
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Incident Report Details
                  </h1>
                  <p className="text-gray-600">Report ID: {id}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full border font-medium   ${getStatusColor(
                    status
                  )}`}
                >
                  {status || "Unknown Status"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Reporter Type</p>
                    <p className="font-medium">
                      {reporter_type || "Not specified"}
                    </p>
                  </div>
                </div>

                  <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Secretaria</p>
                    <p className="font-medium">
                       {assigned_secretaria|| "Not specified"}
                    </p>
                  </div>
                </div>

                
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Anonymous Report</p>
                    <p className="font-medium">{anonymous ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Reporter Contact Info */}
              {contact_info && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Reporter Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {contact_info.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">
                        {contact_info.phone}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Preferred contact: {contact_info.preferred_contact}
                    </div>
                  </div>
                </div>
              )}

              {/* Victim Details */}
              {victim_details && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-red-600" />
                    Victim Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {victim_details.demographics?.first_name}{" "}
                        {victim_details.demographics?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {victim_details.demographics?.gender}, Age{" "}
                        {victim_details.demographics?.age}
                      </p>
                      {victim_details.demographics?.birthdate && (
                        <p className="text-sm text-gray-600">
                          Born: {victim_details.demographics.birthdate}
                        </p>
                      )}
                    </div>
                    {victim_details.contact_info && (
                      <>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {victim_details.contact_info.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {victim_details.contact_info.phone}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Preferred contact:{" "}
                          {victim_details.contact_info.preferred_contact}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Incident Details */}
            {incident_details && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Incident Details
                </h3>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {incident_details.incident_title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {incident_details.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-medium">
                          {formatDate(incident_details.date)}
                        </p>
                      </div>
                    </div>
                    {incident_details.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">
                            {incident_details.location.city},{" "}
                            {incident_details.location.country}
                          </p>
                          {incident_details.location.coordinates && (
                            <p className="text-xs text-gray-500">
                              {incident_details.location.coordinates.coordinates?.join(
                                ", "
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {incident_details.violation_types && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Violation Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {incident_details.violation_types.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full border border-red-200"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Section */}
            {evidencePreviews?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Evidence ({evidencePreviews.length} items)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evidencePreviews.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {item.type}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {item.description}
                      </p>

                      <div className="bg-white rounded border overflow-hidden">
                        {item.type === "video" && item.fileUrl && (
                          <video
                            src={item.fileUrl}
                            controls
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        )}
                        {item.type === "pdf" && item.fileUrl && (
                          <iframe
                            src={item.fileUrl}
                            className="w-full h-64"
                            title={`PDF Evidence ${idx + 1}`}
                          />
                        )}
                        {item.type === "image" && item.fileUrl && (
                          <img
                            src={item.fileUrl}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        )}
                        {!item.fileUrl && (
                          <div className="p-8 text-center text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">
                              Unable to load {item.type}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Footer */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{formatDate(created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
