import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import copyImage from '../assets/copy.png'
import ToastMessage from "./toastmessage";
import logo1 from '../assets/images.jpg'



export const QrcodeModel = ({ walletAddress, onClose, logo }: { walletAddress: string | undefined; onClose: () => void; logo: string }) => {
    const popupRef1 = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = 300;
    const circleRadius = 55; // Increased circle radius
    const logoSize = circleRadius * 2;

    useEffect(() => {
        if (!walletAddress || !canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        QRCode.toCanvas(
            canvas,
            walletAddress,
            {
                errorCorrectionLevel: "H",
                width: canvasSize,
                margin: 1,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            },
            (err) => {
                if (err) console.error(err);
                else {
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        const centerX = canvasSize / 2;
                        const centerY = canvasSize / 2;

                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, circleRadius + 6, 0, 2 * Math.PI);
                        ctx.fill();

                        // Draw logo inside a circular clip
                        const logoImg = new Image();
                        logoImg.src = logo;
                        logoImg.onerror = () => { logoImg.src = logo1 }
                        logoImg.crossOrigin = 'Anonymous';
                        logoImg.referrerPolicy = 'no-referrer';
                        logoImg.loading = 'lazy';
                        logoImg.onload = () => {
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
                            ctx.clip();
                            ctx.drawImage(
                                logoImg,
                                centerX - circleRadius,
                                centerY - circleRadius,
                                logoSize,
                                logoSize
                            );
                            ctx.restore();
                        };
                    }
                }
            }
        );
    }, [walletAddress]);

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

    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress || "");
        ToastMessage("Copied to clipboard", "success", "");
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={popupRef1} className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-lg animate-fadeIn scale-100 transition-transform duration-300">
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
                    <canvas ref={canvasRef} />
                </div>

                <p className="text-gray-700 flex justify-center mt-6 mb-2 text-sm break-all">
                    <img src={copyImage} onClick={copyAddress} alt="copy" className="w-5 h-5 mr-2 cursor-pointer" />
                    {walletAddress || ""}
                </p>
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
            <div ref={popupRef2} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-fadeIn scale-100 transition-transform duration-300">
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
                    <p className="text-sm font-medium text-gray-700">Gas Fee: 0.0001 ETH</p>
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