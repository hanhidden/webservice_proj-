import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/user_homepage/Header";
import bgImage from "../assets/images/img2.jpg";
import { useAuth } from "../auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const { user, login, logout } = useAuth(); // Grab user and logout too!

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      const approved = localStorage.getItem("approved") === "true";
      const role = localStorage.getItem("role");

      if (!approved) {
        setError(
          "⏳ Your account is pending approval by an administrator. Please check back soon!"
        );
        return;
      }

      switch (role) {
        case "admin":
          navigate("/dashboard/admin");
          break;
        case "secretaria":
          navigate("/dashboard/secretaria");
          break;
        case "organization":
          navigate("/dashboard/organization");
          break;
        case "user":
        default:
          navigate("/dashboard/user");
          break;
      }
    } else {
      const friendlyError = (() => {
        const backendError = result.error?.toLowerCase() || "";

        if (backendError.includes("account not approved")) {
          return "⏳ Your account is pending approval by an administrator. Please check back soon!";
        }

        return result.error || "Login failed. Please check your credentials.";
      })();

      setError(friendlyError);
    }
  };
  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#132333]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-20">
        <Header scrollToReport={scrollToReport} />
      </div>

      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-md w-full bg-[#e9e7e3] rounded-xl shadow-lg p-8 text-[#132333] font-sans">
          {user ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-center">
                You are already logged in!
              </h2>
              <p className="text-center mb-6">
                Welcome back, <span className="underline">{user.email}</span>.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="bg-[#132333] text-[#e9e7e3] font-semibold py-2 px-4 rounded-lg hover:bg-[#0a1826] transition"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block mb-1 font-semibold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1 font-semibold"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md border border-[#beb5aa] focus:outline-none focus:ring-2 focus:ring-[#132333]"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#132333] text-[#e9e7e3] font-semibold py-3 rounded-lg hover:bg-[#0a1826] transition"
                >
                  Login
                </button>
              </form>
              {error && (
                <p className="mt-6 text-center text-red-600 font-semibold">
                  {error}
                </p>
              )}
              <p className="mt-4 text-center text-sm text-[#132333]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="underline text-[#beb5aa] hover:text-[#132333]"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
