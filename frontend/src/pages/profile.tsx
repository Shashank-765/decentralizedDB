import { useState, useEffect } from "react";
import { ethers } from "ethers";
import config from "../../config.json";

const provider = new ethers.providers.JsonRpcProvider(config.URL_RPC);

export default function UserProfile() {
  const [files, setFiles] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; walletAddress: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        name: parsedUser.name,
        email: parsedUser.email,
        walletAddress: parsedUser.walletAddress,
      });
    }
  }, []);

  // Separate effect to fetch documents only when user.walletAddress is available
  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserDocuments(user?.walletAddress);
    }
  }, [user?.walletAddress]); // Runs only when walletAddress is updated

  const fetchUserDocuments = async (wallet :any) => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(config.contractAddress, config.abi, provider);
      const verifiedFiles = await contract.viewDocuments(wallet);
      setFiles(verifiedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center p-10">
      {/* User Profile Card */}
      {user && (
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-8 transform transition hover:scale-105">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white font-bold">{user.name.charAt(0)}{user.name.charAt(1)}{user.name.charAt(2)}</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm shadow-md">
            Wallet: {user.walletAddress}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="w-full max-w-5xl">
        {loading ? (
          <p className="text-gray-600 text-center">Loading documents...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500 text-center">No verified documents found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center transition transform hover:scale-105">
                <img
                  src={`https://ipfs.io/ipfs/${file}`}
                  alt={`Document ${index + 1}`}
                  className="w-40 h-40 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = "/decentralizedDb/file-placeholder.png";
                  }}    
                />
                <a
                  href={`https://ipfs.io/ipfs/${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
