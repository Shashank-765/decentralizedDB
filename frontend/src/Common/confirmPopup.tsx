// ConfirmModal.tsx
import React, { useEffect, useRef } from 'react';

type ConfirmModalProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message?: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) return null;

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen])

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onCancel();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300">
        <div
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl md:max-w-2xl p-8 animate-fadeIn scale-100 transition-transform duration-300"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">{message}</h2>
      
          <p className="text-gray-600 text-md text-center mb-8">
            {/* {message} */}
            Make sure you want to confirm this action
            <br className="hidden sm:block" />
            {/* Please confirm that you’ve reviewed the file and it meets all necessary requirements. */}
          </p>
      
          <div className="flex justify-center space-x-6">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition duration-200"
            >
              Confirm 
            </button>
          </div>
        </div>
      </div>
      

    );
};

export default ConfirmModal;
