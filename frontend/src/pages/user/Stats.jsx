import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../../components/user_homepage/Header";
import Footer from "../../components/user_homepage/Footer";
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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [violationsRes, timelineRes, geoRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/analytics/violations"),
        axios.get("http://127.0.0.1:8000/api/analytics/timeline"),
        axios.get("http://127.0.0.1:8000/api/analytics/geodata"),
      ]);

      setViolations(violationsRes.data);
      setTimeline(
        timelineRes.data.map((item) => ({
          month: `${item._id.month}/${item._id.year}`,
          count: item.count,
        }))
      );
      setGeodata(geoRes.data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

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
