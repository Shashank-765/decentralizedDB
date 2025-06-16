import { useState, useEffect } from "react";
import { FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { ethers } from "ethers";
import config from "../../config.json";
import ToastMessage from "./toastmessage";
// const provider = new ethers.JsonRpcProvider(config.rpcUrl);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // const contract = new ethers.Contract(config.contractAddress, config.abi, provider);
        const response = await axios.post(`${config.URL_BACKEND}api/auth/userList`);

        const userData = [];

        for (let i = 0; i < response.data.user.length; i++) {
          const walletAddress = response.data.user[i].walletAddress;
          // let signer =new ethers.Wallet(config.adminPrivateKey)
          const documents = await contract.viewAllDocuments(walletAddress);
          let userFiles = documents.map((doc: any, index: number) => ({
            url: `https://ipfs.io/ipfs/${doc[0]}`,
            approved: doc[1],
            index,
          }));

          const allApproved = userFiles.every((file :any) => file.approved);

          userData.push({
            id: response.data.user[i]._id,
            name: response.data.user[i].name,
            email: response.data.user[i].email,
            walletAddress,
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

    fetchUsers();
  }, []);

  const approve = async (walletAddress: string, index: number) => {
    try {
      const adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
      const contract = new ethers.Contract(config.contractAddress, config.abi, adminWallet);

      const tx = await contract.verifyDocument(walletAddress, index);
      await tx.wait();

      ToastMessage("Document Approved Successfully", "success", tx.hash || "");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.walletAddress === walletAddress
            ? {
                ...user,
                fileLinks: user.fileLinks.map((file : any, i :any) =>
                  i === index ? { ...file, approved: true } : file
                ),
                status: user.fileLinks.every((file :any, i :any) => i === index || file.approved)
                  ? "Approved"
                  : "Pending",
              }
            : user
        )
      );
      setShowModal(false);
    } catch (error :any) {
      ToastMessage(`${error?.reason }`, "error", "");
      console.error("Transaction Failed:", error?.reason);
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

  return (
<div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen flex flex-col items-center p-6">
  <div className="w-full max-w-6xl bg-white p-8 rounded-3xl shadow-2xl">
    <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Admin Dashboard</h2>

    <div className="overflow-x-auto rounded-xl">
      <table className="w-full table-auto border-collapse shadow-md">
        <thead className="bg-gray-100 text-gray-800 text-lg font-semibold">
          <tr>
            <th className="py-4 px-6 text-left">User Name</th>
            <th className="py-4 px-6 text-left">Email</th>
            <th className="py-4 px-6 text-center">Folders</th>
            <th className="py-4 px-6 text-center">Preview</th>
            <th className="py-4 px-6 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="py-4 px-6">{user.name}</td>
              <td className="py-4 px-6">{user.email}</td>
              <td className="py-4 px-6 text-center">{user.files}</td>
              <td className="py-4 px-6 text-center">
                {user.fileLinks.length > 0 && (
                  <button
                    onClick={() => openModal(user)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex justify-center items-center gap-1"
                  >
                    <FaEye /> View Files
                  </button>
                )}
              </td>
              <td className="py-4 px-6 text-center">
                {user.status === "Approved" ? (
                  <span className="text-green-600 flex items-center justify-center gap-1">
                    <FaCheckCircle /> Approved
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center justify-center gap-1">
                    <FaTimesCircle /> Pending
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-between items-center mt-6 px-4">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
          currentPage === 1
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
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
        className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
          currentPage === Math.ceil(users.length / usersPerPage)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  </div>

  {/* Modal */}
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
                <button
                  onClick={() => approve(selectedUser!, file.index)}
                  className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                >
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
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
