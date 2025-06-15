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
import AdminReportsPage from "./pages/admin/AdminReportsPage";

import ReportDetailsPage from "./pages/admin/ReportDetailsPage";

import { ErrorBoundary } from "./components/ErrorBoundary";

import IncidentReportForm from "./pages/user/IncidentReportForm";


import SecretariaManageCases from "./pages/secrateria/SecretariaManageCases";
import CaseDetailPage from "./pages/secrateria/CaseDetailPage";

import Adminmanagevictims from "./pages/admin/Admin_managevictims";
import Secmanagevictims from "./pages/secrateria/Sec_managevictims";
import UpdateVictims from "./pages/secrateria/UpdateVictims";
import UpdateVictimform from "./pages/secrateria/UpdateVictimform";
import RiskHistory from "./pages/secrateria/RiskHistory";
import AdminNewVictimForm from "./pages/admin/Admin_NewVictimForm";
import AdminVictimList from "./pages/admin/Admin_VictimList";
import Adminmanageuser from "./pages/admin/Admin_manageuser";


import Stats from "./pages/user/Stats"
import OrganizationIncidentReportForm from "./pages/organization/OrganizationIncidentReportForm";


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

            <Route path="/stats" element={<Stats />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />


      

     
      {/* Victims Management */}
      <Route path="/secretaria/victims/list" element={<VictimList />} />
      <Route path="/secretaria/victims/new" element={<VictimForm />} />
      <Route
        path="/secretaria/manage-cases"
        element={<SecretariaManageCases />}
      />
      <Route path="/secretaria/case/:caseId" element={<CaseDetailPage />} />

      <Route path="/secretaria/victims" element={<Secmanagevictims />} />

      {/* admin */}
      <Route path="/admin/users" element={<Adminmanageuser />} />
      <Route path="/admin/victims" element={<Adminmanagevictims />} />
      {/* Victims Management admin */}
      <Route path="/admin/victims/list" element={<AdminVictimList />} />
      <Route path="/admin/victims/new" element={<AdminNewVictimForm />} />
      <Route path="/admin/AdminReportsPage" element={<AdminReportsPage />} />

      <Route path="/admin/reports/:id" element={<ReportDetailsPage />} />
      <Route 
        path="/incidentReportForm" 
        element={
          <ErrorBoundary>

            <IncidentReportForm />

          </ErrorBoundary>

        } 
        />




      {/* Victims Management secretaria */}
      <Route path="/secretaria/victims/list" element={<VictimList />} />
      <Route path="/secretaria/victims/new" element={<VictimForm />} />
      <Route path="/secretaria/victims/update" element={<UpdateVictims />} />
      <Route
        path="/secretaria/victims/update/:id"
        element={<UpdateVictimform />}
      />
      <Route
        path="/secretaria/victims/risk-history/:id"
        element={<RiskHistory />}
      />

      <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
      <Route path="/organization/reports" element={<OrganizationIncidentReportForm />} />




      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
