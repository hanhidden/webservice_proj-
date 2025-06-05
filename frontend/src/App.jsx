import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SecretariaDashboard from "./pages/secrateria/SecretariaDashboard";
import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
import { useAuth } from "./auth";

function App() {
  const { user } = useAuth();

  console.log("App user context:", user);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <UserDashboard /> : <Navigate to="/login" />}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Role-based dashboard route */}
      <Route
        path="/dashboard/:role"
        element={
          user ? (
            user.is_approved ? (
              user.role === "admin" ? (
                <AdminDashboard />
              ) : user.role === "secretaria" ? (
                <SecretariaDashboard />
              ) : user.role === "organization" ? (
                <OrganizationDashboard />
              ) : (
                <UserDashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
