import React, { useEffect, useState } from 'react';
import { create } from 'ipfs-http-client';
import CryptoJS from 'crypto-js';
import { useLocation } from 'react-router-dom';

const ipfs = create({ url: 'http://127.0.0.1:5001' });
const ENCRYPTION_KEY = 'your-32-char-secret-key-123456789012';

interface DecryptedFile {
    url: string;
    name: string;
}

export default function ViewDocuments() {
    const location = useLocation();
    const { file } = location?.state || { file: null };
    const [documents, setDocuments] = useState<DecryptedFile[]>([]);
    const [loading, setLoading] = useState(true);

    const decryptFile = (encryptedBase64: string, mimeType: string): Blob => {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedBase64, ENCRYPTION_KEY);
            const base64Str = decrypted.toString(CryptoJS.enc.Utf8);
            if (!base64Str) throw new Error('Invalid decrypted string');

            const binaryStr = atob(base64Str);
            const byteArray = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                byteArray[i] = binaryStr.charCodeAt(i);
            }

            return new Blob([byteArray], { type: mimeType });
        } catch (err) {
            console.error('Decryption failed:', err);
            return new Blob(['[Failed to decrypt]'], { type: 'text/plain' });
        }
    };



    const fetchFiles = async () => {
        const allDecryptedFiles: DecryptedFile[] = [];
        try {
            for await (const fileInfo of ipfs.ls(file)) {
                if (fileInfo.type === 'file') {
                    const chunks: Uint8Array[] = [];
                    for await (const chunk of ipfs.cat(fileInfo.cid)) {
                        chunks.push(chunk);
                    }

                    const combined = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
                    let offset = 0;
                    for (const chunk of chunks) {
                        combined.set(chunk, offset);
                        offset += chunk.length;
                    }

                    const encryptedBase64 = new TextDecoder().decode(combined);
                    // Infer mimeType from file extension or default to 'application/octet-stream'
                    let mimeType = 'application/octet-stream';
                    if (fileInfo.name.endsWith('.pdf')) mimeType = 'application/pdf';
                    else if (fileInfo.name.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
                    else if (fileInfo.name.match(/\.(png)$/i)) mimeType = 'image/png';
                    else if (fileInfo.name.match(/\.(gif)$/i)) mimeType = 'image/gif';

                    const decryptedBlob = decryptFile(encryptedBase64, mimeType);
                    const url = URL.createObjectURL(decryptedBlob);

                    allDecryptedFiles.push({
                        name: fileInfo.name.replace('.enc', ''),
                        url,
                    });
                }
            }
        } catch (err) {
            console.error('❌ IPFS fetch failed:', err);
        }

        setDocuments(allDecryptedFiles);
        setLoading(false);
    };

    useEffect(() => {
        if (file) {
            fetchFiles();
        }
    }, [file]);

    const shortenName = (name: string) =>
        name.length > 20 ? `${name.slice(0, 8)}...${name.slice(-8)}` : name;

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📂 Files</h2>
            {loading ? (
                <p>Loading...</p>
            ) : documents.length === 0 ? (
                <p>No files found.</p>
            ) : (
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {documents.map((doc, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                padding: '1rem',
                                backgroundColor: '#f9f9f9',
                                width: '200px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <p style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>
                                📄<br></br> Dawnload
                                {/* {shortenName(doc.name)} */}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
