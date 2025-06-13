import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import config from "../../config.json";
import './footer.css'
import { Link } from "react-router-dom";
import axios from "axios";
const provider = new ethers.providers.JsonRpcProvider(config.URL_RPC);

export default function UserProfile() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<string[]>([]);
  interface IpfsFile {
    cid: string;
  }
  const [informationFile,setInformationFile] = useState<IpfsFile[]>([]);
  const [ipfsContents, setIpfsContents] = useState<any[]>([]);
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
    fetcuserdatafrombackend();
  }, []);

  // Separate effect to fetch documents only when user.walletAddress is available
  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserDocuments(user?.walletAddress);
    }
  }, [user?.walletAddress]); // Runs only when walletAddress is updated

  const fetcuserdatafrombackend = async () => {
    try {
      const response = await axios.get(`${config.URL_BACKEND}api/auth/getuserfilebycid?userId=${JSON.parse(localStorage.getItem("user") || "{}")?.userId}`);
      const data = await response?.data?.user;
      setInformationFile(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
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
  const fetchContentFromIpfs = async (cid: string, filename = "InformationForm.json") => {
    const gateways = [
      `http://143.110.176.177:8080/ipfs/${cid}/${filename}`,
      // `https://ipfs.io/ipfs/${cid}/${filename}`,
      // `https://dweb.link/ipfs/${cid}/${filename}`,
    ];
  
    for (const url of gateways) {
      try {
        const res = await fetch(url, { cache: "no-store", mode: "cors" });
  
        if (!res.ok) continue;
  
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return await res.json();
        } else {
          return await res.text();
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${url}`, err);
      }
    }
  
    console.error("All IPFS gateways failed for CID:", cid);
    return null;
  };
  useEffect(() => {
    const loadIpfsContents = async () => {
      console.log(informationFile,'informationFile')
      const allContents = await Promise.all(
        informationFile.map((file) => fetchContentFromIpfs(file.cid, "InformationForm.json"))
      );
      setIpfsContents(allContents);
      console.log(allContents,'allContents')
    };
  
    if (informationFile?.length > 0 && informationFile[0].cid) {
      loadIpfsContents();
    }
  }, [informationFile]);

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center p-10">
      {/* User Profile Card */}
      {/* Desktop Menu */}
          <ul className={`hidden md:flex space-x-6 editbuttons`}>
            <li><Link to="/edit" className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition ">edit</Link></li></ul>
      {user && (
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-lg mb-8 transform transition hover:scale-105">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white font-bold">{user.name.charAt(0)}{user.name.charAt(1)}{user.name.charAt(2)}</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm shadow-md walletaddressed text-center">
            Wallet: {user.walletAddress}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="w-full max-w-5xl">
  {loading ? (
    <p className="text-gray-600 text-center">Loading documents...</p>
  ) : files.length === 0 && informationFile.length === 0 ? (
    <p className="text-gray-500 text-center">No verified documents found.</p>
  ) : (
    <>
      {/* Show FILES section first if available */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center transition transform hover:scale-105"
            >
              <img
                src={`https://ipfs.io/ipfs/${file}`}
                alt={`Document ${index + 1}`}
                className="w-40 h-40 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "/decentralizedDb/file-placeholder.png";
                }}
              />
              <a
                onClick={() => {
                  navigate("/viewDocuments", { state: { file } });
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
              >
                View Document
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Show INFORMATION FILE section if available */}
      {informationFile.length > 0 && ipfsContents.length > 0 && (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
       {ipfsContents.map((content, index) => (
         <div
           key={index}
           className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02] p-6 flex flex-col justify-between"
         >
           <div>
             <h2 className="text-xl font-semibold text-indigo-600 mb-4">
               Document #{index + 1}
             </h2>
     
             {Array.isArray(content) ? (
               <div className="space-y-3">
                 {content.map((field, idx) => (
                   <div key={idx} className="text-sm text-gray-700">
                     <span className="font-medium text-gray-900 capitalize">
                       {field.key}:
                     </span>{" "}
                     <span>{field.value}</span>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-red-500">Invalid data format</p>
             )}
           </div>
     
           <div className="mt-6">
             <a
               href={`http://127.0.0.1:5001/ipfs/bafybeid26vjplsejg7t3nrh7mxmiaaxriebbm4xxrxxdunlk7o337m5sqq/#/ipfs/${informationFile[index].cid}/InformationForm.json`}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-block text-center w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold py-2 px-4 transition cursor-pointer"
             >
               View IPFS File
             </a>
           </div>
         </div>
       ))}
     </div>
     
      )}
    </>
  )}
</div>

    </div>
  );
}
