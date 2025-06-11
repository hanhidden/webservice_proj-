import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const approved = localStorage.getItem("approved");
    const email = localStorage.getItem("email");
    const user_id = localStorage.getItem("user_id"); // 👈 added this

    if (token && role && approved !== null) {
      setUser({
        email,
        role,
        is_approved: approved === "true",
        user_id, // 👈 added this
        access_token: token,
      });
    }
  }, []);

  async function login(email, password) {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.detail || "Login failed" };
      }

      const data = await response.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("approved", data.is_approved);
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", data.user_id); // 👈 store user ID

      setUser({
        email,
        role: data.role,
        is_approved: data.is_approved,
        access_token: data.access_token || data.access_token, // if your API returns token under 'access_token'
      });

      return { success: true };
    } catch (e) {
      return { error: "Network error. Please try again." };
    }
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
