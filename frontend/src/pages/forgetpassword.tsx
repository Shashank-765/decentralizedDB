import React, { useState } from "react";
import axios from "axios";
import ToastMessage from "./toastmessage";
import config from "../../config.json"

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  // const [newPassword, setNewPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // show/hide toggles
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  // const [showNewPassword, setShowNewPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userString = localStorage.getItem("user");
  let userdata = userString ? JSON.parse(userString) : null;  
  const handleVerify = async () => {
    try {
      const res = await axios.post(`${config.URL_BACKEND}api/auth/verifyUserPassword`, {
        email,
        password: oldPassword,
      });

      if (res.data) {
        setIsVerified(true);
        ToastMessage("password verified Successfully","successs",  "")
      } else {
      ToastMessage("password is incorrect","successs",  "")
      }
    } catch (err: any) {
      setIsVerified(false);
      console.log(err)
      ToastMessage(err.response?.data?.error || "Failed to verify password.","error",  "")
    }
  };
//  const handleBlur = (field: string) => {
//     const newErrors = { ...errors };

//     if (field === "newPassword" && newPassword.trim().length < 4) {
//       newErrors.newPassword = "New password must be at least 4 characters.";
//     } else {
//       delete newErrors.newPassword;
//     }

//     if (field === "confirmPassword" && confirmPassword.trim().length < 4) {
//       newErrors.confirmPassword = "Confirm password must be at least 4 characters.";
//     } else {
//       delete newErrors.confirmPassword;
//     }

//     setErrors(newErrors);
//   };

const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");

  const forgotemailhandler = () => {
   try {
   console.log("Sending OTP to email:", userdata?.email);
    const res = axios.post(`${config.URL_BACKEND}api/auth/otpverifiucation`, {
      email:userdata?.email,
    });

    console.log("OTP sent successfully:", res);
   } catch (error) {
    console.error("Error sending OTP:", error);
    
   }

    setShowOTPModal(true);
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) setOtp(value);
  };

  const handleSubmitOTP = () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    console.log("Verifying OTP:", otp);
    try {
      const res = axios.post(`${config.URL_BACKEND}api/auth/verifiedotp`, {
        email: userdata?.email,
        otp,
      });
    
      console.log("OTP verified successfully:", res);
    //   ToastMessage("OTP verified successfully", "successs", "");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      ToastMessage("Failed to verify OTP", "error", "");
    }
    setShowOTPModal(false);
  };
//  const handleReset = async () => {
//     const newErrors: { [key: string]: string } = {};

//     if (newPassword.trim().length < 4) {
//       newErrors.newPassword = "password must be at least 4 characters.";
//     }

//     if (confirmPassword.trim().length < 4) {
//       newErrors.confirmPassword = "password must be at least 4 characters.";
//     }

//     if (newPassword !== confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match.";
//     }

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) return;

//     try {
//       const res = await axios.post(`${config.URL_BACKEND}api/auth/updatePassword`, {
//         email,
//         newPassword,
//       });

//       if (res.data) {
//         setIsVerified(false);
//         setNewPassword("");
//         setConfirmPassword("");
//         ToastMessage("Password updated successfully!", "successs", "");
//       }
//     } catch (err: any) {
//       ToastMessage(err.response?.data?.error || "Failed to update password.", "error", "");
//     }
//   };

  return (
    <div className="forgot-password-container">
      <div className="forgotpasscard">
        <h2 className="forgotpassheading">Forgot Password</h2>
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            className="inputtexts"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isVerified}
          />
        </div>

        {!isVerified && (
          <>
            <div className="form-group">
              <input
                type={showOldPassword ? "text" : "password"}
                className="inputtexts"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="toggle-password"
              >
                {showOldPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button className="verifybutton" onClick={handleVerify}>
              Change Password
            </button>
          </>
        )}

        {/* {isVerified && (
          <>
            <div >
             <div className="form-group">
             
                <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="inputtexts"
                onBlur={() => handleBlur("newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="toggle-password"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
             </div>
              {errors.newPassword && <p className="error">{errors.newPassword}</p>}
            </div>
            <div>
             <div className="form-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="inputtexts"
                onBlur={() => handleBlur("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
             </div>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>
            <button className="resetbuttonpass" onClick={handleReset}>Reset Password</button>
          </>
        )} */}
      <p  className='forgotpassbutton'onClick={forgotemailhandler}>Forget password ?</p>
      {showOTPModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h3 className="otp-heading">Enter OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={handleOTPChange}
              className="otp-input"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
            />
            <div className="otp-actions">
              <button className="submit-otp" onClick={handleSubmitOTP}>
                Submit
              </button>
              <button className="cancel-otp" onClick={() => setShowOTPModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ForgotPassword;
