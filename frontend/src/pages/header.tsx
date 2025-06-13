import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { IoClose, IoMenu } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from "./toastmessage";
import CircularLoader from "../CircularLoader/CircularLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import config from "../../config.json"
import { use } from "chai";



function Header() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp" | "forgotpassword" | "">("");
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const { login, logout, user } = useAuth();
  const [isCircularLoading, setIsCirculrLoading] = useState(false)
  //  const location = useLocation();
  // const Sociallogin = useGoogleLogin({
  //   onSuccess: tokenResponse => console.log(tokenResponse),
  // });
  const Sociallogin = async () => {
    window.location.href = await `${config.URL_BACKEND}api/auth/google`;
  };

  const handlesignuppopup = () => {
    setIsPopupOpen(true);
    setActiveTab("signUp")
  }
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${config.URL_BACKEND}api/auth/user`, {
          withCredentials: true
        });
        const logedinuser = {
          userId: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          walletAddress: res.data.user.walletAddress,
          userType: res.data.user.userType,
          token: res.data.user.token,
        };
        login(logedinuser);
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };
    if (searchParams.get("authSuccess") === "true") {
      fetchUser();
    }
  }, []);

  const handleBackgroundClick = () => {
    setIsPopupOpen(false);
    setActiveTab("");
  };
  const popuphandler = () => {
    setIsPopupOpen(false)
    setActiveTab("");
  }
  useEffect(() => {
    if (isPopupOpen || activeTab === "signUp" || activeTab === "signIn" || activeTab === "forgotpassword") {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeTab, isPopupOpen]);

  const handleClick = (type: string) => {
    setOpen(false);
    navigate(`/upload/${type}`);
  };
  return (
    <>

      <header className="bg-white p-4">
        <nav className="bg-gray-300 flex items-center justify-between shadow-lg rounded-xl px-6 py-3 relative">
          {/* Logo */}
          <div className="flex items-center w-[300px] h-[78px]">
            <img
              src="/decentralizedDb/logo.gif"
              alt="Logo"
              onClick={() => (window.location.href = "/")}
              className="cursor-pointer w-full h-full"
            />
          </div>

          {/* Desktop Menu */}
          <ul className={`hidden md:flex space-x-6`}>
            <li><Link to="/home" className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Home</Link></li>

            {user ? (
              user.userType === "User" ? (
                <>
                 <li
                    className="relative"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                  >
                    <button
                      className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                    >
                      Upload
                    </button>

                    {open && (
                      <ul className="absolute top-full ml-0 mt-0 w-36 bg-white border rounded-xl shadow-lg z-10">
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-xl"
                          onClick={() => handleClick("documents")}
                        >
                          Documents
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-xl"
                          onClick={() => handleClick("information")}
                        >
                          Information
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                    >
                      Profile
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                  >
                    Dashboard
                  </Link>
                </li>
              )
            ) : null} {/* Renders nothing if user is null */}


            <li>
              {user ? (
                <Link
                  to="/"
                  onClick={logout}
                  className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                >
                  Logout
                </Link>
              ) : (
                <button onClick={handlesignuppopup} className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"> {isCircularLoading ? <CircularLoader size={20} /> : "Sign Up"}</button>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 text-3xl"
          >
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>


          {/* Mobile Menu */}
          <motion.ul
            className={`absolute top-full left-0 w-full bg-gray-200 md:hidden flex flex-col items-center z-[1]
             space-y-4 py-4 shadow-lg ${menuOpen ? "block" : "hidden"}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >

            <li onClick={() => { setMenuOpen(!menuOpen) }}><Link to="/home" className="mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Home</Link></li>
            {user ? (
              user.userType === "User" ? (
                <>
                  <li onClick={() => { setMenuOpen(!menuOpen) }}><Link to="/upload" className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Upload</Link></li>
                  <li onClick={() => { setMenuOpen(!menuOpen) }}><Link to="/profile" className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Profile</Link></li>

                </>
              ) : (
                <li><Link to="/dashboard" className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Dashboard</Link></li>

              )
            ) : null}




            <li>
              {user ? (
                <button onClick={logout} className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Logout</button>
              ) : (
                <button onClick={() => setIsPopupOpen(true)} className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"> {isCircularLoading ? <CircularLoader size={20} /> : "Sign Up"}</button>
              )}
            </li>

          </motion.ul>
        </nav>
      </header>
      <AnimatePresence>

        {isPopupOpen && (
          < motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm backdrop-blur-lg z-[1]"
            // initial={{ y: 50, opacity: 0 }}
            // animate={{ y: 0, opacity: 1 }}
            // exit={{ rotateY: 90, opacity: 1 }} // Flip on close  
            // transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth transition
            onClick={handleBackgroundClick}>
            <motion.div className="bg-gray-300 p-6 rounded-xl shadow-xl max-w-md w-full relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }} // Flip on close
              transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth transition
              onClick={(e) => e.stopPropagation()}>
              <button onClick={popuphandler} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">
                <IoClose className="text-2xl" />
              </button>
              <div className="flex justify-center mb-4">
                {
                  activeTab === "forgotpassword" ? <h2> Enter Email</h2> : <>
                    <button onClick={() => setActiveTab("signIn")} className={`text-lg px-6 py-2 rounded-lg transition duration-300 cursor-pointer ${activeTab === "signIn" ? "bg-white font-bold border-b-2 border-indigo-300" : "text-gray-600"}`}>Sign In</button>
                    <button onClick={() => setActiveTab("signUp")} className={`text-lg px-6 py-2 rounded-lg transition duration-300 cursor-pointer ${activeTab === "signUp" ? "bg-white font-bold border-b-2 border-indigo-300" : "text-gray-600"}`}>Sign Up</button></>
                }
              </div>
              {activeTab === "signUp" ? <SignUpForm /> : activeTab === "forgotpassword" ? <ForgotpasswordForm setActiveTab={setActiveTab} /> : <SignInForm />}
              {/* Social Logins */}
              <div className="mt-4 text-center">
                <p className="text-gray-500 text-sm">Or continue with</p>
                <div className="flex justify-center gap-4 mt-2">
                  <motion.button className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-md hover:bg-gray-200 transition"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }} // Flip on close
                    onClick={Sociallogin}
                    transition={{ duration: 0.6, ease: "easeInOut" }} // Smooth transition
                  >
                    <FcGoogle className="text-2xl" /> Google
                  </motion.button>
                  <motion.button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }} // Flip on close
                    transition={{ duration: 0.6, ease: "easeInOut" }} // Smooth transition
                  >
                    <FaFacebook className="text-2xl" /> Facebook
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function SignUpForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async (e: any) => {
      setIsCirculrLoading(true)
      e.preventDefault();
      try {
        let userType = "User"
        const response = await axios.post(`${config.URL_BACKEND}api/auth/register`, {
          name,
          email,
          password,
          userType
        });

        console.log("Signup Success:", response.data);
        login(response.data.user);
        setIsPopupOpen(false);
        setIsCirculrLoading(false)
        ToastMessage(`${response.data.user.name}-${response.data.message}`, "success", "");
      } catch (error: any) {
        setIsCirculrLoading(false)
        if (axios.isAxiosError(error)) {
          // Handle errors returned from the backend
          if (error.response) {
            console.error("Backend Error:", error.response.data.error);

            ToastMessage(`${error.response.data.error}`, "warning", "");
            // alert(error.response.data.error || "Signup failed. Please try again.");
          } else if (error.request) {
            // No response from server
            console.error("No response received:", error.request);

            ToastMessage("No response from the server. Please check your internet connection.", "error", "");
          } else {
            // Other errors (e.g., client-side issues)
            console.error("Error setting up request:", error.message);

            ToastMessage("Something went wrong. Please try again.", "error", "");
          }
        } else {
          console.error("Unexpected Error:", error);

          ToastMessage("An unexpected error occurred. Please try again.", "error", "");
        }
      }

    };

    return (
      <motion.form onSubmit={handleSignUp} className="mt-4 space-y-4"
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ opacity: 0 }} // Flip on close
        transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth transition
      >
        <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded-lg">Sign Up</button>
      </motion.form>
    );
  }

  function ForgotpasswordForm({ setActiveTab }: { setActiveTab: React.Dispatch<React.SetStateAction<"" | "signIn" | "signUp" | "forgotpassword">> }) {
    const [emailtoforgot, setEmailtoforgot] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCircularLoading, setIsCircularLoading] = useState(false);

    const { user } = useAuth();

    const handleBlur = (field: string) => {
      const newErrors = { ...errors };

      if (field === "newPassword" && newPassword.trim().length < 4) {
        newErrors.newPassword = "New password must be at least 4 characters.";
      } else {
        delete newErrors.newPassword;
      }

      if (field === "confirmPassword" && confirmPassword.trim().length < 4) {
        newErrors.confirmPassword = "Confirm password must be at least 4 characters.";
      } else {
        delete newErrors.confirmPassword;
      }

      setErrors(newErrors);
    };

    const cancelOtpHandler = () => {
      setShowOTPModal(false);
      setOtp("");
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsCircularLoading(true);

      try {
        const res = await axios.post(`${config.URL_BACKEND}api/auth/otpverifiucation`, {
          email: emailtoforgot,
        });

        if (res.data) {
          setShowOTPModal(true);
          ToastMessage("OTP sent successfully", "success", "");
        } else {
          ToastMessage("Invalid Email", "error", "");
        }
      } catch (error: any) {
        ToastMessage(
          axios.isAxiosError(error) ? error.response?.data?.error : "Something went wrong",
          "error",
          ""
        );
      } finally {
        setIsCircularLoading(false);
      }
    };

    const handleVerifyOTP = async () => {
      if (otp.length !== 6) {
        ToastMessage("Invalid OTP length. OTP should be 6 digits.", "error", "");
        return;
      }

      setIsCircularLoading(true);
      try {
        const res = await axios.post(`${config.URL_BACKEND}api/auth/verifiedotp`, {
          email: emailtoforgot,
          otp,
        });

        if (res.data) {
          setIsVerified(true);
          ToastMessage("OTP verified successfully", "success", "");
        }
      } catch {
        setIsVerified(false);
        ToastMessage("Enter correct OTP", "error", "");
      } finally {
        setIsCircularLoading(false);
      }
    };

    const handleReset = async () => {
      const newErrors: { [key: string]: string } = {};

      if (newPassword.trim().length < 4) {
        newErrors.newPassword = "Password must be at least 4 characters.";
      }

      if (confirmPassword.trim().length < 4) {
        newErrors.confirmPassword = "Password must be at least 4 characters.";
      }

      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) return;

      setIsCircularLoading(true);
      try {
        const res = await axios.post(
          `${config.URL_BACKEND}api/auth/updatePassword`,
          {
            email: emailtoforgot,
            newPassword,
          },
          {
            headers: {
              _token: user?.token,
            },
          }
        );

        if (res.data) {
          setIsVerified(false);
          setNewPassword("");
          setConfirmPassword("");
          setActiveTab("signIn");
          ToastMessage("Password changed successfully!", "success", "");
        }
      } catch (err: any) {
        ToastMessage(err.response?.data?.error || "Failed to update password.", "error", "");
      } finally {
        setIsCircularLoading(false);
      }
    };

    return (
      <>
        <motion.form
          className="mt-4 space-y-4"
          onSubmit={handleForgotPassword}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={emailtoforgot}
            onChange={(e) => setEmailtoforgot(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded-lg">
            {isCircularLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </motion.form>

        {showOTPModal && (
          <div className="otp-modal-overlay">
            <div className="otp-modal">
              <h3 className="otp-heading">Enter OTP</h3>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
              <div className="otp-actions">
                <button className="submit-otp" onClick={handleVerifyOTP}>
                  Submit
                </button>
                <button className="cancel-otp" onClick={cancelOtpHandler}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="otp-modal-overlay">
            <div className="otp-modal">
              <h2 className="newpasswordclsdd">New Password</h2>
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
              {errors.newPassword && (
                <p className="error">{errors.newPassword}</p>
              )}
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
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}

              <button className="resetbuttonpass" onClick={handleReset}>
                {isCircularLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSignIn = async (e: any) => {
      setIsCirculrLoading(true)
      e.preventDefault();
      try {
        const response = await axios.post(`${config.URL_BACKEND}api/auth/login`, {
          email,
          password,
        }
        );

        let logedinuser = {
          userId: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          walletAddress: response.data.user.walletAddress,
          userType: response.data.user.userType,
          token: response?.data?.user?.token
        };
        console.log(logedinuser);
        login(logedinuser);
        setIsPopupOpen(false);
        setActiveTab("");
        setIsCirculrLoading(false)
        ToastMessage(`${response.data.user.name}-${response.data.message}`, "success", "");
      } catch (error: any) {
        setIsCirculrLoading(false)
        if (axios.isAxiosError(error)) {
          // Handle errors returned from the backend
          if (error.response) {
            console.error("Backend Error:", error.response.data.error);
            ToastMessage(`${error.response.data.error}`, "warning", "");

            // alert(error.response.data.error || "Signup failed. Please try again.");
          } else if (error.request) {
            // No response from server
            console.error("No response received:", error.request);

            ToastMessage("No response from the server. Please check your internet connection.", "error", "");
          } else {
            // Other errors (e.g., client-side issues)
            console.error("Error setting up request:", error.message);

            ToastMessage("Something went wrong. Please try again.", "error", "");

          }
        } else {
          console.error("Unexpected Error:", error);
          ToastMessage("An unexpected error occurred. Please try again.", "error", "");
        }
      }
    };

    return (
      <motion.form onSubmit={handleSignIn} className="mt-4 space-y-4"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ opacity: 0 }} // Flip on close
        transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth transition
      >
        <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p className="forgottpasswordinsignin" onClick={() => setActiveTab("forgotpassword")}>Forgot Password ?</p>
        <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded-lg"> {isCircularLoading ? <CircularLoader size={20} /> : "Sign In"}</button>
      </motion.form>
    );
  }

  function useAuth() {
    const [user, setUser] = useState<any>();

    useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = (userData: any) => {
      console.log(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    };

    // const logout = () => {
    //   localStorage.removeItem("user");
    //   setUser(null);
    //   ToastMessage("Logged out successfully", "success","");


    // };
    const logout = async () => {
      try {
        // 1. Call backend to clear session cookies
        await axios.get(`${config.URL_BACKEND}api/auth/logout`, {
          withCredentials: true, // makes sure cookies are sent
        });
        // 2. Clear frontend data
        localStorage.removeItem("user");
        setUser(null);
        window.location.reload();
        ToastMessage("Logged out successfully", "success", "");
      } catch (error) {
        console.error("Logout failed", error);
        ToastMessage("Logout failed", "error", "");
      }
    };



    return { user, login, logout };
  }
}

export default Header;
