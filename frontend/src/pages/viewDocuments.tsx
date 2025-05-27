import React, { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import CryptoJS from 'crypto-js';
import { useLocation } from 'react-router-dom';

const ipfs = create({ url: 'http://127.0.0.1:5001' });
const ENCRYPTION_KEY = 'your-32-char-secret-key-123456789012'; // Use a strong key in real apps

interface DecryptedFile {
    url: string;
    name: string;
    mimeType: string;
}

export default function ViewDocuments() {
    const location = useLocation();
    const { file } = location?.state || { file: null };
    const [documents, setDocuments] = useState<DecryptedFile[]>([]);
    const [loading, setLoading] = useState(true);

    const decryptFile = (encryptedText: string): { blob: Blob | null, mimeType: string } => {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
            const payload = decrypted.toString(CryptoJS.enc.Utf8);

            if (!payload || !payload.includes('::')) throw new Error('Invalid encrypted format');

            const [mimeType, base64Str] = payload.split('::');

            const byteCharacters = atob(base64Str);
            const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);

            return {
                blob: new Blob([byteArray], { type: mimeType }),
                mimeType,
            };
        } catch (err) {
            console.error('❌ Decryption failed:', err);
            return { blob: null, mimeType: 'text/plain' };
        }
    };

    const fetchFiles = async () => {
        const result: DecryptedFile[] = [];

        try {
            for await (const fileInfo of ipfs.ls(file)) {
                if (fileInfo.type === 'file') {
                    const chunks: Uint8Array[] = [];

                    for await (const chunk of ipfs.cat(fileInfo.cid)) {
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
                        result.push({
                            name: fileInfo.name.replace('.enc', ''),
                            url: URL.createObjectURL(blob),
                            mimeType,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('❌ Failed to fetch files from IPFS:', err);
        }

        setDocuments(result);
        setLoading(false);
    };

    useEffect(() => {
        if (file) {
            fetchFiles();
        }
    }, [file]);

    // const shortenName = (name: string) =>
    //     name.length > 20 ? `${name.slice(0, 10)}...${name.slice(-8)}` : name;

    return (
        <div style={{ padding: '2rem', height: '100vh', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', fontFamily: 'bold' }}>View Documents</h1>
            {/* <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Files</h2> */}

            {loading ? (
                <p>Loading...</p>
            ) : documents.length === 0 ? (
                <p>No files found.</p>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {documents.map((doc, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-300 rounded-xl p-4 bg-gray-100 w-full sm:w-[220px] text-center shadow-md transform transition-transform duration-200 hover:scale-105"
                        >
                            <p className="font-semibold text-gray-700 text-sm mb-2">
                                {/* {shortenName(doc.name)} */}
                            </p>

                            {doc.mimeType.startsWith('image/') ? (
                                <img
                                    src={doc.url}
                                    alt={doc.name}
                                    className="w-full h-[150px] object-contain"
                                />
                            ) : doc.mimeType === 'application/pdf' ? (
                                <iframe
                                    src={doc.url}
                                    title={doc.name}
                                    className="w-full h-[150px] border-none"
                                />
                            ) : (
                                <button
                                    onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Open File
                                </button>
                            )}
                        </div>
                    ))}
                </div>

            )}
        </div>
    );
}
