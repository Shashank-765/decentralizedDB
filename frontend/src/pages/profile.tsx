import { useState, useEffect, useRef } from "react";
import config from "../../config.json";
import axios from "axios";
import editimage from "../assets/edit.png";

export default function UserProfile() {
  const [user, setUser] = useState<{ name: string; email: string; walletAddress: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    mobile: "",
    bloodGroup: "",
    gender: "Male",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [editOpen]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setEditOpen(false);
      }
    };

    if (editOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.name.trim().length < 3) newErrors.name = "Full name must be at least 3 characters.";
    if (formData.userType.trim().length < 4) newErrors.userType = "User type must be at least 4 characters.";
    if (!formData.mobile || formData.mobile.length < 10) newErrors.mobile = "Mobile must be at least 10 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    if (name === "name" && value.trim().length < 3) newErrors.name = "Full name must be at least 3 characters.";
    if (name === "userType" && value.trim().length < 4) newErrors.userType = "User type must be at least 4 characters.";
    if (name === "mobile" && value.trim().length < 10) newErrors.mobile = "Mobile must be at least 10 digits.";
    if (name === "bloodGroup" && !value) newErrors.bloodGroup = "Select blood group.";
    setErrors(newErrors);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const userdata = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      await axios.post(
        `${config.URL_BACKEND}api/auth/updateUser`,
        formData,
        { headers: { _token: userdata?.token } }
      );
      alert("Profile updated successfully.");
      setEditOpen(false);
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        name: parsedUser.name,
        email: parsedUser.email,
        walletAddress: parsedUser.walletAddress,
      });

      axios.get(`${config.URL_BACKEND}api/auth/getUserProfileData?email=${parsedUser.email}`).then((res) => {
        const data = res.data.data;
        setFormData({
          name: data.name,
          email: data.email,
          userType: data.userType,
          mobile: data.mobile,
          bloodGroup: data.bloodGroup,
          gender: data.gender,
        });
      });
    }
  }, []);


  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center p-10">
      <div className="w-full flex justify-end mb-5">
        <button className="cursor-pointer hover:opacity-80" onClick={() => setEditOpen(true)}>
          <img src={editimage} alt="Edit" className="w-5 h-5" />
        </button>
      </div>


      {user && (
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-7xl mb-8">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white font-bold">{user?.name?.slice(0, 3)}</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm shadow-md walletaddressed text-center">
            Wallet: {user?.walletAddress}
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div ref={popupRef} className="bg-white p-6 rounded-xl w-full max-w-xl shadow-xl relative animate-fadeIn scale-100 transition-transform duration-300">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onBlur={handleBlur} onChange={handleChange} className="w-full p-2 border rounded" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded bg-gray-100" disabled />
              <input type="text" name="userType" placeholder="User Type" value={formData.userType} onChange={handleChange} className="w-full p-2 border rounded bg-gray-100" disabled />
              {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}

              <input type="number" name="mobile" placeholder="Mobile Number" value={formData.mobile} onBlur={handleBlur} onChange={handleChange} className="w-full p-2 border rounded" />
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}

              <select name="bloodGroup" value={formData.bloodGroup} onBlur={handleBlur} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <div className="flex gap-4">
                <label><input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} /> Male</label>
                <label><input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} /> Female</label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                <button type="submit" className="px-4 py-2  bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
