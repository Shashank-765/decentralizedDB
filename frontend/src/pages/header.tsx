import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { IoClose, IoMenu } from "react-icons/io5";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from "./toastmessage";
import CircularLoader from "../CircularLoader/CircularLoader";
import { motion, AnimatePresence } from "framer-motion";
import config from "../../config.json"
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import profilelogo from '../assets/user.png'

function Header() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const { login, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUIReady, setIsUIReady] = useState(false);
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [isLogin, setIsLogin] = useState(false)
  const localUser = JSON.parse(localStorage.getItem("user") || 'null');
  const popupRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef2 = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const timer = setTimeout(() => {
      if (open) {
        document.addEventListener('click', handleClickOutside);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef2.current && !popupRef2.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUIReady(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isConnected, userInfo]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setOpen(false);
  };
  const openProfile = () => {
    setOpen(false);
    setIsOpen(false)
    setMenuOpen(false)
    navigate("/profile");

  };

  useEffect(() => {
    if (isConnected && !isLogin && address && userInfo?.email) {
      const loginUser = async () => {
        try {
          const res = await axios.post(`${config.URL_BACKEND}api/auth/login`, {
            walletAddress: address?.toString() || "",
            email: userInfo?.email || '',
            name: userInfo?.name || '',
          });
          const { name: _, ...restUserInfo } = userInfo || {};

          const user = {
            ...res?.data?.user,
            ...restUserInfo
          };
          if (user) {
            login(user);
            setIsLogin(true)
          }
        } catch (error: any) {
          if (error.response.data.error) {
            ToastMessage('This user has been blocked', "error", "");
            setTimeout(() => {
              disconnect();
            }, 1000);
          }
          return error.response.data.error;
        }


      }
      if (!localUser && !isLogin) {
        loginUser();
      }
    }
  }, [isConnected, address, userInfo]);

  const disconnectWallet = async () => {
    await disconnect();
    logout();
    navigate("/")
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


  const handleClick = (type: string) => {
    setOpen(false);
    setMenuOpen(false)
  };

  const setPopupOpen = () => {
    setOpen(!open)
    setIsOpen(false);
  }
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
                    onClick={() => setPopupOpen()}
                  >
                          <Link
                    to="/userDashboard"
                    className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                  >
                    Dashboard
                  </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/adminDashboard"
                    className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                  >
                    Dashboard
                  </Link>
                </li>
              )
            ) : null} {/* Renders nothing if user is null */}


            <li>
              {(user || !isConnected) &&
                (
                  <>

                    {!isConnected && !user ? (
                      <button
                        onClick={() => connect()}
                        className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                      >
                        {!isConnected && !isUIReady ? <CircularLoader size={30} /> : "Connect"}
                      </button>
                    ) : (
                      <div className="relative inline-block text-left -mr-2">
                        <button
                          onClick={toggleDropdown}
                          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
                        >
                          {/* {console.log(user?.profileImage, "profileImage====>>>>")} */}
                          {
                            user?.profileImage ? (
                              <img
                                src={user?.profileImage}
                                alt="profile"
                                loading="lazy"
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              <img
                                src={profilelogo}
                                alt="profile"
                                loading="lazy"
                                className="w-full h-full rounded-full"
                              />
                            )
                          }
                        </button>
                        {isOpen && (
                          <div
                            ref={popupRef2}
                            className="absolute  -right-4 mt-1 w-36 bg-white rounded-lg shadow-lg z-50"
                          >
                            <button
                              onClick={openProfile}
                              className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => disconnectWallet()}
                              className="block w-full text-center px-4 py-2 text-red-600 hover:bg-gray-100"
                            >
                              Logout
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>

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
                  <li
                    className="relative"
                    onClick={() => setPopupOpen()}
                  >
                    <button
                      className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                    >
                      Upload
                    </button>

                    {open && (
                      <ul
                        ref={popupRef}
                        className="absolute top-full ml-32 -mt-16 w-36 bg-white border rounded-xl shadow-lg z-10"
                      >
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-t-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick("documents");
                          }}
                        >
                          Documents
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-b-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick("information");
                          }}
                        >
                          Information
                        </li>
                      </ul>
                    )}
                  </li>

                </>
              ) : (
                <li><Link to="/dashboard" className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Dashboard</Link></li>

              )
            ) : null}

            <li>
              {(user || !isConnected) ?
                (
                  <>

                    {!isConnected && !user ? (
                      <button
                        onClick={() => connect()}
                        className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                      >
                        {!isConnected && !isUIReady ? <CircularLoader size={30} /> : "Connect"}
                      </button>
                    ) : (
                      <div className="relative inline-block text-left">
                        <button
                          onClick={openProfile}
                          className="text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => disconnectWallet()}
                          className="text-red-800 hover:text-red-900 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md mt-4 hover:shadow-lg transition"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button onClick={() => connect()} className=" mobile-nav-link text-gray-700 hover:text-gray-800 text-lg w-32 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"> {isUIReady ? <CircularLoader size={20} /> : "Connect"}</button>
                )}
            </li>

          </motion.ul>
        </nav>
      </header>
      <AnimatePresence>
      </AnimatePresence>
    </>
  );

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
