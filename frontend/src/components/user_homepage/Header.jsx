import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { LawIcon } from "@primer/octicons-react";
import { IoDocumentText } from "react-icons/io5";
import { useAuth } from "../../auth";

export default function Header({ scrollToReport, onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, logout } = useAuth();
  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <header className="w-full bg-[#e9e7e3] text-[#132333]   flex justify-between items-center p-6 shadow-md">
      {/* Left side: Logo */}
      <div className="flex items-center space-x-3 ">
        {/* Left: Logo (clickable) */}
        <Link to="/" className="flex items-center space-x-3">
          <LawIcon className="text-[#1f2937]" size={32} />
          <span className="text-2xl font-semibold select-none  hover:text-yellow-500">
            Human Rights Monitor
          </span>
        </Link>
      </div>

      {/* Right side: login form (if logged out) + links */}
      <nav className="flex items-center space-x-6">
        {user ? (
          <>
            <span>
              Welcome,{" "}
              <span className="underline underline-offset-2">{user.email}</span>
            </span>
            {/* <Link
              to="/login"
              className="bg-[#fcc844] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
            >
              Login/Sign Up
            </Link> */}
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
          >
            Login/Sign Up
          </Link>
        )}

        <Link
          to="/stats"
          className="flex items-center hover:text-yellow-600 whitespace-nowrap"
        >
          <FaChartBar className="mr-1" /> Stats
        </Link>

        <button
          onClick={scrollToReport}
          className="flex items-center hover:text-yellow-600 whitespace-nowrap"
        >
          <IoDocumentText className="mr-1" /> Report an Incident
        </button>

        <button
          onClick={logout}
          className="flex items-center hover:text-yellow-600 whitespace-nowrap"
        >
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </nav>
    </header>
  );
}
