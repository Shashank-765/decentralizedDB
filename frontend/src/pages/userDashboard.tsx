import React, { useRef, useEffect, useState } from "react";
import { FiHome, FiUsers, FiBarChart2, FiMenu, FiX } from "react-icons/fi";
import { FaCloudUploadAlt } from "react-icons/fa";
import { create } from "ipfs-http-client";
import CircularLoader from "../Common/CircularLoader.tsx";
import ToastMessage from "./toastmessage";
import { ethers } from "ethers";
import config from '../../config.json';
import pdficon from '../assets/pdficon.png'
import fileIcons from '../assets/fileIcons.png'
import { useLocation } from "react-router-dom";
// import { useWeb3Auth } from "@web3auth/modal/react";
import axios from 'axios';
import { decryptFile, fetchContentFromIpfs, encryptFile, encryptJsonData, ensureMinBalance } from "../Common/Utils";
import Sidebar from './Sidebar'

interface DecryptedFile {
    url: string;
    name: string;
    mimeType: string;
    folderName: string;
    type: string;
}

let Jsonprovider = new ethers.providers.JsonRpcProvider(config.URL_RPC);
// let wallet = new ethers.Wallet(config.adminPrivateKey, Jsonprovider);

import { OrgContractABI } from '../../NewAbi.tsx'
const ipfs = create({
    url: config.URL_IPFS,
});

const UserDashboard: React.FC = () => {
    const [modalType, setModalType] = useState<"approved" | "rejected" | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const modalRef2 = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [ipfsFile, setIpfsFile] = useState<string[]>([]);
    const [ipfsContents, setIpfsContents] = useState<any[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isCircularLoading, setIsCirculrLoading] = useState(false);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [orgContractAddress, setOrgContractAddress] = useState<any>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    interface Organization {
        orgContractAddress: string;
        [key: string]: any;
    }

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    // const approvedDocs = dummyDocuments.filter((doc) => doc.status === "approved");
    // const rejectedDocs = dummyDocuments.filter((doc) => doc.status === "rejected");
    const rejectedDocs = [];
    // const pendingDocs = dummyDocuments.filter((doc) => doc.status === "pending");
    const pendingDocs = [];
    const closeModal = () => setModalType(null);
    const [previewDoc, setPreviewDoc] = useState<DecryptedFile | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        documentId: '',
        selectHoldData: '',
    });
    const location = useLocation();
    const adminUser = location.state?.user;
    const userData = adminUser ? adminUser : JSON.parse(localStorage.getItem("user") || "{}");

    const fetchAllOrganization = async () => {
        try {
            const response = await axios.get(`${config.URL_BACKEND}api/auth/getAllOrganization`, {
                headers: { _token: userData?.token }
            })
            setOrganizations(response.data.data)
        } catch (error) {
            console.log(error, "error")
        }
    }
    useEffect(() => {
        fetchAllOrganization();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'type') {
            if (value == '') {
                setFormData(prev => ({
                    ...prev,
                    selectHoldData: '',
                    type: '',
                }));
                return;
            }
            const parsed = JSON.parse(value)
            setOrgContractAddress(parsed.orgContractAddress)

            setFormData(prev => ({
                ...prev,
                type: parsed.organization,
                selectHoldData: value,
            }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

    };
    useEffect(() => {
        async function getSigner() {
            try {
                if (!Jsonprovider) {
                    console.error("Provider is not available");
                    return;
                }
                const ethersProvider = new ethers.providers.JsonRpcProvider(config.URL_RPC);
                const signer = new ethers.Wallet(userData?.privateKey, ethersProvider);
                setSigner(signer);
                const address = await signer.getAddress();
                await ensureMinBalance(address);

            } catch (error) {
                console.error(error, "<--------------------------------error");
            }
        }

        getSigner();
    }, [Jsonprovider]);


    // useEffect(() => {
    //     if (userData?.walletAddress) {
    //             const contract = new ethers.Contract(userData?.orgContractAddress, OrgContractABI, Jsonprovider);
    //             contract.getApprovedDocuments(userData.walletAddress).then(setIpfsFile).finally(() => setLoading(false));
    //     }
    // }, [userData?.walletAddress]);
    useEffect(() => {
        const fetchApprovedDocuments = async () => {
            if (!userData?.walletAddress || organizations.length === 0) return;
            try {
                const results = await Promise.all(
                    organizations.map(async (org) => {
                        const contract = new ethers.Contract(
                            org.orgContractAddress,
                            OrgContractABI,
                            Jsonprovider
                        );
                        return await contract.getApprovedDocuments(userData.walletAddress);
                    })
                );

                const flattened = results.flat();
                setIpfsFile(flattened);
            } catch (error) {
                console.error("Error fetching approved documents:", error);
            }
        };

        fetchApprovedDocuments();
    }, [userData?.walletAddress, organizations]);



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closePreview();
            }
        };

        if (previewDoc) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [previewDoc]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closePreview();
            }
        };

        if (previewDoc) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [previewDoc]);

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

    useEffect(() => {
        if (isCreateModelOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isCreateModelOpen]);

    const fetchFiles = async (filter: string = "all") => {
        setIsCirculrLoading(true);
        const decryptedDocs: DecryptedFile[] = [];

        try {
            const results = await Promise.all(
                ipfsFile.map(async (cidPath: any) => {
                    const content = await fetchContentFromIpfs(cidPath.cid);
                    return content;
                })
            );

            for (const file of results) {
                const folderCid = file?.folderCid;
                const folderName = file?.name;
                const type = file?.type;
                if (!folderCid) continue;

                try {
                    // 1. Get files inside the folder CID
                    for await (const entry of ipfs.ls(folderCid)) {
                        if (entry.type === 'file') {
                            const fileCid = entry.cid;
                            const fileName = entry.name;

                            const chunks: Uint8Array[] = [];
                            for await (const chunk of ipfs.cat(fileCid)) {
                                chunks.push(chunk);
                            }

                            const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                            const combined = new Uint8Array(totalSize);
                            let offset = 0;
                            for (const chunk of chunks) {
                                combined.set(chunk, offset);
                                offset += chunk.length;
                            }

                            const encryptedText = new TextDecoder().decode(combined);
                            const { blob, mimeType } = decryptFile(encryptedText);

                            if (blob) {
                                decryptedDocs.push({
                                    name: fileName.replace('.enc', ''),
                                    url: URL.createObjectURL(blob),
                                    mimeType,
                                    folderName: folderName,
                                    type: type,
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to decrypt CID ${folderCid}:`, e);
                }
            }
            if (filter === "all") {
                setIpfsContents(decryptedDocs); // Final result
                setIsCirculrLoading(false);
            } else {
                const orgFilter = JSON.parse(filter);
                const filteredContents = decryptedDocs.filter((item: any) => item.type === orgFilter.organization);
                setIpfsContents(filteredContents);
                setIsCirculrLoading(false);
            }
        } catch (err) {
            setIsCirculrLoading(false);
            console.error('Overall IPFS file fetch error:', err);
        }
    };
    useEffect(() => {
        if (ipfsFile?.length > 0) {
            fetchFiles();
        }
    }, [ipfsFile]);

    const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFiles([selectedFile]); // Replace existing file with new one
        }
        event.target.value = '';
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const items = event.dataTransfer.items;
        if (items.length !== 1) {
            ToastMessage("Please drop only one file.", "error", "");
            return;
        }

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
                    ToastMessage("Folders are not allowed. Please drop only a file.", "error", "");
                    resolve();
                }
            });
        };

        const item = items[0].webkitGetAsEntry?.();
        if (item) {
            await traverseFileTree(item);
        }

        if (droppedFiles.length > 0) {
            setFiles(droppedFiles); // replaces old files
        }
    };

    const uploadToContract = async (folderCid: any, type: any) => {
        try {
            if (!signer) {
                setIsCirculrLoading(false);
                ToastMessage(`Signer not available!`, "error", "");
                return;
            }

            const wallet = userData.walletAddress || "";

            if (!wallet) {
                setIsCirculrLoading(false);
                ToastMessage(`Wallet address not found!`, "error", "");
                return;
            }
            const contract = new ethers.Contract(orgContractAddress, OrgContractABI, signer);
            console.log('wallet, folderCid', wallet, folderCid)
            const tx = await contract.uploadDocument(folderCid, type);
            await tx.wait();
            setFiles([])
            setUploadProgress(0);
            setIsCreateModelOpen(false);
            setIsCirculrLoading(false);
            ToastMessage("The Document uploaded Successfully", "successs", tx.hash || "")
            console.log("Transaction Confirmed:", tx.hash);
        } catch (error: any) {
            setFiles([])
            setIsCirculrLoading(false);
            setUploadProgress(0);
            ToastMessage(`${error?.reason}`, "error", "")
            console.error("Transaction Failed:", error);
        }
    };

    const handleUpload = async () => {
        setIsCirculrLoading(true);
        if (files.length === 0) {
            setIsCirculrLoading(false);
            ToastMessage("Please select a file.", "error", "");
            return;
        }

        setUploadProgress(0);
        let progress = 0;
        const encryptedFiles: File[] = [];

        for (const file of files) {
            const encrypted = await encryptFile(file);
            encryptedFiles.push(encrypted);
        }

        let folderCid: string | undefined;
        let lastFile: any = null;
        const totalFiles = encryptedFiles.length;
        let uploadedCount = 0;
        for await (const file of ipfs.addAll(encryptedFiles, { wrapWithDirectory: true })) {
            lastFile = file;
            folderCid = file.cid.toString();

            if (file.path !== "") {
                uploadedCount++;
                progress = Math.min((uploadedCount / totalFiles) * 100, 100);
                setUploadProgress(progress);
            }
        }

        if (lastFile?.path && !lastFile.path.includes("/")) {
            folderCid = lastFile.cid.toString();
        }

        if (progress >= 100 && folderCid) {

            console.log(folderCid, 'folderCid documents only============>');
            const jsonDataToStoreCid = {
                folderCid,
                name: formData.name,
                type: formData.type,
                documentId: formData.documentId,
                status: "pending",
            }
            const encryptedData = await encryptJsonData(jsonDataToStoreCid);

            let foldercid2 = ""
            for await (const file of ipfs.addAll([encryptedData], { wrapWithDirectory: true })) {
                foldercid2 = file.cid.toString();
            }

            console.log(foldercid2, 'this is cid of json data =============>')

            const response = await axios.post(`${config.URL_BACKEND}api/auth/addDocument`, {
                userId: userData?._id,
                cid: foldercid2,
                type: formData.type,
                walletAddress: userData?.walletAddress,
            },
                { headers: { _token: userData?.token } });
            setIsCirculrLoading(false);
            setFormData({
                name: '',
                type: '',
                documentId: '',
                selectHoldData: '',
            })
            await uploadToContract(foldercid2, formData.type);
        }

        setIsCirculrLoading(false);
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.type || !formData.documentId) {
            ToastMessage("Please fill out all fields.", "error", "");
            return;
        }
        handleUpload();
    };

    const openPreview = (doc: DecryptedFile) => {
        setPreviewDoc(doc);
    };

    const closePreview = () => {
        setPreviewDoc(null);
    };

    return (
        <div className="min-h-screen overflow-x-hidden rounded-3xl bg-white mx-4 flex ">
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
            <Sidebar
                title="User"
                navItems={[
                    { label: "Dashboard", icon: <FiHome />, value: "Dashboard" },
                    { label: "Documents", icon: <FiUsers />, value: "Documents" },
                    //   { label: "Reports", icon: <FiBarChart2 />, value: "Reports" },
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <main className="flex-1 p-5 md:p-5 overflow-x-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold ml-10 text-gray-800"> {adminUser ? `${adminUser?.name} Dashboard` : activeTab} </h1>
                    {
                        activeTab == 'Documents' && (
                            !adminUser && (
                                <>
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="relative inline-block ml-2">
                                            <select
                                                onChange={(e) => fetchFiles(e.target.value)}
                                                className="appearance-none border border-gray-600 rounded-md py-2 px-4 pr-10 bg-white text-gray-800"
                                            >
                                                <option value="all">All</option>
                                                {organizations.map((org: any, index) => (
                                                    <option key={index} value={JSON.stringify({
                                                        orgContractAddress: org.orgContractAddress,
                                                        organization: org.organization,
                                                    })}>
                                                        {org.organization}
                                                    </option>
                                                ))}
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

                                        <button
                                            className="bg-gray-700 hover:bg-gray-600 text-white align-center flex items-center gap-2 py-2 px-4 rounded-xl"
                                            onClick={() => setIsCreateModelOpen(true)}
                                        >
                                            + Upload Document
                                        </button>
                                    </div>

                                </>
                            )
                        )
                    }
                </div>

                {activeTab === "Dashboard" &&
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <StatCard label="Approved Document" value={ipfsFile.length} color="green"
                            />
                            <StatCard label="Rejected Document" value={rejectedDocs.length} color="red"
                            />
                            <StatCard label="Pending Document" value={pendingDocs.length} color="yellow"
                            />
                        </div>

                    </>
                }

                {
                    activeTab === "Documents" &&
                    <>
                        {
                            !ipfsContents.length && (
                                <p className="text-center mt-20 text-gray-600">No documents found</p>
                            )
                        }


                        {

                            isCircularLoading ? <div className="flex items-center justify-center mt-40">
                                <CircularLoader size={30} />
                            </div>
                                :
                                <>
                                    {/* <h1 className="text-3xl text-center mt-5 mb-5 font-bold text-gray-800"> Uploaded Documents</h1> */}
                                    <div className="max-w-7xl mx-auto px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-15 mb-8">

                                        {ipfsContents?.map((file: any, index: number) => (
                                            <div
                                                key={index}
                                                onClick={() => openPreview(file)}
                                                className="cursor-pointer w-full max-w-sm mx-auto rounded-xl flex flex-col items-center"
                                            >
                                                {
                                                    file.mimeType === 'application/pdf' ? (
                                                        <img
                                                            src={pdficon}
                                                            alt="PDF"
                                                            className="w-45 h-45 sm:w-44 sm:h-44 xl:w-48 xl:h-48 object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png' || file.mimeType === 'image/jpg') ? (
                                                        <img
                                                            src={file?.url}
                                                            alt="image"
                                                            className="w-45 h-45 sm:w-44 sm:h-44 xl:w-48 xl:h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={fileIcons}
                                                            alt="File Icon"
                                                            className="w-45 h-45 sm:w-44 sm:h-44 xl:w-48 xl:h-48 object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-500"
                                                        />
                                                    )
                                                }
                                                <p className="text-lg font-medium text-gray-700 mt-6 text-center break-words">
                                                    {file?.folderName.toUpperCase()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                        }



                        {previewDoc && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 sm:p-6">
                                <div
                                    ref={modalRef}
                                    className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                                >
                                    {/* Close Button */}
                                    <button
                                        onClick={closePreview}
                                        className="absolute top-3 right-5 text-3xl text-gray-600 hover:text-red-600 transition z-10"
                                        aria-label="Close preview"
                                    >
                                        &times;
                                    </button>

                                    {/* Content Area */}
                                    <div className="p-4 sm:p-6 w-[90%] h-[90%] max-w-[90%] max-h-[90%] self-center overflow-y-auto custom-scrollbar flex-grow">
                                        <div className="flex mt-4 flex-col items-center justify-center space-y-6">
                                            {previewDoc?.mimeType.startsWith('image/') ? (
                                                <img
                                                    src={previewDoc.url}
                                                    alt={previewDoc.name}
                                                    className="w-full max-h-[60vh] object-contain rounded-lg border"
                                                />
                                            ) : previewDoc?.mimeType === 'application/pdf' ? (
                                                <iframe
                                                    src={previewDoc.url}
                                                    title={previewDoc.name}
                                                    className="w-full h-[60vh] border rounded-lg"
                                                />
                                            ) : (
                                                <p className="text-gray-600 text-lg text-center mt-6">
                                                    This file type cannot be previewed.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    <div className="p-4 flex justify-center">
                                        <a
                                            href={previewDoc.url}
                                            download={previewDoc.name}
                                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}


                    </>
                }

                {/* {
                    activeTab === "reports" &&
                    <>
                        <div className="flex-1 min-w-0 bg-white shadow-2xl rounded-2xl overflow-hidden">
                            <h2 className="text-lg font-semibold text-gray-700">Reports</h2>
                            <div className="overflow-x-auto">
                            </div>
                        </div>
                        <h1 className="text-lg text-center font-semibold text-gray-700 px-6 py-4 border-b">comming soon...</h1>
                    </>
                } */}

                {
                    isCreateModelOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div
                                ref={modalRef2}
                                className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-[95%] xl:w-[1100px] max-h-[90vh] overflow-y-auto no-scrollbar"
                            >
                                <h1 className="text-3xl text-center font-semibold text-gray-700 px-6 py-4">Create Document</h1>
                                <form className="w-full mt-3 flex flex-col gap-8">
                                    {/* Input Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                type="text"
                                                placeholder="Enter name"
                                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={formData.selectHoldData}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select document type</option>
                                                {organizations.map((org: any, index) => (
                                                    <option key={index}
                                                        value={JSON.stringify({
                                                            orgContractAddress: org.orgContractAddress,
                                                            organization: org.organization,
                                                        })}
                                                    >
                                                        {org.organization}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="documentId" className="block text-sm font-medium text-gray-700">Document ID</label>
                                            <input
                                                id="documentId"
                                                name="documentId"
                                                value={formData.documentId}
                                                onChange={handleChange}
                                                type="text"
                                                placeholder="Enter Document ID"
                                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload Box */}
                                    <div
                                        className="w-full p-8 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-all flex flex-col items-center justify-center cursor-pointer shadow-lg"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                    >
                                        <FaCloudUploadAlt className="text-indigo-500 text-6xl mb-4" />
                                        <p className="text-gray-600 text-center">Drag & Drop your files here</p>
                                        <p className="text-gray-500 text-sm">or</p>

                                        <label className="mt-4 px-6 py-3 bg-indigo-500 text-white text-lg font-medium rounded-full shadow-md hover:bg-indigo-600 transition cursor-pointer">
                                            Select Files
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,application/pdf,text/*,video/*,audio/*,application/zip,application/x-zip-compressed"
                                                onChange={handleFiles}
                                            />
                                        </label>
                                    </div>

                                    {/* Selected Files */}
                                    {files.length > 0 && (
                                        <div className="bg-gray-200 p-4 rounded-lg shadow-md border">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Selected Files</h3>
                                            <ul className="space-y-2">
                                                {files.map((file, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-gray-700 bg-white px-4 py-2 rounded-md shadow-sm flex justify-between items-center"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            📄 {file.name}
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="text-red-500 hover:text-red-700 text-lg font-bold ml-4"
                                                            aria-label="Remove file"
                                                        >
                                                            &times;
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>

                                        </div>
                                    )}

                                    {/* Upload Progress */}
                                    {uploadProgress > 0 && (
                                        <div>
                                            <div className="w-full bg-gray-300 rounded-full h-4">
                                                <div
                                                    className="bg-indigo-500 h-4 rounded-full transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-center text-gray-600 mt-2">{uploadProgress}% Uploaded</p>
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModelOpen(false)}
                                            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded transition"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-md transition"
                                        >
                                            {isCircularLoading ? <CircularLoader size={20} /> : 'Submit'}
                                        </button>

                                        {/* {files.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleUpload}
                                                className="w-full sm:w-auto bg-indigo-500 text-white py-3 px-6 rounded-md font-semibold shadow-md hover:bg-indigo-600 transition"
                                            >
                                                {isCircularLoading ? <CircularLoader size={20} /> : 'Upload Files'}
                                            </button>
                                        )} */}


                                    </div>
                                </form>
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
    color: "blue" | "green" | "red" | "purple" | "yellow";
    onClick?: () => void;
}> = ({ label, value, color, onClick }) => {
    const baseColor = {
        blue: "text-blue-600 bg-blue-100",
        green: "text-green-600 bg-green-100",
        red: "text-red-600 bg-red-100",
        yellow: "text-yellow-600 bg-yellow-100",
        purple: "text-purple-600 bg-purple-100",
    }[color];

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl shadow-md h-52 w-full px-6 py-4 hover:shadow-lg flex flex-col items-center justify-center transition ${onClick ? "hover:bg-opacity-90" : ""
                } ${baseColor}`}
        >
            <h3 className="text-lg font-semibold">{label}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
};

export default UserDashboard;
