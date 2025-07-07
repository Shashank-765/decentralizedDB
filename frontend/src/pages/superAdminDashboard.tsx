import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiBarChart2 } from "react-icons/fi";
import { FaUserShield, FaEye } from "react-icons/fa";
import axios from "axios";

type Document = {
  id: number;
  name: string;
  status: "approved" | "rejected";
  adminName: string;
};

type Admin = {
  id: number;
  name: string;
  email: string;
  userType: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  userType: string;
};

const dummyDocuments: Document[] = [
  { id: 1, name: "User A - Doc 1", status: "approved", adminName: "Admin One" },
  { id: 2, name: "User B - Doc 2", status: "rejected", adminName: "Admin Two" },
  { id: 3, name: "User C - Doc 3", status: "approved", adminName: "Admin Two" },
  { id: 4, name: "User D - Doc 4", status: "rejected", adminName: "Admin One" },
];

const SuperAdminDashboard: React.FC = () => {
  const [modalType, setModalType] = useState<"approved" | "rejected" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalRef2 = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [dataToSend, setdataToSend] = useState({ name: "", email: "" })
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);


  const totalUsers = allUsers.length;
  const totalAdmins = allAdmins.length;
  const approvedDocs = dummyDocuments.filter((doc) => doc.status === "approved");
  const rejectedDocs = dummyDocuments.filter((doc) => doc.status === "rejected");
  const navigate = useNavigate();
  const closeModal = () => setModalType(null);

  const navigateToAdmin = (admin: Admin) => {
    navigate("/adminDashboard", { state: { admin } });
  };

  const navigateToUser = (user: User) => {
    navigate("/userDashboard", { state: { user } });
  };
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };
    if (modalType) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [modalType]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef2.current && !modalRef2.current.contains(event.target as Node)) {
        setIsCreateModelOpen(false);
      }
    };
    if (isCreateModelOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isCreateModelOpen]);

  const createAdminHandler = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/auth/createAdmin", {
        name: dataToSend.name,
        email: dataToSend.email,
      });
      if (response.status === 201) {
        setIsCreateModelOpen(false);
        setdataToSend({ name: "", email: "" })
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const fetchAllUser = async () => {

    try {
      const response = await axios.get("http://localhost:4000/api/auth/getAllUsers");
      if (response.status === 200) {
        setAllUsers(response.data.user);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  const fetchAllAdmins = async () => {

    try {
      const response = await axios.get("http://localhost:4000/api/auth/getAllAdmins");
      if (response.status === 200) {
        setAllAdmins(response.data.admin);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  useEffect(() => {
    fetchAllUser();
    fetchAllAdmins();
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden rounded-3xl bg-white mx-4 flex">
      {/* Sidebar */}
      <aside className="w-[256px] shadow-2xl p-6 bg-gray-300 hidden mt-10 mb-5 md:block rounded-2xl text-black">
        <h2 className="text-2xl text-center font-extrabold text-black mb-8">Super Admin</h2>
        <ul className="space-y-4 font-medium text-black">
          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition
              ${activeTab === "Dashboard"
                  ? "bg-gray-700 text-white"
                  : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("Dashboard")}
            >
              <FiHome className="text-lg transition-colors duration-200" />
              Dashboard
            </button>

            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition
              ${activeTab === "Admins"
                  ? "bg-gray-700 text-white"
                  : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("Admins")}
            >
              <FiUsers className="text-lg transition-colors duration-200" />
              Admin
            </button>

            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition
              ${activeTab === "Users"
                  ? "bg-gray-700 text-white"
                  : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("Users")}
            >
              <FaUserShield className="text-lg transition-colors duration-200" />
              Users
            </button>

            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition
              ${activeTab === "Reports"
                  ? "bg-gray-700 text-white"
                  : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("Reports")}
            >
              <FiBarChart2 className="text-lg transition-colors duration-200" />
              Reports
            </button>
          </nav>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-5 overflow-x-hidden">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{activeTab}</h1>
          {
            activeTab === "Admins" && (
              <button onClick={() => setIsCreateModelOpen(true)} className="bg-gray-700 text-white px-4 py-2 flex items-center gap-2 rounded-full text-sm font-medium transition"> + Create Admin</button>
            )
          }
        </div>

        {/* Overview dashboard */}

        {activeTab === "Dashboard" &&
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Users" value={totalUsers} color="blue" />
              <StatCard label="Total Admins" value={totalAdmins} color="purple" />
              <StatCard label="Total Approved" value={approvedDocs.length} color="green" />
              <StatCard label="Total Rejected" value={rejectedDocs.length} color="red" />
            </div>

            <div className="flex flex-col xl:flex-row flex-wrap gap-6 min-h-[420px]">
              {/* Admin Table */}
              <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-700 px-6 py-4 border-b">Admins</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="py-4 px-6 text-left">Name</th>
                        <th className="py-4 px-6 text-left">Email</th>
                        <th className="py-4 px-6 text-left">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {allAdmins?.map((admin, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50 transition">
                          <td className="py-4 px-6 text-base">{admin.name}</td>
                          <td className="py-4 px-6 text-base">{admin.email}</td>
                          <td className="py-4 px-6 text-base">{admin.userType}</td>
                          <td className="py-4 px-6 text-base align-center">
                            {/* <button className="text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                            <FaEye onClick={() => navigateToAdmin(admin)} className="w-5 h-5 mx-auto cursor-pointer" />
                            {/* </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users Table */}
              <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-700 px-6 py-4 border-b">Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="py-4 px-6 text-left">Name</th>
                        <th className="py-4 px-6 text-left">Email</th>
                        <th className="py-4 px-6 text-left">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {allUsers?.map((user, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50 transition">
                          <td className="py-4 px-6 text-base">{user.name}</td>
                          <td className="py-4 px-6 text-base">{user.email}</td>
                          <td className="py-4 px-6 text-base">{user.userType}</td>
                          <td className="py-4 px-6 text-base">
                            {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                            <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 mx-auto cursor-pointer" />
                            {/* </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        }

        {
          activeTab === "Admins" &&
          <>
            <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-700 px-6 py-4 border-b">Admins</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-4 px-6 text-left">Name</th>
                      <th className="py-4 px-6 text-left">Email</th>
                      <th className="py-4 px-6 text-left">Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {allAdmins.map((admin, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-base">{admin.name}</td>
                        <td className="py-4 px-6 text-base">{admin.email}</td>
                        <td className="py-4 px-6 text-base">{admin.userType}</td>
                        <td className="py-4 px-6">
                          {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                          <FaEye onClick={() => navigateToAdmin(admin)} className="w-5 h-5 mx-auto cursor-pointer" />
                          {/* </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }

        {
          activeTab === "Users" &&
          <>
            <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-700 px-6 py-4 border-b">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-4 px-6 text-left">Name</th>
                      <th className="py-4 px-6 text-left">Email</th>
                      <th className="py-4 px-6 text-left">Role</th>
                      <th className="py-4 px-6 text-left">Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {allUsers.map((user, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-base">{user.name}</td>
                        <td className="py-4 px-6 text-base">{user.email}</td>
                        <td className="py-4 px-6 text-base">{user.userType}</td>
                        <td className="py-4 px-6 text-base">{user.userType}</td>
                        <td className="py-4 px-6">
                          {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                          <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 mx-auto cursor-pointer" />
                          {/* </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }

        {
          activeTab === "Reports" &&
          <>
            <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-700">Reports</h2>
              <div className="overflow-x-auto">
              </div>
            </div>
            <h1 className="text-lg text-center font-semibold text-gray-700 px-6 py-4 border-b">comming soon...</h1>
          </>
        }

        {
          isCreateModelOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div ref={modalRef2} className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4 capitalize text-gray-700">Create Admin</h2>
                <form onSubmit={createAdminHandler}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Name</label>
                    <input type="text" placeholder="Name" value={dataToSend.name} onChange={(e) => setdataToSend({ ...dataToSend, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500" required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input type="email" placeholder="Email" value={dataToSend.email} onChange={(e) => setdataToSend({ ...dataToSend, email: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500" required />
                  </div>
                  {/* <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Password</label>
                    <input type="password" placeholder="Password" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500" required />
                  </div> */}
                  <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition">Create Admin</button>
                </form>
                <div className="mt-6 text-right">
                  <button onClick={() => setIsCreateModelOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </main>
    </div>
  );
};

// Reusable StatCard Component
const StatCard: React.FC<{
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "purple";
  onClick?: () => void;
}> = ({ label, value, color, onClick }) => {
  const baseColor = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    purple: "text-purple-600 bg-purple-100",
  }[color];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl shadow-md p-8 hover:shadow-lg transition ${onClick ? "hover:bg-opacity-90" : ""
        } ${baseColor}`}
    >
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default SuperAdminDashboard;
