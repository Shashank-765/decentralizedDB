import { useEffect, useState, useRef } from 'react';
import { create } from 'ipfs-http-client';
import CryptoJS from 'crypto-js';
import pdficon from '../assets/pdficon.png'
import fileIcons from '../assets/fileIcons.png'
import { useLocation } from 'react-router-dom';

const ipfs = create({ url: 'http://127.0.0.1:5001' });
const ENCRYPTION_KEY = 'your-32-char-secret-key-123456789012';

interface DecryptedFile {
    url: string;
    name: string;
    mimeType: string;
}

export default function ViewDocuments() {
    const location = useLocation();
    const modalRef = useRef<HTMLDivElement>(null);
    const { file } = location?.state || { file: null };
    const [documents, setDocuments] = useState<DecryptedFile[]>([]);
    const [loading, setLoading] = useState(true);

    const [previewDoc, setPreviewDoc] = useState<DecryptedFile | null>(null);

    const openPreview = (doc: DecryptedFile) => {
        setPreviewDoc(doc);
    };

    const closePreview = () => {
        setPreviewDoc(null);
    };

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


    return (
        <div style={{ padding: '2rem', height: '100vh', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>View Documents</h1>

            {loading ? (
                <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading...</p>
            ) : documents.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>No files found.</p>
            ) : (
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (doc.mimeType.startsWith('image/') || doc.mimeType === 'application/pdf') {
                        openPreview(doc);
                      }
                    }}
                    className="
                      cursor-pointer border border-gray-300 rounded-xl p-4 bg-gray-100 
                      text-center shadow-md 
                      transform transition-transform duration-200 hover:scale-105
                    "
                  >
                    {doc.mimeType.startsWith('image/') ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-[150px] object-contain"
                      />
                    ) : doc.mimeType === 'application/pdf' ? (
                      <>
                        <img
                          src={pdficon}
                          alt="PDF"
                          className="w-full h-[150px] object-contain"
                        />
                        <p className="mt-4 text-sm text-gray-700 font-medium truncate">{doc.name}</p>
                      </>
                    ) : (
                      <>
                        <img
                          src={fileIcons}
                          alt="File Icon"
                          className="w-full h-[150px] object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Open File
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
            )}

            {previewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-lg p-8 w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative"
                    >
                        <button
                            onClick={closePreview}
                            className="absolute top-2 right-2 text-xl sm:text-2xl md:text-3xl font-bold text-red-600 hover:text-red-700 z-10"
                        >
                            &times;
                        </button>


                        <div className="overflow-auto">
                            {previewDoc?.mimeType.startsWith('image/') ? (
                                <img
                                    src={previewDoc.url}
                                    alt={previewDoc.name}
                                    className="w-full max-h-[60vh] object-contain"
                                />
                            ) : previewDoc?.mimeType === 'application/pdf' ? (
                                <iframe
                                    src={previewDoc.url}
                                    title={previewDoc.name}
                                    className="w-full h-[60vh] border"  
                                />

                            ) : (
                                <p className="text-gray-700 text-center mt-6">
                                    This file type cannot be previewed.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <a
                                href={previewDoc.url}
                                download={previewDoc.name}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
}
