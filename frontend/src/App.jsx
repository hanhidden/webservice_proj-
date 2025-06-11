import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SecretariaDashboard from "./pages/secrateria/SecretariaDashboard";
import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
import VictimForm from "./pages/secrateria/NewVictimForm";
import { useAuth } from "./auth";
import VictimList from "./pages/secrateria/VictimList"; // adjust path accordingly
import Sec_managevictims from "./pages/secrateria/Sec_managevictims";
import SecretariaManageCases from "./pages/secrateria/SecretariaManageCases";
import CaseDetailPage from "./pages/secrateria/CaseDetailPage";

function App() {
  const { user } = useAuth();

  console.log("App user context:", user);

  // Utility function to determine default dashboard based on role
  const getDefaultDashboard = () => {
    if (!user || !user.is_approved) return <Navigate to="/login" />;

    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "secretaria":
        return <SecretariaDashboard />;
      case "organization":
        return <OrganizationDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <Routes>
      {/* Default route depends on user role */}
      <Route path="/" element={getDefaultDashboard()} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/secretaria/victims" element={<Sec_managevictims />} />
      {/* Victims Management */}
      <Route path="/secretaria/victims/list" element={<VictimList />} />
      <Route path="/secretaria/victims/new" element={<VictimForm />} />
      <Route
        path="/secretaria/manage-cases"
        element={<SecretariaManageCases />}
      />
      <Route path="/secretaria/case/:caseId" element={<CaseDetailPage />} />

      {/* Role-based dashboard route (explicit) */}
      <Route
        path="/dashboard/:role"
        element={
          user ? (
            user.is_approved ? (
              getDefaultDashboard()
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
