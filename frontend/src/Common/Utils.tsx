import CryptoJS from 'crypto-js';
const ENCRYPTION_KEY = import.meta.env.VITE_IPFS_ENCRYPTION_KEY;
import config from "../../config.json";
import { ethers } from "ethers";



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