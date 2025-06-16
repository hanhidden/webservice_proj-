import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../../components/user_homepage/Header";
import Footer from "../../components/user_homepage/Footer";
import { PieChart, Pie, Cell, Legend } from "recharts";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Stats() {
  const reportRef = useRef(null);
  const [violations, setViolations] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [geodata, setGeodata] = useState([]);
  const [caseStatus, setCaseStatus] = useState({});
  const [demographics, setDemographics] = useState({
    gender: {},
    ethnicity: {},
    age_groups: {},
    occupation: {},
  });

  const COLORS = [
    "#FFD128",
    "#2a4c80",
    "#e74c3c",
    "#9E788F",
    "#2ecc71",
    "#f39c12",
    "#8e44ad",
    "#1abc9c",
  ];

  useEffect(() => {
    fetchStats();
    fetchDemographics();
  }, []);

  const fetchStats = async () => {
    try {
      const [violationsRes, timelineRes, geoRes, statusRes] = await Promise.all(
        [
          axios.get("http://127.0.0.1:8000/api/analytics/violations"),
          axios.get("http://127.0.0.1:8000/api/analytics/timeline"),
          axios.get("http://127.0.0.1:8000/api/analytics/geodata"),
          axios.get("http://127.0.0.1:8000/api/cases/count-by-status"),
        ]
      );

      setViolations(violationsRes.data);
      setTimeline(
        timelineRes.data.map((item) => ({
          month: `${item._id.month}/${item._id.year}`,
          count: item.count,
        }))
      );
      setGeodata(geoRes.data);
      setCaseStatus(statusRes.data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const fetchDemographics = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/victims/summary/victim-demographics-summary"
      );
      setDemographics(response.data);
    } catch (error) {
      console.error("Failed to load demographics", error);
    }
  };

  // Transform demographics data for charts
  const genderData = Object.entries(demographics.gender).map(
    ([key, value]) => ({
      name: key,
      value: value,
    })
  );

  const ethnicityData = Object.entries(demographics.ethnicity).map(
    ([key, value]) => ({
      name: key,
      value: value,
    })
  );

  const ageData = Object.entries(demographics.age_groups).map(
    ([key, value]) => ({
      name: key,
      count: value,
    })
  );

  const occupationData = Object.entries(demographics.occupation).map(
    ([key, value]) => ({
      name: key,
      count: value,
    })
  );

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header scrollToReport={scrollToReport} />

      <div className="px-6 py-10 space-y-12 max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-[#2a4c80]">
          Analytics Dashboard
        </h2>

        {/* Violations Chart */}
        <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
            Most Common Violations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={violations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#fcc844" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Timeline Chart */}
        <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
            Case Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2a4c80"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Case Status Pie Chart */}
        <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
            Case Status Distribution
          </h3>
          {Object.keys(caseStatus).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(caseStatus)
                    .filter(([status]) =>
                      ["new", "open", "closed"].includes(status)
                    )
                    .map(([status, count]) => ({
                      name: status,
                      value: count,
                    }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.entries(caseStatus)
                    .filter(([status]) =>
                      ["new", "open", "closed"].includes(status)
                    )
                    .map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-600">Loading chart...</p>
          )}
        </section>

        {/* VICTIM DEMOGRAPHICS SECTION */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-[#2a4c80] border-t-4 border-[#2a4c80] pt-8">
            Victim Demographics
          </h2>

          {/* Gender Distribution - Pie Chart */}
          <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
              Gender Distribution
            </h3>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600">
                No gender data available
              </p>
            )}
          </section>

          {/* Ethnicity Distribution - Pie Chart */}
          <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
              Ethnicity Distribution
            </h3>
            {ethnicityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ethnicityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {ethnicityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600">
                No ethnicity data available
              </p>
            )}
          </section>

          {/* Age Groups - Bar Chart */}
          <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
              Age Groups Distribution
            </h3>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2a4c80" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600">No age data available</p>
            )}
          </section>

          {/* Occupation Distribution - Bar Chart */}
          <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
              Occupation Distribution
            </h3>
            {occupationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fcc844" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600">
                No occupation data available
              </p>
            )}
          </section>

          {/* Demographics Summary */}
          <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
              Demographics Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-[#2a4c80]">
                <h4 className="font-semibold text-[#2a4c80] mb-2">
                  Total Victims by Gender
                </h4>
                <p className="text-2xl font-bold text-[#132333]">
                  {Object.values(demographics.gender).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#2a4c80]">
                <h4 className="font-semibold text-[#2a4c80] mb-2">
                  Total Victims by Ethnicity
                </h4>
                <p className="text-2xl font-bold text-[#132333]">
                  {Object.values(demographics.ethnicity).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#2a4c80]">
                <h4 className="font-semibold text-[#2a4c80] mb-2">
                  Total Victims by Age
                </h4>
                <p className="text-2xl font-bold text-[#132333]">
                  {Object.values(demographics.age_groups).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#2a4c80]">
                <h4 className="font-semibold text-[#2a4c80] mb-2">
                  Total Victims by Occupation
                </h4>
                <p className="text-2xl font-bold text-[#132333]">
                  {Object.values(demographics.occupation).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Geodata Map */}
        <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
            Reported Locations (Map)
          </h3>
          <div className="h-[400px] w-full rounded-xl overflow-hidden">
            <MapContainer
              center={[31.9, 35.2]} // Default center (adjust based on your region)
              zoom={8}
              scrollWheelZoom={true}
              className="h-full w-full rounded shadow"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geodata.map((item, idx) => {
                const coords = item.coordinates?.coordinates;
                if (!coords || coords.length !== 2) return null;

                return (
                  <Marker key={idx} position={[coords[1], coords[0]]}>
                    <Popup>
                      <p>
                        <strong>Location:</strong> {item.location}
                      </p>
                      <p>
                        <strong>Violations:</strong>{" "}
                        {item.violation_types.join(", ")}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(item.date_occurred).toLocaleDateString()}
                      </p>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>

        {/* Geodata */}
        <section className="bg-[#e9e7e3] p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-[#132333] mb-4 border-b-2 border-[#2a4c80] pb-2">
            Reported Locations
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geodata.map((item, idx) => (
              <li
                key={idx}
                className="bg-white p-4 rounded-lg border border-[#2a4c80]"
              >
                <p>
                  <strong className="text-[#2a4c80]">Location:</strong>{" "}
                  {item.location}
                </p>
                <p>
                  <strong className="text-[#2a4c80]">Violations:</strong>{" "}
                  {item.violation_types.join(", ")}
                </p>
                <p>
                  <strong className="text-[#2a4c80]">Date:</strong>{" "}
                  {new Date(item.date_occurred).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
