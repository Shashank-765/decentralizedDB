import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from 'qrcode.react';



export const QrcodeModel = ({ walletAddress, onClose }: { walletAddress: string | undefined; onClose: () => void }) => {
    const popupRef1 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef1.current && !popupRef1.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef1, onClose]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={popupRef1} className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Wallet QR Code</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex justify-center mb-4">
                    <QRCodeCanvas value={walletAddress || ""} size={350} />
                </div>

                <p className="text-gray-700 text-sm break-all">{walletAddress || ""}</p>
            </div>
        </div>
    );
};

export const WithdrawModal = ({ onClose }: { onClose: () => void }) => {

    const popupRef2 = useRef<HTMLDivElement>(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [etherAmount, setEtherAmount] = useState("");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef2.current && !popupRef2.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef2, onClose]);

    const handleTransfer = () => {
        if (walletAddress && etherAmount) {
            console.log(walletAddress, etherAmount)
        } else {
            alert("Please enter both wallet address and ether amount.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={popupRef2} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Withdraw Modal</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wallet Address
                        </label>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="0x123...abc"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ether Amount
                        </label>
                        <input
                            type="number"
                            value={etherAmount}
                            onChange={(e) => setEtherAmount(e.target.value)}
                            placeholder="0.1"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleTransfer}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition"
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </div>
    )
}