import { useNavigate, Link } from "react-router-dom";
import bgImage from "../assets/images/img2.jpg";

import { useState, useRef } from "react";
import Header from "../components/user_homepage/Header";

function SignupPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          hashed_password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Signup failed. Please try again.");
        setMessage("");
      } else {
        if (formData.role === "user") {
          setMessage("Your account is ready! Please proceed to login.");
        } else {
          setMessage(
            "Your account request has been received. Please wait for approval."
          );
        }
        setError("");
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          role: "user",
        });
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      setMessage("");
    }
  };

  const reportRef = useRef(null);

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header fixed at the top */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Header scrollToReport={scrollToReport} />
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"></div>

      {/* Centered form */}
      <div className="flex items-center justify-center min-h-screen  z-10 pt-24 pb-9">
        <div className="relative z-10 max-w-md w-full bg-[#e9e7e3] rounded-xl shadow-lg p-8 text-[#132333] font-sans mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block mb-1 font-semibold">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                placeholder="John"
              />
            </div>
            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block mb-1 font-semibold">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                placeholder="Doe"
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1 font-semibold">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                placeholder="you@example.com"
              />
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1 font-semibold">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                placeholder="Enter your password"
              />
            </div>
            {/* Role */}
            <div>
              <label htmlFor="role" className="block mb-1 font-semibold">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="organization">Organization</option>
                <option value="secretaria">Secretary</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-[#132333] text-[#e9e7e3] font-semibold py-3 rounded-lg hover:bg-[#0a1826] transition"
            >
              Sign Up
            </button>
          </form>

          {message && (
            <p className="mt-6 text-center text-green-700 font-semibold">
              {message}{" "}
              {formData.role === "user" && (
                <Link
                  to="/login"
                  className="underline text-[#132333] hover:text-[#0a1826]"
                >
                  Login here
                </Link>
              )}
            </p>
          )}

          {error && (
            <p className="mt-6 text-center text-red-600 font-semibold">
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-[#132333]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline text-[#beb5aa] hover:text-[#132333]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
