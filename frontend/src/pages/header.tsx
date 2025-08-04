import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { IoClose, IoMenu } from "react-icons/io5";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import ToastMessage from "./toastmessage";
import CircularLoader from "../Common/CircularLoader";
import walletImage from '../assets/wallet.png'
import copyImage from '../assets/copy.png'
import config from "../../config.json"
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import profilelogo from '../assets/user.png'
import { WithdrawModal, QrcodeModel } from "./Modals";
import { ethers } from "ethers";


function Header() {
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const [isOpen, setIsOpen] = useState(false);
  const [isUIReady, setIsUIReady] = useState(false);
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [isLogin, setIsLogin] = useState(false)
  const user = JSON.parse(localStorage.getItem("user") || 'null');
  const popupRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef2 = useRef<HTMLDivElement>(null);
  const popupRef3 = useRef<HTMLDivElement>(null);
  const popupRef4 = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState('');
  const [isValidImage, setIsValidImage] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [balanceOpen2, setBalanceOpen2] = useState(false);
  const [isOpenModalPopup, setIsOpenModalPopup] = useState(false);
  const [isOpenModalQrPopup, setIsOpenModalQrPopup] = useState(false);
  const [walletBalance, setWalletBalance] = useState('');

  useEffect(() => {
    async function getPrivateKey() {
      try {
        const ethersProvider = new ethers.providers.JsonRpcProvider(config.URL_RPC);
        let signer;
        if (user?.privateKey) {
          signer = new ethers.Wallet(user?.privateKey, ethersProvider);
        }
        if (signer) {
          const balance = await signer.getBalance();
          setWalletBalance(ethers.utils.formatEther(balance));
        }
      }
      catch (error) {
        console.log(error, "<--------------------------------error");
      }
    }
    getPrivateKey();
  }, [])

  useEffect(() => {
    if (user?.profileImage) {
      resolveProfileImage(user.profileImage);
    }
  }, [user?.profileImage]);

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
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef4.current && !popupRef4.current.contains(event.target as Node)) {
        setBalanceOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [balanceOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef3.current && !popupRef3.current.contains(event.target as Node)) {
        setBalanceOpen2(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [balanceOpen2]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUIReady(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isConnected, userInfo]);

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
    if (isConnected && !isLogin && address && userInfo?.email) {
      const loginUser = async () => {
        try {
          const res = await axios.post(`${config.URL_BACKEND}api/auth/login`, {
            // walletAddress: address?.toString() || "",
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
      if (!user && !isLogin) {
        loginUser();
      }
    }
  }, [isConnected, address, userInfo]);


  const resolveProfileImage = async (url: string) => {
    const isGoogleImage = url.includes('googleusercontent.com');

    if (!isGoogleImage) {
      const valid = await verifyImage(url);
      setProfile(valid ? url : '');
      setIsValidImage(valid);
      return;
    }

    const sizeVariants = ['=s512-c', '=s400-c', '=s300-c', ''];
    const base = url.split('=')[0];

    for (const variant of sizeVariants) {
      const testUrl = base + variant;
      const valid = await verifyImage(testUrl);
      if (valid) {
        setProfile(testUrl);
        setIsValidImage(true);
        return;
      }
    }

    setIsValidImage(false);
  };

  const verifyImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) return resolve(false);

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.crossOrigin = 'Anonymous';
      img.referrerPolicy = 'no-referrer';

      const cacheBuster = `cb=${Date.now()}`;
      img.src = url + (url.includes('?') ? '&' : '?') + cacheBuster;
    });
  };

  const login = (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    ToastMessage("Login successfully", "success", "");
  }

  const logout = () => {
    localStorage.removeItem("user");
    ToastMessage("Logout successfully", "success", "");
  }

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

  const disconnectWallet = async () => {
    await disconnect();
    setIsLogin(false);
    logout();
    setIsOpen(false);
    navigate("/")
  }

  const setPopupOpen = () => {
    setOpen(!open)
    setIsOpen(false);
  }

  const copyAddress = (address: string | undefined) => {
    navigator.clipboard.writeText(address?.toString() || "");
    ToastMessage("Address copied to clipboard", "success", "");
  }

  const QrPopupHandler = () => {
    setIsOpenModalQrPopup(true);
    setBalanceOpen(false);
  }

  const withdrawPopupHandler = () => {
    setIsOpenModalPopup(true);
    setBalanceOpen(false);
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

          <ul className={`hidden lg:flex space-x-6`}>
            <li><Link to="/home" className="text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Home</Link></li>

            {user ? (
              <>
                <li
                  className="relative"
                  onClick={() => setPopupOpen()}
                >
                  <Link
                    to={`${user?.userType === "SuperAdmin" ? "/superadmin" : user?.userType === "Admin" ? "/adminDashboard" : user?.userType === "User" ? "/userDashboard" : "/not-found"}`}
                    className="text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="relative">
                  <div
                    className="text-gray-700 font-semibold hover:text-gray-800 text-lg pl-4 pr-4 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap min-w-0"
                    onClick={() => setBalanceOpen(!balanceOpen)}
                  >
                    <img src={walletImage} className="w-5 h-5 flex-shrink-0" alt="wallet" />
                    <p className="ml-2 max-w-[110px]">{Number(walletBalance).toFixed(2)} ETH</p>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {balanceOpen && (
                    <div
                      ref={popupRef4}
                      className="absolute top-full left-0 mt-1 ml-2 w-36 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                      <button
                        onClick={withdrawPopupHandler}
                        className="block w-full text-center px-4 font-semibold py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Transfer
                      </button>
                      <button
                        onClick={QrPopupHandler}
                        className="block w-full text-center px-4 font-semibold py-2 text-gray-600 hover:bg-gray-100"
                      >
                        Recieve
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : null
            }
            <li>
              {(user || !isConnected) &&
                (
                  <>

                    {!isConnected && !user ? (
                      <button
                        onClick={() => connect()}
                        className="text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                      >
                        {!isConnected && !isUIReady ? <CircularLoader size={30} /> : "Connect"}
                      </button>
                    ) : (
                      <>
                        <div className="flex items-space-around justify-between w-56">
                          <li className="text-gray-700 text-lg w-40 h-11 font-semibold flex items-center justify-center  rounded-lg transition">
                            <img src={copyImage} className="w-5 h-5 cursor-pointer" onClick={() => copyAddress(address)} alt="" />
                            <p className="ml-2 text-center font-bold">{address ? address?.slice(0, 4) + "..." + address?.slice(-4) : "wallet address"}</p>
                          </li>
                          <div className="relative inline-block text-left -mr-2">
                            <button
                              onClick={toggleDropdown}
                              className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
                            >
                              <img
                                src={isValidImage ? profile : profilelogo}
                                alt="User profile"
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = profilelogo;
                                  setIsValidImage(false);
                                }}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            </button>
                          </div>
                          {isOpen && (
                            <div
                              ref={popupRef2}
                              className="absolute  -right-0 mt-12 w-36 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                            >
                              <button
                                onClick={openProfile}
                                className="block w-full text-center px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100"
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => disconnectWallet()}
                                className="block w-full text-center px-4 py-2 text-red-600 font-semibold hover:bg-gray-100"
                              >
                                Logout
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>

                )}
            </li>
          </ul>

          {/* Mobile View Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-gray-700 text-3xl"
          >
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>
          <ul
            className={`absolute top-full font-semibold left-0 w-full bg-gray-200 lg:hidden flex flex-col items-center z-[60]
             space-y-4 py-4 shadow-lg ${menuOpen ? "block" : "hidden"}`}
          >
            <div>
              <li onClick={() => { setMenuOpen(!menuOpen) }}><Link to="/home" className="mobile-nav-link text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition">Home</Link></li>
              {user ? (
                <>
                  <li className="mt-4">
                    <Link
                      to={`${user?.userType === "SuperAdmin" ? "/superadmin" : user?.userType === "Admin" ? "/adminDashboard" : user?.userType === "User" ? "/userDashboard" : "/not-found"}`}
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="mobile-nav-link text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="mt-4 relative">
                    <div
                      className="text-gray-700 font-semibold hover:text-gray-800 text-lg pl-6 pr-6 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition cursor-pointer"
                      onClick={() => setBalanceOpen2(!balanceOpen2)}
                    >
                      <img src={walletImage} className="w-5 h-5" alt="" />
                      <p className="ml-2  max-w-[110px]">{Number(walletBalance).toFixed(2)} ETH</p>
                      <svg
                        className="w-4 h-4 ml-1 text-gray-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {balanceOpen2 && (
                      <div
                        ref={popupRef3}
                        className="absolute top-full left-0 mt-1 ml-2 w-36 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                      >
                        <button
                          onClick={withdrawPopupHandler}
                          className="block w-full text-center px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={QrPopupHandler}
                          className="block w-full text-center px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          Recieve
                        </button>
                      </div>
                    )}
                  </li>
                </>
              ) : null}
              <li>
                {(user || !isConnected) ?
                  (
                    <>

                      {!isConnected && !user ? (
                        <button
                          onClick={() => connect()}
                          className="text-gray-700 hover:text-gray-800 mt-4 font-semibold text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                        >
                          {!isConnected && !isUIReady ? <CircularLoader size={30} /> : "Connect"}
                        </button>
                      ) : (
                        <div className="relative inline-block text-left">
                          <button
                            onClick={openProfile}
                            className="text-gray-700 hover:text-gray-800 mt-4 font-semibold text-lg w-28 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => disconnectWallet()}
                            className="text-red-800 hover:text-red-900 font-semibold text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md mt-4 hover:shadow-lg transition"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button onClick={() => connect()} className=" mobile-nav-link text-gray-700 font-semibold hover:text-gray-800 text-lg w-32 h-11 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition"> {isUIReady ? <CircularLoader size={20} /> : "Connect"}</button>
                  )}
              </li>
            </div>

          </ul>
        </nav>
      </header>

      {isOpenModalPopup && (
        <>
          <WithdrawModal
            onClose={() => setIsOpenModalPopup(false)}

          />
        </>
      )}

      {isOpenModalQrPopup && (
        <>
          <QrcodeModel
            onClose={() => setIsOpenModalQrPopup(false)}
            walletAddress={address}
            logo={isValidImage ? profile : profilelogo}
          />
        </>
      )}

    </>
  );
}
export default Header;
