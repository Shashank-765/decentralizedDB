import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white   p-4">
      <div className=" mx-auto bg-gray-300 shadow-gray-300 rounded-xl lg:p-4  ">
        <div className="grid grid-cols-12 gap-12 items-center">
          {/* Left Section: Logo & Branding (4/12) */}
          <div className="col-span-12 md:col-span-4 flex md:justify-center space-x-4">
            <img src="/decentralizedDb/logo.gif" alt="Decentralized DB Logo" className="h-20 w-80 rounded-lg" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Decentralized DB</h2>
              <p className="text-gray-800 text-sm">Secure | Scalable | Transparent</p>
            </div>
          </div>

          {/* Middle Section: Quick Links (4/12) */}
          <div className="col-span-12 md:col-span-4 flex flex-row space-x-4 md:justify-center">
            <a href="#" className="text-gray-800 hover:text-indigo-400 transition">Privacy Policy</a> &nbsp;
            |
            <a href="#" className="text-gray-800 hover:text-indigo-400 transition">Terms of Service</a>&nbsp;
            |
            <a href="#" className="text-gray-800 hover:text-indigo-400 transition">Support</a>
          </div>

          {/* Right Section: Social Media (2/12) */}
          <div className="col-span-12 md:col-span-4 flex md:justify-center space-x-4">
            <a href="#" className="text-gray-800 hover:text-blue-400 transition">
              <FaTwitter size={24} />
            </a>
            <a href="#" className="text-gray-800 hover:text-blue-500 transition">
              <FaLinkedin size={24} />
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-500 transition">
              <FaGithub size={24} />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 text-center text-gray-800 text-sm border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Decentralized DB. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
