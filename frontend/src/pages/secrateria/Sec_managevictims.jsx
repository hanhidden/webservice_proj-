import React from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { MdOutlinePersonAdd } from "react-icons/md";

function Sec_managevictims() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-6">
            Welcome, {user?.role || "User"}!
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* New Victim/Witness */}
            <Link
              to="/secretaria/victims/new"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white rounded-xl w-full h-48 hover:bg-[#2a4c80] transition transform hover:scale-105 shadow-lg border-2 border-transparent hover:border-[#fbbe24bd]"
            >
              <IoDocumentTextOutline size={48} className="mb-3" />
              <span className="text-center text-lg font-semibold px-4">
                New Victim/Witness
              </span>
            </Link>

            {/* View Victim/Witness List */}
            <Link
              to="/secretaria/victims/list"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white rounded-xl w-full h-48 hover:bg-[#2a4c80] transition transform hover:scale-105 shadow-lg border-2 border-transparent hover:border-[#fbbe24bd]"
            >
              <IoPersonOutline size={48} className="mb-3" />
              <span className="text-center text-lg font-semibold px-4">
                View Victim/Witness List
              </span>
            </Link>

            {/* Update Risk Assessments */}
            <Link
              to="/secretaria/victims/update"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white rounded-xl w-full h-48 hover:bg-[#2a4c80] transition transform hover:scale-105 shadow-lg border-2 border-transparent hover:border-[#fbbe24bd]"
            >
              <MdOutlinePersonAdd size={48} className="mb-3" />
              <span className="text-center text-lg font-semibold px-4">
                Update Risk Assessments
              </span>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default Sec_managevictims;
