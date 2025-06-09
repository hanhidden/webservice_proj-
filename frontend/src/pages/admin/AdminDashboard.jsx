import React from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";

function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Header />

      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.role || "User"}!
          </h1>
          <p>Select a tab from the sidebar to manage the system.</p>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;
