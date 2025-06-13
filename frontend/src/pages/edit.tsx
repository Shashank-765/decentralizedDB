import React, { useEffect, useState } from "react";
import './footer.css'; 
import axios from "axios";
import ToastMessage from "./toastmessage";
import config from "../../config.json"

interface FormData {
  name: string;
  email: string;
  userType: string;
  mobile: string;
  bloodGroup: string;
  gender: "Male" | "Female";
}

export default function Edit() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    userType: "",
    mobile:'',
    bloodGroup: "",
    gender: "Male",
  });
  
const userString = localStorage.getItem("user");
let userdata = userString ? JSON.parse(userString) : null;  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.name.trim().length < 3) {
      newErrors.name = "Full name must be at least 3 words.";
    }
     if (formData.userType.trim().length < 4) {
      newErrors.userType = "userType must contain at least four character";
    }
    if(!formData.mobile){
    
    }
      else {
      if (formData.mobile && formData.mobile.length <10)
      newErrors.mobile = "mobile must contain at least 10 digit";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
 useEffect(() => {
  const response = async () => {      
    try {
      const res = await axios.get(`${config.URL_BACKEND}api/auth/getuserdata?email=${userdata?.email}`);
      setFormData({
      name: res?.data?.data?.name,
      email: res?.data?.data?.email,
      userType: res?.data?.data?.userType,
      mobile: res?.data?.data?.mobile,
      bloodGroup: res?.data?.data?.bloodGroup,
      gender: res?.data?.data?.gender
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  response();
 },[])

const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  const newErrors = { ...errors };

  switch (name) {
    case "name":
      newErrors.name = value.trim().length < 3 ? "Full name must be at least 3 characters." : "";
      break;
    case "password":
      newErrors.password = value.trim().length < 4 ? "Password must contain at least four characters." : "";
      break;
    case "userType":
      newErrors.userType = value.trim().length < 4 ? "User Type must contain at least four characters." : "";
      break;
    case "mobile":
      newErrors.mobile = value.trim().length < 10 ? "Mobile must contain at least 10 digits." : "";
      break;
    case "bloodGroup":
      newErrors.bloodGroup = !value ? "Select blood group." : "";
      break;
  }

  setErrors(newErrors);
};
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
     if (!validateForm()) return;

      axios.post('http://localhost:4000/api/auth/updateUser', formData,
      {
      headers: {
        _token: userdata?.token,
      },
     }
      )
      .then((response) => {
        console.log(response.data);
         ToastMessage("Document updated Successfully","successs",  "")
      })
      .catch((error:any) => { 
      ToastMessage(`${error}`,"error",  "")
        console.error("There was an error!", error);
      }
      );
  };

  return (

  <div className="edit-containrer-container">
    <div className="edit-container">
      <h2 className="edit-heading">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={true} 
        />
        <input
          type="text"
          name="userType"
          placeholder="User Type"
          onBlur={handleBlur}
          value={formData.userType}
          onChange={handleChange}
          disabled={true}
        />
          {errors.userType && <span className="error">{errors.userType}</span>}

        <input
          type="number"
          name="mobile"
          placeholder="Mobile Number"
          onBlur={handleBlur}
          value={formData.mobile}
          onChange={handleChange}
        />
        {errors.mobile && <span className="error">{errors.mobile}</span>}
        <select name="bloodGroup" onBlur={handleBlur} value={formData.bloodGroup} onChange={handleChange}>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
        <div className="gender-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={handleChange}
            />
            Male
          </label>

          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={handleChange}
            />
            Female
          </label>
        </div>

        <button type="submit" onClick={handleSubmit}>Save Changes</button>
      </form>
      <div> 
      </div>
    </div>
  
  </div>

  );
}
