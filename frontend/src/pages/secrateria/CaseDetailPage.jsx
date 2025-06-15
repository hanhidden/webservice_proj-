import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { ArrowLeft } from "lucide-react";

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

const priorityOptions = ["low", "medium", "high"];
const statusOptions = ["new", "open", "closed"];

axios.defaults.headers.common["Content-Type"] = "application/json";

export default function CaseDetailPage() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({});
  const [statusComment, setStatusComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [victimDetails, setVictimDetails] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/api/cases/${caseId}`
        );
        setCaseData(res.data);
        if (res.data.victims?.length > 0) {
          const victimRes = await Promise.all(
            res.data.victims
              .filter(
                (v) => v && (typeof v === "string" || typeof v === "object")
              ) // skip undefined
              .map((v) =>
                typeof v === "string"
                  ? axios
                      .get(`http://localhost:8000/api/victims/${v}`)
                      .then((r) => r.data)
                      .catch((err) => {
                        console.warn("Failed to fetch victim", v, err.message);
                        return null; // Skip failed fetch
                      })
                  : v
              )
          );

          setVictimDetails(victimRes.filter(Boolean)); // Remove nulls
        } else {
          setVictimDetails([]);
        }

        setForm({
          title: res.data.title || "",
          description: res.data.description || "",
          violation_types: res.data.violation_types || [],
          priority: res.data.priority || "medium",
          date_occurred: res.data.date_occurred?.split("T")[0] || "",
          date_reported: res.data.date_reported?.split("T")[0] || "",
          perpetrators: res.data.perpetrators || [],
        });

        const his = await axios.get(
          `http://localhost:8000/api/case_status_history/${res.data.case_id}`
        );
        setHistory(his.data || []);
      } catch (e) {
        console.error(e);
        setError(
          "Failed to load case data: " + (e.response?.data?.detail || e.message)
        );
      } finally {
        setLoading(false);
      }
    }
    if (caseId) load();
  }, [caseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/cases/${caseData._id}`,
        form
      );
      alert("Case details saved successfully");
      setCaseData((c) => ({ ...c, ...form }));
    } catch (error) {
      alert(
        "Failed to save case details: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!statusComment.trim())
      return alert("Please provide a comment when changing status");

    try {
      await axios.post(
        `http://localhost:8000/api/case_status_history/${caseData.case_id}`,
        {
          new_status: newStatus,
          description: statusComment,
        }
      );
      setCaseData((c) => ({ ...c, status: newStatus }));
      setHistory((h) => [
        {
          new_status: newStatus,
          description: statusComment,
          date_changed: new Date().toISOString(),
        },
        ...h,
      ]);
      setStatusComment("");
    } catch (error) {
      alert(
        "Failed to update case status: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  const handleDeleteStatus = async (idx) => {
    if (!window.confirm("Delete this status history entry?")) return;
    try {
      await axios.delete(
        `http://localhost:8000/api/case_status_history/${caseData.case_id}/index/${idx}`
      );

      const newHist = [...history];
      newHist.splice(idx, 1);
      setHistory(newHist);
      setCaseData((c) => ({
        ...c,
        status:
          newHist.length > 0 ? newHist[newHist.length - 1].new_status : "new",
      }));
    } catch (error) {
      alert(
        "Failed to delete status history: " +
          (error.response?.data?.detail || error.message)
      );
    }
  };

  if (loading)
    return <div className="text-center p-10 text-xl">Loading...</div>;
  if (error)
    return <div className="text-center p-10 text-red-600">{error}</div>;
  if (!caseData) return <div className="text-center p-10">Case not found</div>;

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen space-y-6">
          <h1 className="text-2xl font-bold mb-4">
            Case: {caseData.case_id || caseData._id}
          </h1>
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cases </span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow border border-[#F9CC5B]">
            <div>
              <label className="font-semibold">Title</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-semibold">Priority</label>
              <select
                className="mt-1 w-full px-3 py-2 border rounded"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {priorityOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="font-semibold">Description</label>
              <textarea
                className="mt-1 w-full px-3 py-2 border rounded"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-semibold">Violation Type</label>
              <select
                className="mt-1 w-full px-3 py-2 border rounded"
                name="violation_types"
                value={form.violation_types[0] || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, violation_types: [e.target.value] }))
                }
              >
                <option value="">Select...</option>
                {violationTypes.map((v) => (
                  <option key={v} value={v}>
                    {v.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold">Date Occurred</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded"
                type="date"
                name="date_occurred"
                value={form.date_occurred}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-semibold">Date Reported</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded"
                type="date"
                name="date_reported"
                value={form.date_reported}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-semibold">Perpetrator Name</label>
              <input
                className="mt-1 w-full px-3 py-2 border rounded"
                name="perpetrators[0].name"
                value={form.perpetrators[0]?.name || ""}
                onChange={(e) => {
                  const arr = [...(form.perpetrators || [])];
                  arr[0] = { ...arr[0], name: e.target.value };
                  setForm((f) => ({ ...f, perpetrators: arr }));
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="bg-[#1a2f4f] text-white px-6 py-2 rounded-xl hover:bg-[#2a4c80] border-2 border-transparent hover:border-[#fbbe24bd] transition"
          >
            Save Case Details
          </button>

          {/* Status Section */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#F9CC5B]">
            <h2 className="text-xl font-bold">Status: {caseData.status}</h2>
            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <select
                className="border px-3 py-2 rounded"
                value=""
                onChange={handleStatusChange}
              >
                <option value="" disabled>
                  Change status →
                </option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="flex-1 border px-3 py-2 rounded"
                placeholder="Comment (required)"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
              />
            </div>

            <h3 className="text-lg font-semibold mt-4">Status History</h3>
            {history.length === 0 ? (
              <p className="text-gray-500">No history.</p>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Comment</th>
                      <th className="px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h._id || i}>
                        <td className="px-4 py-2 border">
                          {new Date(h.updated_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border">{h.state}</td>
                        <td className="px-4 py-2 border">{h.description}</td>
                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleDeleteStatus(i)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Victims */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#F9CC5B]">
            <h2 className="text-xl font-bold mb-2">Victims</h2>
            <ul className="list-disc pl-5">
              {(victimDetails || []).map((v, i) => {
                const isAnonymous = v.is_anonymous || v.anonymous;
                const firstName = v.demographics?.first_name || "-";
                const lastName = v.demographics?.last_name || "-";

                if (user.role === "admin") {
                  return (
                    <li key={i}>
                      {v._id} -{" "}
                      {isAnonymous ? "(anonymous)" : `${firstName} ${lastName}`}
                    </li>
                  );
                }

                if (user.role === "secretaria") {
                  return (
                    <li key={i}>
                      {v._id} - {firstName} {lastName}
                    </li>
                  );
                }

                return <li key={i}>{v._id}</li>;
              })}
            </ul>
          </div>

          {/* Evidence */}
          <div className="bg-white p-6 rounded-xl shadow border border-[#F9CC5B]">
            <h2 className="text-xl font-bold mb-4">Evidence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(caseData.evidence || []).map((e, i) =>
                e.type === "photo" ? (
                  <div key={i} className="border rounded p-2 shadow">
                    <img
                      src={e.url}
                      alt={e.description}
                      className="max-w-full h-auto rounded"
                    />
                    <p className="text-sm mt-2">{e.description}</p>
                  </div>
                ) : (
                  <div key={i} className="border rounded p-2 shadow">
                    <p>
                      <strong>{e.type}:</strong> {e.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
