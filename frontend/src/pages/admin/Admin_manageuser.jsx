import React, { useState, useEffect } from "react";
import Sidebar from "../../components/user_homepage/Sidebar";
import Header from "../../components/All/header";
import { useAuth } from "../../auth";
import { Ban } from "lucide-react";
import { CiCircleCheck } from "react-icons/ci";

const UserCard = ({ user, onReject }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-900 border-red-200";
      case "organization":
        return "bg-navy-50 text-navy-900 border-navy-200";
      case "secretaria":
        return "bg-emerald-50 text-emerald-900 border-emerald-200";
      case "user":
        return "bg-stone-100 text-stone-800 border-stone-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  return (
    <div className="bg-cream-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-beige-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-navy-900">{user.name}</h3>
          <p className="text-stone-600 mt-1">{user.email}</p>
          <div className="flex items-center mt-3 space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                user.role
              )}`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                user.is_approved
                  ? "bg-green-50 text-green-900 border-green-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              {user.is_approved ? "Approved" : "Pending"}
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          {user.is_approved && (
            <div className="ml-4">
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    "Are you sure you want to deactivate this account?"
                  );
                  if (confirmed) {
                    onReject(user.id);
                  }
                }}
                className="p-2 bg-[#fc2b2b9f] text-white rounded-full hover:bg-red-800 transition-colors shadow-sm"
                title="Deactivate Account"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersList = ({ users, loading, onReject }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-stone-600 text-lg">No users found</div>
        <p className="text-stone-500 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onReject={onReject} />
      ))}
    </div>
  );
};

const ApprovalRequests = ({ users, loading, onApprove }) => {
  const pendingUsers = users.filter((user) => !user.is_approved);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-stone-600 text-lg">
          No pending approval requests
        </div>
        <p className="text-stone-500 mt-2">All users have been approved</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => (
        <div
          key={user.id}
          className="bg-cream-50 rounded-lg shadow-md p-6 border-l-4 border-amber-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-navy-900">
                {user.name}
              </h3>
              <p className="text-stone-600">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-navy-100 text-navy-800 border border-navy-200">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onApprove(user.id)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <CiCircleCheck size={30} />
                Approve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function Admin_manageuser() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/users/all");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/users/approve/${userId}`, {
        method: "PUT",
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/users/reject/${userId}`, {
        method: "PUT",
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && user.is_approved) ||
      (approvalFilter === "pending" && !user.is_approved);
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesApproval && matchesSearch;
  });

  const tabs = [
    { id: "all", label: "All Users", count: users.length },
    {
      id: "requests",
      label: "Approval Requests",
      count: users.filter((u) => !u.is_approved).length,
    },
  ];

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "organization", label: "Organization" },
    { value: "secretaria", label: "Secretaria" },
  ];

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={user?.role || "user"} />
        <main className="flex-grow p-8 bg-stone-100 min-h-screen">
          {/* Tabs */}
          <div className="bg-cream-50 rounded-lg shadow-sm mb-6 border border-beige-300">
            <div className="border-b border-x-stone-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? " border-stone-800 text-navy-900 "
                        : " text-stone-600 hover:text-navy-700 hover:border-sky-600"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-navy-200 text-navy-900"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Filters - Only show for "All Users" tab */}
            {activeTab === "all" && (
              <div className="p-6 border-b border-stone-200 bg-stone-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-navy-500 focus:border-navy-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-navy-500 focus:border-navy-500 bg-white"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      Status
                    </label>
                    <select
                      value={approvalFilter}
                      onChange={(e) => setApprovalFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-navy-500 focus:border-navy-500 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {activeTab === "all" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-navy-900">
                      Users ({filteredUsers.length})
                    </h2>
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 bg-[#2a4c80]  text-white rounded-md hover:bg-[#2a4c80b7] transition-colors shadow-sm"
                    >
                      Refresh
                    </button>
                  </div>
                  <UsersList
                    users={filteredUsers}
                    loading={loading}
                    onReject={handleReject}
                  />
                </>
              )}

              {activeTab === "requests" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-navy-900">
                      Pending Approval Requests (
                      {users.filter((u) => !u.is_approved).length})
                    </h2>
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 bg-[#2a4c80]  text-white rounded-md hover:bg-[#2a4c80b7] transition-colors shadow-sm"
                    >
                      Refresh
                    </button>
                  </div>
                  {/* <ApprovalRequests users={users} loading={loading} /> */}
                  <ApprovalRequests
                    users={filteredUsers}
                    loading={loading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Admin_manageuser;
