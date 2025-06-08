// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { FaChartBar, FaSignOutAlt } from "react-icons/fa";
// import { LawIcon } from "@primer/octicons-react";
// import { IoDocumentText } from "react-icons/io5";
// import { useAuth } from "../../auth";

// export default function org_header({ scrollToReport, onLogin, onLogout }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const { user, logout } = useAuth();
//   const handleLogin = (e) => {
//     e.preventDefault();
//     onLogin(email, password);
//   };

//   return (
//     <header className="w-full bg-[#e9e7e3] text-[#132333]   flex justify-between items-center p-6 shadow-md">
//       {/* Left side: Logo */}
//       <div className="flex items-center space-x-3">
//         <LawIcon className="text-[#132333]" size={34} />
//         <span className="text-2xl font-bold select-none">
//           Human Right Monitor
//         </span>
//       </div>

//       {/* Right side: login form (if logged out) + links */}
//       <nav className="flex items-center space-x-6">
//         {user ? (
//           <>
//             <span>
//               Welcome,{" "}
//               <span className="underline underline-offset-2">{user.email}</span>
//             </span>
//             <Link
//               to="/login"
//               className="bg-[#fcc844] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
//             >
//               Login/Sign Up
//             </Link>
//           </>
//         ) : (
//           <Link
//             to="/login"
//             className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-5 py-2 rounded-lg text-sm"
//           >
//             Login/Sign Up
//           </Link>
//         )}

       
       

//         <button
//           onClick={logout}
//           className="flex items-center hover:text-yellow-600 whitespace-nowrap"
//         >
//           <FaSignOutAlt className="mr-1" /> Logout
//         </button>
//       </nav>
//     </header>
//   );
// }

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { LawIcon } from "@primer/octicons-react";
import { useAuth } from "../../auth";

export default function OrgHeader({ onLogin, onLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-[#e9e7e3] text-[#1f2937] flex justify-between items-center px-8 py-4 shadow-md">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3">
        <LawIcon className="text-[#1f2937]" size={32} />
        <span className="text-2xl font-semibold select-none">Human Rights Monitor</span>
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
              onClick={logout}
              className="flex items-center space-x-2 text-[#1f2937] hover:text-[#fbbf24] font-medium"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#fbbf24] hover:bg-yellow-400 text-[#1f2937] font-semibold px-4 py-2 rounded-lg text-sm"
          >
            Login / Sign Up
          </Link>
        )}
      </nav>
    </header>
  );
}
