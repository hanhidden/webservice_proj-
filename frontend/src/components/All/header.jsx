import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { LawIcon } from "@primer/octicons-react";
import { useAuth } from "../../auth";
import { useNavigate } from "react-router-dom";
import { FaChartBar } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";


export default function AllHeader({ onLogin, onLogout }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    localStorage.clear();
  };

  return (
    <header className="w-full bg-[#e9e7e3] text-[#1f2937] flex justify-between items-center px-8 py-4 shadow-md">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3">
        {/* Left: Logo (clickable) */}
        <Link to="/" className="flex items-center space-x-3">
          <LawIcon className="text-[#1f2937]" size={32} />
          <span className="text-2xl font-semibold select-none  hover:text-yellow-500">
            Human Rights Monitor
          </span>
        </Link>
      </div>

      {/* Right: Links / Login / Logout */}
      <nav className="flex items-center space-x-6">
        {user ? (
          <>
            <span className="text-sm">
              Welcome,{" "}
              <span className="font-semibold underline">{user.email}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-[#1f2937] hover:text-[#fbbf24] font-medium"
            >
              <FaSignOutAlt />

              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-[#fbbf24] hover:bg-yellow-400 text-[#1f2937] font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Login / Sign Up
            </Link>

            <Link
                        to="/incidentReportForm"
                        className="flex items-center hover:text-yellow-600 whitespace-nowrap"
                      >
                        <IoDocumentText className="mr-1" /> Report an Incident
                        
                      </Link>

            
          </>
        )}
      </nav>
    </header>
  );
}
