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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // const contract = new ethers.Contract(config.contractAddress, config.abi, provider);
        const response = await axios.post(`${config.URL_BACKEND}api/auth/userList`);

        const userData = [];
        console.log('response', response)

        for (let i = 0; i < response.data.user.length; i++) {
          const walletAddress = response.data.user[i].walletAddress;
          console.log('walletAddress', walletAddress)
          // let signer =new ethers.Wallet(config.adminPrivateKey)
          const documents = await contract.viewAllDocuments(walletAddress);
          console.log('Documents:', documents);
                    console.log('documents', documents)
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
      console.log("Transaction Confirmed:", tx.hash);

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
    console.log('user', user)
    setSelectedFiles(user.fileLinks);
    setSelectedUser(user.walletAddress);
    setShowModal(true);
  };

  // Pagination Logic
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
    <div className="bg-white min-h-screen flex flex-col items-center p-6">
      <div className="w-full max-w-5xl bg-gray-200 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Admin Dashboard</h2>

        <div className="overflow-x-auto">
          <table className="w-full bg-gray-100 shadow-lg rounded-lg">
            <thead>
              <tr className="bg-gray-300 text-gray-700 text-lg">
                <th className="py-3 px-3 text-left">User Name</th>
                <th className="py-3 px-3 text-left">Email</th>
                <th className="py-3 px-3 text-center">Folders</th>
                <th className="py-3 px-3 text-center">Preview</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-300 text-gray-700">
                  <td className="py-3 px-4 text-left">{user.name}</td>
                  <td className="py-3 px-4 text-left">{user.email}</td>
                  <td className="py-3 px-4 text-center">{user.files}</td>
                  <td className="py-3 px-4 text-center">
                    {user.fileLinks.length > 0 && (
                      <button
                        onClick={() => openModal(user)}
                        className="text-indigo-500 hover:text-indigo-700 flex justify-center items-center"
                      >
                        <FaEye className="mr-1" /> View Files
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.status === "Approved" ? (
                      <span className="text-green-600 flex justify-center items-center">
                        <FaCheckCircle className="mr-1" /> Approved
                      </span>
                    ) : (
                      <span className="text-orange-500 flex justify-center items-center">
                        <FaTimesCircle className="mr-1" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-white ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(users.length / usersPerPage)}
            className={`px-4 py-2 rounded-lg text-white ${currentPage === Math.ceil(users.length / usersPerPage) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            Next
          </button>
        </div>
      </div>






      {/* File Preview Modal */}
       {/* File Preview Modal */}
       {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-1/2 max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">File Previews</h3>
            <div className="grid grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex flex-col items-center">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={file.url}
                      alt={`File ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md shadow-md cursor-pointer"
                      onError={(e) => {
                        e.currentTarget.src = "/decentralizedDb/file-placeholder.png";
                      }}
                    />
                  </a>
                  <p className="mt-2 text-sm text-gray-600">File {index + 1}</p>
                  {!file.approved ? (
                    <button
                      onClick={() => approve(selectedUser!, file.index)}
                      className="mt-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                    >
                      <FaCheckCircle className="mr-1" /> Approve
                    </button>
                  ) : (
                    <span className="mt-2 text-green-600 flex items-center">
                      <FaCheckCircle className="mr-1" /> Approved
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
