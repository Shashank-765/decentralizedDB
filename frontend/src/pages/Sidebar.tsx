import React from "react";
import { FiX } from "react-icons/fi";

type NavItem = {
    label: string;
    icon: React.ReactElement;
    value: string;
};

type SidebarProps = {
    title: string;
    navItems: NavItem[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
    title,
    navItems,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
}) => {
    const handleTabClick = (value: string) => {
        setActiveTab(value);
        setSidebarOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-[2] w-[256px] h-screen shadow-2xl p-6 bg-gray-300 rounded-r-2xl text-black transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}
            >
                {/* Mobile Header */}
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <h2 className="text-xl font-extrabold">{title}</h2>
                    <button onClick={() => setSidebarOpen(false)}>
                        <FiX className="text-2xl" />
                    </button>
                </div>

                {/* Desktop Title */}
                <h2 className="text-2xl text-center font-extrabold mb-8 hidden md:block">{title}</h2>

                <nav className="flex flex-col gap-2 font-medium">
                    {navItems.map((item) => (
                        <button
                            key={item.value}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition
              ${activeTab === item.value
                                    ? "bg-gray-700 text-white"
                                    : "text-black hover:bg-gray-700 hover:text-white"}`}
                            onClick={() => handleTabClick(item.value)}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
