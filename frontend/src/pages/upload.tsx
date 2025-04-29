import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { create } from "ipfs-http-client";
import CircularLoader from "../CircularLoader/CircularLoader";

import ToastMessage from "./toastmessage";
import { ethers } from "ethers";
import config from '../../config.json'



let provider = new ethers.providers.JsonRpcProvider(config.URL_RPC)
// const contract = new ethers.Contract(config.contractAddress, config.abi, provider);

const ipfs = create({
  url: config.URL_IPFS,
  
});

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
   const [isCircularLoading,setIsCirculrLoading] = useState(false)
  // Handle File & Folder Selection
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
    event.target.value = '';
  };

  // Handle Drag & Drop
  // const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  //   event.preventDefault();
  //   if (event.dataTransfer.files.length > 0) {
  //     setFiles([...files, ...Array.from(event.dataTransfer.files)]);
  //   }
  // };
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();

  const items = event.dataTransfer.items;
  const droppedFiles: File[] = [];

  const traverseFileTree = async (item: any, path = ""): Promise<void> => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file: File) => {
          const fullPathFile = new File([file], path + file.name, { type: file.type });
          droppedFiles.push(fullPathFile);
          resolve();
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries: any[]) => {
          for (const entry of entries) {
            await traverseFileTree(entry, path + item.name + "/");
          }
          resolve();
        });
      }
    });
  };

  const promises: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i].webkitGetAsEntry?.();
    if (item) {
      promises.push(traverseFileTree(item));
    }
  }

  await Promise.all(promises);

  if (droppedFiles.length > 0) {
    setFiles((prev) => [...prev, ...droppedFiles]);
  }
};


  const uploadToContract = async (folderCid: any) => {
    try {
      // Load Admin Wallet
      const adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
  
      // Get wallet address from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const wallet = userData.walletAddress || "";
  
      if (!wallet) {
      setIsCirculrLoading(false);
      ToastMessage(`Wallet address not found!`,"error",  "")
        return;
      }
  
      // Create contract instance with Admin Wallet
      const contract = new ethers.Contract(config.contractAddress, config.abi, adminWallet);
  
      // Send the transaction
      console.log('wallet, folderCid', wallet, folderCid)
      const tx = await contract.uploadDocument(wallet, folderCid); // Assuming `true` for `verified`
  
      // Wait for confirmation
      await tx.wait();
      setFiles([])
      // progress = 100
      
      setUploadProgress(0);
      setIsCirculrLoading(false);
      ToastMessage("The Document uploaded Successfully","successs", tx.hash|| "")
      // clearInterval(interval);
      console.log("Transaction Confirmed:", tx.hash);
    } catch (error :any) {
      setFiles([])
      // progress = 100
      setIsCirculrLoading(false);
      setUploadProgress(0);
      ToastMessage(`${error?.reason}`,"error",  "")
      console.error("Transaction Failed:", error?.reason);
    }
  };

  // Simulate Upload Progress
  // const handleUpload = async() => {
  //   setIsCirculrLoading(true);
  //   if (files.length === 0) {
  //   setIsCirculrLoading(false);
  //   return
  //   }
    
  //   setUploadProgress(0);
  //   let progress = 0;
  //   // const interval = setInterval(async() => {
      
  //     console.log('ipfs', ipfs)
      
      
  //     // Upload entire folder
  //     let folderCid ;
  //     for await (const file of ipfs.addAll(files, { wrapWithDirectory: true })) {
  //       // progress += 100/files.length;
  //       folderCid   = file.cid; // The last CID corresponds to the whole folder
  //       if(file.path != "")  {
  //         progress += 100/files.length;

  //         setUploadProgress(progress);
          
  //       } 
  //     } 
  //     // window.location.reload()
  //     if (progress == 100) {
  //       await uploadToContract(folderCid?.toString())     
  //     }
    
  //   // }, 300);
  // };
  const handleUpload = async () => {
  setIsCirculrLoading(true);

  if (files.length === 0) {
    setIsCirculrLoading(false);
    return;
  }

  setUploadProgress(0);
  let progress = 0;

  console.log('ipfs', ipfs);

  let folderCid;
  let lastFile = null;

  for await (const file of ipfs.addAll(files, { wrapWithDirectory: true })) {
    // Added: Save last file
    lastFile = file;

    folderCid = file.cid;
    if (file.path !== "") {
      progress += 100 / files.length;
      setUploadProgress(progress);
    }
  }
  //  Added: Final folderCid fix for single file (if lastFile has path, it's a single file, not a folder)
  if (lastFile && lastFile.path && !lastFile.path.includes("/")) {
    folderCid = lastFile.cid; // This is a single file — not a folder
  }
  if (progress === 100 && folderCid) {
    await uploadToContract(folderCid.toString());
  }
};


  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-6">
      {/* Upload Card */}
      <div className="w-full max-w-4xl bg-gray-200 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Upload Files & Folders</h2>
        
        {/* Upload Box Inside the Card */}
        <div
          className="w-full p-8 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-all flex flex-col items-center justify-center cursor-pointer shadow-lg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <FaCloudUploadAlt className="text-indigo-500 text-6xl mb-4" />
          <p className="text-gray-600 text-center ">Drag & Drop your files here</p>
          <p className="text-gray-500 text-sm">or</p>
          
          {/* File Input */}
          {/* <label className="mt-4 px-6 py-3 bg-indigo-500 text-white text-lg font-medium rounded-full shadow-md hover:bg-indigo-600 transition cursor-pointer">
            Select Files / Folders
            <input
              type="file"
              className="hidden"
              multiple
              ref={(input) => {
                if (input) {
                  input.setAttribute("webkitdirectory", "true");
                  input.setAttribute("mozdirectory", "true");
                }
              }}
              onChange={handleFiles}
            />
          </label> */}
             <div className="flex flex-col gap-4">
  {/* 🔹 Button to select files */}
  <label className="px-6 py-3 bg-indigo-500 text-white text-lg font-medium rounded-full shadow-md hover:bg-indigo-600 transition cursor-pointer">
    Select Files
    <input
      type="file"
      className="hidden"
      multiple
      accept="image/*,application/pdf"
      onChange={handleFiles}
    />
  </label>

  {/* 🔹 Button to select folder */}
  <label className="px-6 py-3 bg-green-500 text-white text-lg font-medium rounded-full shadow-md hover:bg-green-600 transition cursor-pointer">
    Select Folder
    <input
      type="file"
      className="hidden"
      multiple
      ref={(input) => {
        if (input) {
          input.setAttribute("webkitdirectory", "true");
          input.setAttribute("mozdirectory", "true");
        }
      }}
      onChange={handleFiles}
    />
  </label>
</div>
        </div>
       

        {/* Display Selected Files */}
        {files.length > 0 && (
          <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Selected Files</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="text-gray-600 bg-white px-4 py-2 rounded-md shadow-sm flex justify-between">
                  📄 {file.name} <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div
                className="bg-indigo-500 h-4 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-600 mt-2">{uploadProgress}% Uploaded</p>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-600 transition"
          >
          {isCircularLoading ? <CircularLoader size={20}/>:  'Upload Files'}
          </button>
        )}
      </div>
    </div>
  );
}
