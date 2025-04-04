import Body from "./body";

export default function Homepage() {
  return (
    <div className="bg-white p-4">
      <div className="bg-gray-200 flex items-center justify-between shadow-xl shadow-gray-300 rounded-xl overflow-hidden">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left Content (8/12) */}
            <div className="pl-6 sm:pl-8 lg:pl-11 col-span-6 md:col-span-8">
              <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
                <span className="block">Redefining Data Storage</span>
                <span className="block text-indigo-600">with Decentralization</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 ">
  Experience a future where your documents are 
  secure, verifiable, and tamper-proof. <br />
  Our decentralized database ensures transparency, 
  efficiency, and trust in data management.
</p>

            </div>

            {/* Right Image (4/12) with Auto Animation */}
            <div className="pl-6 sm:pl-8 lg:pl-11 col-span-6 md:col-span-4">
              <img
                src="/decentralizedDb/homepage.png"
                alt="Decentralized DB"
                className="w-full rounded-lg object-contain animate-move-image"
              />
            </div>
          </div>
        </div>
      </div>
      <Body />
    </div>
  );
}
