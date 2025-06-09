
import React from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { MdOutlinePersonAdd ,MdOutlinePerson} from "react-icons/md";


function Admin_managevictims() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.role || "User"}!
          </h1>

          <div className="flex gap-4">
            <Link
              to="/admin/victims/new"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white w-32 h-32 rounded-lg  hover:bg-[#2a4c80] transition-colors shadow-md"
            >
              <IoDocumentTextOutline size={40} />
              <span className="mt-2 text-center text-sm font-medium">
                New Victim/Witness
              </span>
            </Link>

            <Link
              to="/admin/victims/list"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white w-32 h-32 rounded-lg hover:bg-[#2a4c80] transition-colors shadow-md"
            >
              <IoPersonOutline size={40} />
              <span className="mt-2 text-center text-sm font-medium">
              View Victim/Witness  List
              </span>
            </Link>

              <Link
              to="/admin/victims/update"
              className="flex flex-col items-center justify-center bg-[#1a2f4f] text-white w-32 h-32 rounded-lg hover:bg-[#2a4c80] transition-colors shadow-md"
            >
              <MdOutlinePersonAdd size={40} />
              <span className="mt-2 text-center text-sm font-medium">
              Update Risk Assessments
              </span>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default Admin_managevictims;
