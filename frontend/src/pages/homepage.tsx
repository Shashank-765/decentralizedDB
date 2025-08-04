
export default function Homepage() {
  return (
    <div className="bg-white p-4">
      <div className="bg-gray-200 flex items-center justify-between shadow-xl shadow-gray-300 rounded-xl overflow-hidden">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left Content (8/12) */}
            <div className="pl-6 sm:pl-8 lg:pl-11 col-span-6 md:col-span-8 break-words">
              <h1 className="text-8xl mt-20 font-extrabold text-gray-900 sm:text-8xl md:text-8xl">
                <span className="block">Redefining Data Storage</span>
                <span className="block text-indigo-600">with Decentralization</span>
              </h1>
              <p className="mt-4 mb-16 text-xl text-gray-600 ">
                Experience a future where your documents are
                secure, verifiable, and tamper-proof. <br />
                Our decentralized database ensures transparency,
                efficiency, and trust in data management.
              </p>

            </div>
            {/* Right Image (4/12) with Auto Animation */}
            <div className="pl-6 sm:pl-8 lg:pl-11 col-span-6 md:col-span-4 right">
              <img
                src="/decentralizedDb/homepage.png"
                alt="Decentralized DB"
                className="w-full rounded-lg object-contain animate-move-image"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white pt-4">
        {/* Roadmap Section */}
        <div className="bg-white flex items-center justify-between ">
          <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-8 bodycenteredcontent">
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12 p-8">
              Roadmap: Uploading Files in a Decentralized Way
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center p-6 bg-gray-200 shadow-xl shadow-gray-300 rounded-xl">
                <div className="mb-4">
                  <img src="/decentralizedDb/upload-icon.gif" alt="Upload Icon" className="h-17 w-17" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Step 1: Upload Document</h3>
                <p className="mt-2 text-gray-600 text-center">
                  The user uploads a document using the platform's interface.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center p-6 bg-gray-200 shadow-xl shadow-gray-300 rounded-xl">
                <div className="mb-4">
                  <img src="/decentralizedDb/ipfs-icon.gif" alt="IPFS Icon" className="h-17 w-17" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Step 2: Store on IPFS</h3>
                <p className="mt-2 text-gray-600 text-center">
                  The file is uploaded to IPFS, a decentralized storage network.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center p-6 bg-gray-200 shadow-xl shadow-gray-300 rounded-xl">
                <div className="mb-4">
                  <img src="/decentralizedDb/hyperledger-icon.gif" alt="Hyperledger Icon" className="h-17 w-17" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Step 3: Store Hash on Hyperledger</h3>
                <p className="mt-2 text-gray-600 text-center">
                  The document's IPFS hash is stored on Hyperledger Besu for secure and transparent verification.
                </p>
              </div>
            </div>

            {/* Second Row of Cards */}
            <div className="flex justify-center gap-12 mt-8 pb-6 bodycontainer2">
              {/* Step 4 */}
              <div className="flex flex-col items-center p-6 bg-gray-200 shadow-xl shadow-gray-300 rounded-xl w-full md:w-1/3">
                <div className="mb-4">
                  <img src="/decentralizedDb/smart-contract-icon.gif" alt="Smart Contract Icon" className="h-17 w-17" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Step 4: Verify with Smart Contract</h3>
                <p className="mt-2 text-gray-600 text-center">
                  A smart contract verifies the integrity of the document using the stored hash.
                </p>
              </div>
              {/* Step 5 */}
              <div className="flex flex-col items-center p-6 bg-gray-200 shadow-xl shadow-gray-300 rounded-xl w-full md:w-1/3">
                <div className="mb-4">
                  <img src="/decentralizedDb/access-icon.gif" alt="Access Icon" className="h-17 w-17" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Step 5: Access Verified Document</h3>
                <p className="mt-2 text-gray-600 text-center">
                  The user can access the verified document securely through the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
