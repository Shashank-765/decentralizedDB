import { useState, useEffect } from "react";
import { FaEye, FaCheckCircle, FaTimesCircle, FaUsers, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { ethers } from "ethers";
import config from "../../config.json";
import ToastMessage from "./toastmessage";
import blockIcon from '../assets/prohibition.png';
import unblock from '../assets/unlock.png';
import { useLocation } from "react-router-dom";

const provider = new ethers.providers.JsonRpcProvider(config.URL_RPC);
const adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
const contract = new ethers.Contract(config.contractAddress, config.abi, adminWallet);

export default function UserDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [activeTab, setActiveTab] = useState("users");
  const location = useLocation();

  const adminLocalData = location.state?.admin;
  console.log(adminLocalData, 'this is admin data')


  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${config.URL_BACKEND}api/auth/userList`);
      const userData = [];
      for (let i = 0; i < response.data.user.length; i++) {
        const walletAddress = response.data.user[i].walletAddress;
        const documents = await contract.viewAllDocuments(walletAddress);
        let userFiles = documents.map((doc: any, index: number) => ({
          url: `https://ipfs.io/ipfs/${doc[0]}`,
          approved: doc[1],
          index,
        }));
        const allApproved = userFiles.every((file: any) => file.approved);
        userData.push({
          id: response.data.user[i]._id,
          name: response.data.user[i].name,
          email: response.data.user[i].email,
          walletAddress,
          isBlocked: response.data.user[i].isBlocked,
          files: userFiles.length,
          fileLinks: userFiles,
          status: allApproved ? "Approved" : "Pending",
        });
      }
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approve = async (walletAddress: string, index: number) => {
    try {
      const tx = await contract.verifyDocument(walletAddress, index);
      await tx.wait();
      ToastMessage("Document Approved Successfully", "success", tx.hash || "");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.walletAddress === walletAddress
            ? {
              ...user,
              fileLinks: user.fileLinks.map((file: any, i: any) =>
                i === index ? { ...file, approved: true } : file
              ),
              status: user.fileLinks.every((file: any, i: any) => i === index || file.approved)
                ? "Approved"
                : "Pending",
            }
            : user
        )
      );
      setShowModal(false);
    } catch (error: any) {
      ToastMessage(`${error?.reason}`, "error", "");
    }
  };

  const openModal = (user: any) => {
    setSelectedFiles(user.fileLinks);
    setSelectedUser(user.walletAddress);
    setShowModal(true);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalApproved = users.filter((u) => u.status === "Approved").length;
  const totalRejected = users.filter((u) => u.status !== "Approved" && u.fileLinks.length > 0).length;

  const nextPage = () => {
    if (currentPage < Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const blockUser = async (id: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/blockUser`, { id });
      ToastMessage("User UnBlocked Successfully", "success", "");
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const unblockUser = async (id: string) => {
    try {
      await axios.post(`${config.URL_BACKEND}api/auth/unblockUser`, { id });
      ToastMessage("User Blocked Successfully", "success", "");
      fetchUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden rounded-3xl mx-4 flex">
      <aside className="min-w-[256px] shadow-2xl p-6 bg-gray-300 hidden md:block rounded-3xl text-black">
        <h2 className="text-2xl text-center font-extrabold text-black mb-8">Admin</h2>
        <ul className="space-y-4 font-medium text-black">
          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${activeTab === "users"
                ? "bg-gray-700 text-white"
                : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("users")}
            >
              <FaUsers className="text-lg" /> Users
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${activeTab === "report"
                ? "bg-gray-700 text-white"
                : "text-black hover:bg-gray-700 hover:text-white"
                }`}
              onClick={() => setActiveTab("report")}
            >
              <FaChartPie className="text-lg" /> Reports
            </button>
          </nav>
        </ul>
      </aside>

      <div className="flex-1 p-6 rounded-3xl">
        {activeTab === "users" && (
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-8">{adminLocalData?.name || "Admin"} Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <StatCard label="Users" value={users.length} color="blue" />
              <StatCard label="Approved" value={totalApproved} color="green" />
              <StatCard label="Rejected" value={totalRejected} color="red" />
            </div>

            <div className="overflow-x-auto rounded-xl bg-white shadow">
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-gray-100 text-gray-800 text-lg font-semibold">
                  <tr>
                    <th className="py-4 px-6 text-left">User Name</th>
                    <th className="py-4 px-6 text-left">Email</th>
                    <th className="py-4 px-6 text-center">Folders</th>
                    <th className="py-4 px-6 text-center">Preview</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">{user.name}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6 text-center">{user.files}</td>
                      <td className="py-4 px-6 text-center">
                        {user.fileLinks.length > 0 ? (
                          <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 font-medium flex justify-center items-center gap-1">
                            <FaEye /> View Files
                          </button>
                        ) : 'No Files'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {user.status === "Approved" ? (
                          <span className="text-green-600 flex items-center justify-center gap-1">
                            {user.fileLinks.length > 0 ? <> <FaCheckCircle /> Approved</> : 'Not Yet'}
                          </span>
                        ) : (
                          <span className="text-yellow-500 flex items-center justify-center gap-1">
                            <FaTimesCircle /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center flex gap-2 justify-center">
                        {user.isBlocked ? (
                          <button onClick={() => blockUser(user.id)} className="text-red-600"><img src={blockIcon} alt="" className="w-5 h-5 cursor-pointer" /></button>
                        ) : (
                          <button onClick={() => unblockUser(user.id)} className="text-green-600"><img src={unblock} alt="" className="w-5 h-5 cursor-pointer" /></button>
                        )}
                        <FaEye className="w-5 h-5 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 px-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-5 py-2 rounded-xl font-semibold text-white transition ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                Previous
              </button>
              <span className="text-gray-600 text-lg font-medium">
                Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                className={`px-5 py-2 rounded-xl font-semibold text-white transition ${currentPage === Math.ceil(users.length / usersPerPage)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                Next
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">File Previews</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={file.url}
                            alt={`File ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-md shadow-md hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "/decentralizedDb/file-placeholder.png";
                            }}
                          />
                        </a>
                        <p className="mt-3 text-sm font-medium text-gray-700">File {index + 1}</p>
                        {!file.approved ? (
                          <button onClick={() => selectedUser && approve(selectedUser, file.index)} className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1">
                            <FaCheckCircle /> Approve
                          </button>
                        ) : (
                          <span className="mt-2 text-green-600 flex items-center gap-1">
                            <FaCheckCircle /> Approved
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "report" && (
          <div className="text-gray-700 text-xl text-center mt-20">Report Page Coming Soon...</div>
        )}
      </div>
    </div>

  );
}

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
      className={`rounded-2xl shadow-md p-5 hover:shadow-lg transition ${onClick ? "hover:bg-opacity-90" : ""
        } ${baseColor}`}
    >
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};