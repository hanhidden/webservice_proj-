// import { Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import UserDashboard from "./pages/user/UserDashboard";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import SecretariaDashboard from "./pages/secrateria/SecretariaDashboard";
// import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
// import NewVictimForm from "./pages/organization/NewVictimForm";
// import { useAuth } from "./auth";
// import VictimList from "./pages/organization/VictimList"; // adjust path accordingly

// function App() {
//   const { user } = useAuth();

//   console.log("App user context:", user);

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={user ? <UserDashboard /> : <Navigate to="/login" />}
//       />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/signup" element={<SignupPage />} />
//       <Route path="/victims/new" element={<NewVictimForm />} />
//       // ... inside your router setup
//       <Route path="/secretaria/victims" element={<VictimList />} />
//       {/* Role-based dashboard route */}
//       <Route
//         path="/dashboard/:role"
//         element={
//           user ? (
//             user.is_approved ? (
//               user.role === "admin" ? (
//                 <AdminDashboard />
//               ) : user.role === "secretaria" ? (
//                 <SecretariaDashboard />
//               ) : user.role === "organization" ? (
//                 <OrganizationDashboard />
//               ) : (
//                 <UserDashboard />
//               )
//             ) : (
//               <Navigate to="/login" />
//             )
//           ) : (
//             <Navigate to="/login" />
//           )
//         }
//       />
//       {/* Catch-all */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SecretariaDashboard from "./pages/secrateria/SecretariaDashboard";
import OrganizationDashboard from "./pages/organization/OrganizationDashboard";
import VictimForm from "./pages/admin/NewVictimForm";
import { useAuth } from "./auth";
import VictimList from "./pages/admin/VictimList"; // adjust path accordingly
import Admin_managevictims from "./pages/admin/Admin_managevictims";
import UpdateVictims from "./pages/admin/UpdateVictims";
import UpdateVictimform from "./pages/admin/UpdateVictimform";
import RiskHistory from "./pages/admin/RiskHistory";

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
      {/* <Route path="/secretaria/victims" element={<Sec_managevictims />} /> */}
      <Route path="/admin/victims" element={<Admin_managevictims />} />
      {/* Victims Management */}
      {/* <Route path="/secretaria/victims/list" element={<VictimList />} />
      <Route path="/secretaria/victims/new" element={<VictimForm />} /> */}



      <Route path="/admin/victims/list" element={<VictimList />} />


      <Route path="/admin/victims/new" element={<VictimForm />} />
      <Route path="/admin/victims/update" element={<UpdateVictims />} />

      <Route path="/admin/victims/update/:id" element={<UpdateVictimform />} />

      <Route path="/admin/victims/risk-history/:id" element={<RiskHistory />} />
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
