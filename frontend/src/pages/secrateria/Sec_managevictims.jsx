// import React from "react";
// import Sidebar from "../../components/user_homepage/Sidebar";
// import Header from "../../components/All/header";
// import { useAuth } from "../../auth";
// import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
// import { Link } from "react-router-dom";

// function Sec_managevictims() {
//   const { user } = useAuth();

//   return (
//     <>
//       <Header />
//       <div className="flex">
//         <Sidebar role={user?.role || "user"} />
//         <main className="flex-grow p-8 bg-gray-100 min-h-screen">
//           <h1 className="text-2xl font-bold mb-4">
//             Welcome, {user?.name || "User"}!
//           </h1>

//           <Link
//             to="/secretaria/victims/new"
//             className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
//           >
//             <IoDocumentTextOutline size={20} />
//             <span>New Victim/Witness</span>
//           </Link>

//           <Link
//             to="/secretaria/victims/list"
//             className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
//           >
//             <IoPersonOutline size={20} />
//             <span>Victim/Witness List</span>
//           </Link>
//         </main>
//       </div>
//     </>
//   );
// }

// export default Sec_managevictims;

import React from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

function Sec_managevictims() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.name || "User"}!
          </h1>

          <div className="flex gap-4">
            <Link
              to="/secretaria/victims/new"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white w-32 h-32 rounded-lg  hover:bg-[#2a4c80] transition-colors shadow-md"
            >
              <IoDocumentTextOutline size={40} />
              <span className="mt-2 text-center text-sm font-medium">
                New Victim/Witness
              </span>
            </Link>

            <Link
              to="/secretaria/victims/list"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white w-32 h-32 rounded-lg hover:bg-[#2a4c80] transition-colors shadow-md"
            >
              <IoPersonOutline size={40} />
              <span className="mt-2 text-center text-sm font-medium">
                Victim/Witness List
              </span>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default Sec_managevictims;
