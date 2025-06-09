import React from "react";
import Sidebar from "../../components/user_homepage/Sidebar";


import "./SecretariaDashboard.css";
import { useAuth } from "../../auth";

function SecretariaDashboard() {
  const { user } = useAuth(); // user should have a role property

  return (
    <div className="dashboard-container">
      <Sidebar role={user?.role || "user"} />
      <div className="dashboard-content">
        <h1>Welcome, {user?.name || "User"}!</h1>
        <p>Select a tab from the sidebar to manage the system.</p>
      </div>
    </div>
  );
}

export default SecretariaDashboard;
