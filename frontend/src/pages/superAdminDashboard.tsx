import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from '../../config.json';
import { FiHome, FiUsers, FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import ToastMessage from "./toastmessage";
import blockIcon from '../assets/prohibition.png';
import unblock from '../assets/unlock.png';
import { SuperAdminABI } from '../../NewAbi.tsx'
import { ethers } from "ethers";
import { DateFilterPopup } from "../Common/Utils";
const provider = new ethers.providers.JsonRpcProvider(config.URL_RPC);
const adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
const SuperAdminContract = new ethers.Contract(config.contractAddress, SuperAdminABI, adminWallet);
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Sidebar from "./Sidebar";

const dummyDocuments: any = [
  { id: 1, name: "User A - Doc 1", status: "approved", adminName: "Admin One" },
  { id: 2, name: "User B - Doc 2", status: "rejected", adminName: "Admin Two" },
  { id: 3, name: "User C - Doc 3", status: "approved", adminName: "Admin Two" },
  { id: 4, name: "User D - Doc 4", status: "rejected", adminName: "Admin One" },
];

interface GraphDataItem {
  count: number;
  // Add other properties that might be in your graph data objects
  date?: string;
  name?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [modalType, setModalType] = useState<"approved" | "rejected" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalRef2 = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
  const [dataToSend, setdataToSend] = useState({ name: "", email: "", organization: "", orgContractAddress: "" })
  // const [allUsers, setAllUsers] = useState<any>([]);
  const [allAdmins, setAllAdmins] = useState<any>([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const [adminGraphData, setAdminGraphData] = useState<GraphDataItem[]>([]);
  const [userGraphData, setUserGraphData] = useState<GraphDataItem[]>([]);
  const [filterType, setFilterType] = useState('year'); // day, week, month, year
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);
  const [startDate, setStartDate] = useState(lastYear.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const localUserData = JSON.parse(localStorage.getItem("user") || "{}");
  const [allBalances, setAllBalances] = useState<any>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const totalUsers = allUsers.length;
  const totalAdmins = allAdmins.length;
  const approvedDocs = dummyDocuments.filter((doc: any) => doc.status === "approved");
  const rejectedDocs = dummyDocuments.filter((doc: any) => doc.status === "rejected");
  const navigate = useNavigate();
  const closeModal = () => setModalType(null);

  const navigateToAdmin = (admin: any) => {
    navigate("/adminDashboard", { state: { admin } });
  };

  // const navigateToUser = (user: User) => {
  //   navigate("/userDashboard", { state: { user } });
  // };
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
      if (!dataToSend.name || !dataToSend.email || !dataToSend.organization) {
        if (!dataToSend.name) {
          ToastMessage("Please fill name", "error", "");
        }
        if (!dataToSend.email) {
          ToastMessage("Please fill email", "error", "");
        }
        if (!dataToSend.organization) {
          ToastMessage("Please fill organization", "error", "");
        }
        return;
      }

      //  const localUserDataweallet="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
      // const pk="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
      const localUserDataweallet2 = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
      const pk2 = "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
      //  const localUserDataweallet3="0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
      // const pk3=" 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
      //  const localUserDataweallet4="0x976EA74026E726554dB657fA54763abd0C3a0aa9"
      // const pk4=" 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
      //  const localUserDataweallet5="0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
      //  const pk5="0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"
      const contractResponse = await SuperAdminContract.createOrganization(localUserDataweallet2, dataToSend.organization, { value: ethers.utils.parseEther("0.1") }
      );
      const receipt = await contractResponse.wait();
      setIsCreateModelOpen(false);
      const getAllOrgs = await SuperAdminContract.getAllOrgs();
      if (receipt.status === 1) {
        try {
          const response = await axios.post(`${config.URL_BACKEND}api/auth/createAdmin`, {
            name: dataToSend.name,
            email: dataToSend.email,
            organization: dataToSend.organization,
            userType: "Admin",
            walletAddress: localUserDataweallet2,
            privateKey: pk2,
            orgContractAddress: getAllOrgs[getAllOrgs.length - 1].orgContractAddress
          },
            {
              headers: { _token: localUserData?.token }
            }
          );
          if (response.status === 201) {
            setIsCreateModelOpen(false);
            ToastMessage("Admin Created Successfully", "success", "");
            fetchAllAdmins();
            setdataToSend({ name: "", email: "", organization: "", orgContractAddress: "" })
          }
        } catch (error) {
          console.log(error, 'this is error created==========>');
          ToastMessage("Admin Created Failed", "error", "");
          return;
        }

      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const fetchAllAdmins = async () => {
    const getAllOrgs = await SuperAdminContract.getAllOrgs();
    const getAllOrgsWalletAddresses: string[] = getAllOrgs.map((org: { orgAdmin: string }) => org.orgAdmin);
    const getallbalance = await SuperAdminContract.getAllOrgAdminBalances();
    setAllBalances(getallbalance[1])
    try {
      const response = await axios.get(`${config.URL_BACKEND}api/auth/getAllAdminsByWalletAddress?walletAddresses=${getAllOrgsWalletAddresses}`);
      if (response.status === 200) {
        setAllAdmins(response.data.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    // fetchAllUser();
    fetchAllAdmins();
  }, [])


  const blockUser = async (id: string, userType: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/blockUser`, { id },
        { headers: { _token: localUserData?.token } }
      );
      ToastMessage("User UnBlocked Successfully", "success", "");
      if (userType === "Admin") {
        fetchAllAdmins();
      } else {
        // fetchAllUser();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const unblockUser = async (id: string, userType: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/unblockUser`, { id },
        { headers: { _token: localUserData?.token } }
      );
      ToastMessage("User Blocked Successfully", "success", "");
      if (userType === "Admin") {
        fetchAllAdmins();
      } else {
        // fetchAllUser();
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
      setAdminGraphData(res.data.data.admins);
      setUserGraphData(res.data.data.users);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchGraphData();
    }
  }, [startDate, endDate]);

  const selectDateHandler = (type: string = 'year') => {
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
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);

  };

  const pieData = [
    { label: 'Admins', count: adminGraphData?.reduce((sum, item) => sum + item.count, 0) },
    { label: 'Users', count: userGraphData?.reduce((sum, item) => sum + item.count, 0) },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden rounded-3xl bg-white mx-4 flex">
      <button
        className="lg:hidden relative z-[50] w-5 h-5 top-[20px] font-semibold left-4 bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <FiMenu className="text-2xl" />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        title="Super Admin"
        navItems={[
          { label: "Dashboard", icon: <FiHome />, value: "Dashboard" },
          { label: "Admins", icon: <FiUsers />, value: "Admins" },
          { label: "Reports", icon: <FiBarChart2 />, value: "Reports" },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-5 overflow-x-hidden">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold ml-10 text-gray-800">{activeTab}</h1>
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
              {/* <StatCard label="Total Users" value={totalUsers} color="blue" /> */}
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
                        <th className="py-4 px-6 text-left">Balance</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {allAdmins.length > 0 && allAdmins.slice(0, 5)?.map((admin: any, index: any) => (
                        <tr key={index} className="border-t hover:bg-gray-50 transition">
                          <td className="py-4 px-6 text-base">{admin?.name}</td>
                          <td className="py-4 px-6 text-base">{admin?.email}</td>
                          <td className="py-4 px-6 text-base">{admin?.userType}</td>
                          <td className="py-4 px-6 text-base">{allBalances[index] ? Number(ethers.utils.formatEther(allBalances[index])).toFixed(2) : "0"}</td>
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
              {/* <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
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
                            {user.isBlocked ? (
                              <button onClick={() => blockUser(user?._id, user?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            ) : (
                              <button onClick={() => unblockUser(user?._id, user?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                            )}
                            <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 cursor-pointer" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
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
                      <th className="py-4 px-6 text-left">Organization</th>
                      <th className="py-4 px-6 text-left">Balance</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {allAdmins.length > 0 && allAdmins.map((admin: any, index: any) => (
                      <tr key={index} className="border-t hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-base">{admin.name}</td>
                        <td className="py-4 px-6 text-base">{admin.email}</td>
                        <td className="py-4 px-6 text-base">{admin.userType}</td>
                        <td className="py-4 px-6 text-base">{allBalances[index] ? Number(ethers.utils.formatEther(allBalances[index])).toFixed(2) : "0"}</td>
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

        {/* {
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
                          {user.isBlocked ? (
                            <button onClick={() => blockUser(user?._id, user?.userType)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          ) : (
                            <button onClick={() => unblockUser(user?._id, user?.userType)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                          )}
                          <FaEye onClick={() => navigateToUser(user)} className="w-5 h-5 cursor-pointer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        } */}

        {
          activeTab === "Reports" &&
          <>
            <div className="flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => selectDateHandler(e.target.value)}
                className="border pr-4 pl-4 p-2 bg-gray-100 hover:bg-gray-200 mb-2 rounded"
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
                }}
              />
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-12 py-8">
              <div className="flex flex-col xl:flex-row justify-center gap-8 w-full">
                {/* Admin Line Chart */}
                <div className="w-full xl:w-[45%] max-w-[700px] mx-auto bg-gray-300 shadow-md rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-center text-gray-800">Admins</h2>
                  {/* <p className="text-sm text-gray-500 mb-4">IN THOUSANDS (USD)</p> */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adminGraphData}>
                        <CartesianGrid stroke="#eee" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#444' }} />
                        <YAxis tick={{ fill: '#444' }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#0f172a"
                          strokeWidth={3}
                          dot={{ r: 5, stroke: '#0f172a', strokeWidth: 2, fill: 'white' }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* User Line Chart */}
                <div className="w-full xl:w-[45%] max-w-[700px] mx-auto bg-gray-300 shadow-md rounded-2xl p-6">
                  <h2 className="text-2xl font-semibold text-center text-gray-800">Users</h2>
                  {/* <p className="text-sm text-gray-500 mb-4">IN THOUSANDS (USD)</p> */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGraphData}>
                        <CartesianGrid stroke="#eee" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#444' }} />
                        <YAxis tick={{ fill: '#444' }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#0f172a"
                          strokeWidth={3}
                          dot={{ r: 5, stroke: '#0f172a', strokeWidth: 2, fill: 'white' }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Pie Chart */}
              <div className="mt-10 w-full xl:w-[50%] max-w-[700px] mx-auto bg-gray-300 shadow-md rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-center text-gray-800">Graph</h2>
                {/* <p className="text-sm text-gray-500 mb-4">Distribution of Admins & Users</p> */}
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Organization</label>
                    {/* <input type="text" placeholder="Organization" value={dataToSend.organization} onChange={(e) => setdataToSend({ ...dataToSend, organization: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500" required /> */}
                    <div className="relative  w-full inline-block">
                      <select
                        onChange={(e) => setdataToSend({ ...dataToSend, organization: e.target.value })}
                        className="appearance-none w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" disabled selected hidden>Select Organization...</option>
                        <option value="Uid">Aadhaar Card</option>
                        <option value="Pan">PAN Card</option>
                        <option value="Passport">Passport</option>
                        <option value="VoterId">Voter ID</option>
                        <option value="DrivingLicense">Driving License</option>
                        <option value="RationCard">Ration Card</option>
                        <option value="BirthCertificate">Birth Certificate</option>
                        <option value="IncomeCertificate">Income Certificate</option>
                        <option value="CasteCertificate">Caste Certificate</option>
                        <option value="ResidenceProof">Residence Proof</option>
                        <option value="ElectricityBill">Electricity Bill</option>
                        <option value="BankPassbook">Bank Passbook</option>
                      </select>

                      {/* Custom arrow icon */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button type="submit" className="w-1/2 self-center text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">Create Admin</button>
                  </div>
                </form>
                {/* <div className="mt-6 text-right">
                  <button onClick={() => setIsCreateModelOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition">
                    Close
                  </button>
                </div> */}
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
