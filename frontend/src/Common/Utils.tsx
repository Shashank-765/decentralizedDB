import CryptoJS from 'crypto-js';
const ENCRYPTION_KEY = import.meta.env.VITE_IPFS_ENCRYPTION_KEY;
import config from "../../config.json";
import { ethers } from "ethers";
import { useState, useRef, useEffect } from "react";



export const decryptFile = (encryptedText: string): { blob: Blob | null, mimeType: string } => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        const payload = decrypted.toString(CryptoJS.enc.Utf8);

        if (!payload || !payload.includes('::')) throw new Error('Invalid encrypted format');

        const [mimeType, base64Str] = payload.split('::');
        const byteCharacters = atob(base64Str);
        const byteArray = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));

        return {
            blob: new Blob([byteArray], { type: mimeType }),
            mimeType,
        };
    } catch (err) {
        console.error('Decryption failed:', err);
        return { blob: null, mimeType: 'text/plain' };
    }
};

export const encryptFile = async (file: File): Promise<File> => {
    const arrayBuffer = await file.arrayBuffer();
    const binary = new Uint8Array(arrayBuffer);

    let binaryStr = '';
    for (let i = 0; i < binary.length; i++) {
        binaryStr += String.fromCharCode(binary[i]);
    }
    const base64 = btoa(binaryStr);

    const payload = `${file.type}::${base64}`;

    const encrypted = CryptoJS.AES.encrypt(payload, ENCRYPTION_KEY).toString();
    const blob = new Blob([encrypted], { type: 'text/plain' });

    return new File([blob], file.name + '.enc', { type: 'text/plain' });
};

export const fetchContentFromIpfs = async (cid: string, filename = "JSONdata.json") => {
    const gateways = [
        `http://127.0.0.1:8080/ipfs/${cid}/${filename}`
    ];

    for (const url of gateways) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const encryptedText = await res.text();
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8)
            return JSON.parse(decryptedText);
        } catch {
            console.log('catch')
        }
    }
    return null;
};

export const encryptJsonData = async (jsonData: any) => {
    const jsonString = JSON.stringify(jsonData);
    const encryptedBase64 = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    const encryptedBlob = new Blob([encryptedBase64], { type: "text/plain" });
    return {
        path: 'JSONdata.json',
        content: encryptedBlob,
    };
};

export const ensureMinBalance = async (address: string) => {
    try {
        // 1. Connect to Hardhat local node
        const localProvider = new ethers.providers.JsonRpcProvider(config.URL_RPC);

        // 2. Use a predefined Hardhat private key (must have ETH!)
        const funderPrivateKey = config.adminPrivateKey; // Replace this securely
        const funderSigner = new ethers.Wallet(funderPrivateKey, localProvider);

        // 3. Check recipient balance
        const recipientBalance = await localProvider.getBalance(address);
        const recipientEth = parseFloat(ethers.utils.formatEther(recipientBalance));
        // console.log("Recipient balance:", recipientEth, "ETH");

        // 4. Send 0.1 ETH if balance is too low
        if (recipientEth < 0.01) {
            const tx = await funderSigner.sendTransaction({
                to: address,
                value: ethers.utils.parseEther("0.1"),
            });

            await tx.wait();
            console.log(`✅ Sent 0.1 ETH to ${address}. Tx Hash: ${tx.hash}`);
        } else {
            // console.log("✅ Balance is sufficient, no need to fund.");
        }
    } catch (err) {
        console.error("💥 Error in ensureMinBalance:", err);
    }
};

export const DateFilterPopup = ({ onApply }: { onApply: (start: string, end: string) => void }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const modalRefseletData = useRef<HTMLDivElement>(null);

    const handleApply = () => {
        onApply(startDate, endDate);
        setShowPopup(false);
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRefseletData.current && !modalRefseletData.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
        };
        if (showPopup) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showPopup]);

    const selectDateHandler = () => {
        setShowPopup(true);
    };

    return (
        <div>
            {/* Trigger Button */}
            <button
                onClick={selectDateHandler}
                className="bg-gray-600 hover:bg-gray-700 mb-2 text-white px-4 py-2 rounded"
            >
                Select Date Range
            </button>

            {/* Modal Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div ref={modalRefseletData} className="bg-white rounded-lg p-6 w-80 shadow-lg animate-fadeIn scale-100 transition-transform duration-300">
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