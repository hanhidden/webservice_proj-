import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { LawIcon } from "@primer/octicons-react";
import { IoDocumentText } from "react-icons/io5";

export default function Header({ user, scrollToReport, onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <header className="w-full bg-[#e9e7e3] text-[#132333]   flex justify-between items-center p-6 shadow-md">
      {/* Left side: Logo */}
      <div className="flex items-center space-x-3">
        <LawIcon className="text-[#132333]" size={34} />
        <span className="text-2xl font-bold select-none">
          Human Right Monitor
        </span>
      </div>

      {/* Right side: login form (if logged out) + links */}
      <nav className="flex items-center space-x-6">
        {!user && (
          <form onSubmit={handleLogin} className="flex items-center space-x-3">
            <input
              type="email"
              placeholder="Email"
              className="px-3 py-2 rounded text-black text-sm w-44 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="px-3 py-2 rounded text-black text-sm w-44 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
            >
              Login
            </button>
          </form>
        )}

        {user && (
          <span className="text-[#fbbf24] whitespace-nowrap">
            Hi, <strong>{user.username}</strong>
          </span>
        )}

        <button
          type="submit"
          className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
        >
          Sign up
        </button>

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
          onClick={onLogout}
          className="flex items-center hover:text-yellow-600 whitespace-nowrap"
        >
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </nav>
    </header>
  );
}
