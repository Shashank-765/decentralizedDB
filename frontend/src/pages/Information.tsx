import React, { useState } from "react";
import ToastMessage from "./toastmessage";
import { create } from "ipfs-http-client";
import config from '../../config.json';
import axios from "axios";

interface Field {
  key: string;
  value: string;
}

const CustomForm: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([{ key: "", value: "" }]);
  const [errors, setErrors] = useState<{ [index: number]: boolean }>({});
  const ipfs = create({
    url: config.URL_IPFS,
  });
  const handleFieldChange = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index] = { key, value };
    setFields(newFields);
    setErrors((prev) => ({ ...prev, [index]: false }));
  };

  const handleAddField = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);

    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    let hasErrors = false;
    const newErrors: { [index: number]: boolean } = {};
  
    fields.forEach((f, i) => {
      if (f.key.trim() === "" || f.value.trim() === "") {
        newErrors[i] = true;
        hasErrors = true;
        
      }
    });
  
    setErrors(newErrors);
  
    const validFields = fields.filter(
      (f) => f.key.trim() !== "" && f.value.trim() !== ""
    );
  
    if (validFields.length === 0 || hasErrors) {
      ToastMessage("Please fill all fields before submitting.", "error", "");
      return;
    }
    try {
      const dataJson = JSON.stringify(validFields, null, 2);
      const dataBlob = new Blob([dataJson], { type: "application/json" });
      const fileToUpload = {
        path: "InformationForm.json",
        content: dataBlob,
      };
  
      let folderCid = "";  
      for await (const file of ipfs.addAll([fileToUpload], { wrapWithDirectory: true })) {
        folderCid = file.cid.toString();
      } 
      const response = await axios.post(`${config.URL_BACKEND}api/auth/saveCID`, {
        userId: JSON.parse(localStorage.getItem("user") || "{}").userId,
        cid: folderCid,
      });
      console.log(response.data);
      console.log("Submitted Fields uploaded to IPFS:", folderCid); 
      ToastMessage("Information Form submitted and uploaded to IPFS!", "success", "");  
      setFields([{ key: "", value: "" }]);
      setErrors({});
    } catch (error) {
      console.error("IPFS Upload Error:", error);
      ToastMessage("Failed to upload form data to IPFS.", "error", "");
    }
  };
  


  // const handleSubmit = () => {
  //   let hasErrors = false;
  //   const newErrors: { [index: number]: boolean } = {};

  //   fields.forEach((f, i) => {
  //     if (f.key.trim() === "" || f.value.trim() === "") {
  //       newErrors[i] = true;
  //       hasErrors = true;
  //       ToastMessage("Please fill the field.", "error", "")
  //       return;
  //     }
  //   });

  //   setErrors(newErrors);

  //   const validFields = fields.filter(
  //     (f) => f.key.trim() !== "" && f.value.trim() !== ""
  //   );

  //   if (validFields.length === 0) {
  //     // ToastMessage("Please fill the field.", "error", "")
  //     return;
  //   }

  //   if (hasErrors) return;

  //   console.log("Submitted Fields:", validFields);
  //   setFields([{ key: "", value: "" }]);
  //   setErrors({});
  //   ToastMessage("Information Form submitted successfully!", "success", "")
  // };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
    <div className="w-[700px] max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 md:p-16">
      <h2 className="text-4xl font-bold text-center text-gray-600 mb-12">
        Submit Your Information
      </h2>
  
      <div className="space-y-8">
        {fields.map((field, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 items-start"
          >
            <div>
              {/* <label className="block text-sm text-gray-600 mb-1">Field Name</label> */}
              <input
                type="text"
                placeholder="Enter Field Name"
                value={field.key}
                onChange={(e) =>
                  handleFieldChange(index, e.target.value, field.value)
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors[index] && field.key.trim() === ""
                    ? "border-red-400"
                    : "border-gray-300"
                } bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm`}
              />
            </div>
  
            <div>
              {/* <label className="block text-sm text-gray-600 mb-1">Field Value</label> */}
              <input
                type="text"
                placeholder="Enter Field Value"
                value={field.value}
                onChange={(e) =>
                  handleFieldChange(index, field.key, e.target.value)
                }
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors[index] && field.value.trim() === ""
                    ? "border-red-400"
                    : "border-gray-300"
                } bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm`}
              />
            </div>
  
            {fields.length > 1 && (
              <button
                onClick={() => handleRemoveField(index)}
                className="mt-1 text-red-500 hover:text-red-700 text-2xl font-bold transition"
                title="Remove"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
  
      <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        <button
          onClick={handleAddField}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow transition"
        >
          + Add New Field
        </button>
  
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition"
        >
          Submit Form
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default CustomForm;
