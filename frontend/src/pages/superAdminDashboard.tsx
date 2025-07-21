import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from '../../config.json';
import { FiHome, FiUsers, FiBarChart2 } from "react-icons/fi";
import { FaUserShield, FaEye } from "react-icons/fa";
import axios from "axios";
import ToastMessage from "./toastmessage";
import blockIcon from '../assets/prohibition.png';
import unblock from '../assets/unlock.png';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

type Document = {
  id: number;
  name: string;
  status: "approved" | "rejected";
  adminName: string;
};

type Admin = {
  _id: string;
  name: string;
  email: string;
  userType: string;
  isBlocked: boolean;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  isBlocked: boolean;
};

const dummyDocuments: Document[] = [
  { id: 1, name: "User A - Doc 1", status: "approved", adminName: "Admin One" },
  { id: 2, name: "User B - Doc 2", status: "rejected", adminName: "Admin Two" },
  { id: 3, name: "User C - Doc 3", status: "approved", adminName: "Admin Two" },
  { id: 4, name: "User D - Doc 4", status: "rejected", adminName: "Admin One" },
];
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const DateFilterPopup = ({ onApply }: { onApply: (start: string, end: string) => void }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [startDate, setStartDate] = useState(yesterday.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const handleApply = () => {
    onApply(startDate, endDate);
    setShowPopup(false);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setShowPopup(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Select Date Range
      </button>

      {/* Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">Select Date Range</h2>

            {/* Start Date */}
            <label className="block mb-2 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />

            {/* End Date */}
            <label className="block mb-2 font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const [modalType, setModalType] = useState<"approved" | "rejected" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalRef2 = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [dataToSend, setdataToSend] = useState({ name: "", email: "" })
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  const [graphData, setGraphData] = useState([]);
  const [filterType, setFilterType] = useState('day'); // day, week, month, year
  const [startDate, setStartDate] = useState(yesterday.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const localUserData = JSON.parse(localStorage.getItem("user") || "{}");

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
      const response = await axios.post(`${config.URL_BACKEND}api/auth/createAdmin`, {
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
      const response = await axios.get(`${config.URL_BACKEND}api/auth/getAllUsers`);
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
      const response = await axios.get(`${config.URL_BACKEND}api/auth/getAllAdmins`);
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

  const blockUser = async (_id: string, userType: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/blockUser`, { _id },
        { headers: { _token: localUserData?.token } }
      );
      ToastMessage("User UnBlocked Successfully", "success", "");
      if (userType === "Admin") {
        fetchAllAdmins();
      } else {
        fetchAllUser();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const unblockUser = async (_id: string, userType: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/unblockUser`, { _id },
        { headers: { _token: localUserData?.token } }
      );
      ToastMessage("User Blocked Successfully", "success", "");
      if (userType === "Admin") {
        fetchAllAdmins();
      } else {
        fetchAllUser();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`${config.URL_BACKEND}api/auth/getGraphData`, {
        params: { filterType, startDate, endDate },
        headers: { _token: localUserData?.token }
      });
      setGraphData(res.data.data);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [filterType]);

  const selectDateHandler = (type: string = 'week') => {
    setFilterType(type);
    const now = new Date();
    let start: Date;
    let end = now;

    switch (type) {
      case 'day':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(start.getMonth() - 1); // last month
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1); // last year
        break;
      case 'custom':
        return; // do nothing (user chooses manually)
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);

  };

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
                          <td className="py-4 px-6 text-base flex gap-2 justify-center">
                            {/* <button className="text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                            {admin.isBlocked ? (
                              <button onClick={() => blockUser(admin?._id, admin?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            ) : (
                              <button onClick={() => unblockUser(admin?._id, admin?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            )}
                            <FaEye onClick={() => navigateToAdmin(admin)} className="w-5 h-5 cursor-pointer" />
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
                          <td className="py-4 px-6 text-base flex gap-2 justify-center">
                            {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                            {user.isBlocked ? (
                              <button onClick={() => blockUser(user?._id, user?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            ) : (
                              <button onClick={() => unblockUser(user?._id, user?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            )}
                            <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 cursor-pointer" />
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
                        <td className="py-4 px-6 text-base flex gap-2 justify-center">
                          {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                          {admin.isBlocked ? (
                            <button onClick={() => blockUser(admin?._id, admin?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          ) : (
                            <button onClick={() => unblockUser(admin?._id, admin?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          )}
                          <FaEye onClick={() => navigateToAdmin(admin)} className="w-5 h-5 cursor-pointer" />
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
                        <td className="py-4 px-6 text-base flex gap-2 justify-center">
                          {/* <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-medium transition"> */}
                          {user.isBlocked ? (
                            <button onClick={() => blockUser(user?._id, user?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          ) : (
                            <button onClick={() => unblockUser(user?._id, user?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          )}
                          <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 cursor-pointer" />
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
            <div className="flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => selectDateHandler(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <DateFilterPopup
                onApply={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                  fetchGraphData();
                }}
              />
            </div>
            <div className="flex justify-around min-w-0 max-h-80 mt-5 rounded-2xl">
              <div className="w-[45%] h-80 border border-gray-500 rounded-2xl mt-4 mb-4">
                <h2 className="text-xl font-semibold ml-5 mb-2">Line Chart - Admins</h2>
                <ResponsiveContainer>
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] h-80 border border-gray-500 rounded-2xl mt-4 mb-4">
                <h2 className="text-xl font-semibold ml-5 mb-2">Bar Chart - Admins</h2>
                <ResponsiveContainer>
                  <BarChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Pie Chart */}
            <div className="flex justify-around min-w-0 max-h-96 mt-20 rounded-2xl">
              <div className="w-[45%] h-80 border border-gray-500 rounded-2xl mt-4 mb-4">
                <h2 className="text-xl font-semibold ml-5 mb-2">Pie Chart - Admins</h2>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={graphData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {graphData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] h-80 border border-gray-500 rounded-2xl mt-4 mb-4">
                <h2 className="text-xl font-semibold ml-5 mb-2">Pie Chart - Users</h2>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={graphData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {graphData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

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
    </div >
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
