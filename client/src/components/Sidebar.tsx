import {
    faClockRotateLeft,
    faClose,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useRef } from "react";
import SidebarButton from "./SidebarButton";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
    type: string;
    logoPath: string;
    barangay?: string;
    isCollapsed: boolean;
    isMinimized: boolean;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(
    ({
        type,
        logoPath,
        barangay,
        toggleSidebar,
        collapseSidebar,
        isMinimized,
        isCollapsed,
    }) => {
        const { logout } = useAuth();
        const sidebarRef = useRef<HTMLDivElement>(null);

        return (
            <nav
                ref={sidebarRef}
                className={`fixed z-50 h-screen transition-all bg-white shadow-2xl ${
                    isMinimized ? "w-20" : "w-56"
                } ${isCollapsed ? "!w-0 [&>*]:hidden" : "px-2"} overflow-y-scroll no-scrollbar`}
            >
                <div
                    className={`relative flex flex-col items-center justify-between w-full h-full ${
                        isMinimized ? "pt-16 " : ""
                    }`}
                >
                    {!isMinimized && (
                        <div className="flex flex-col items-center w-full gap-2 pt-10 pb-5 mt-4">
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                            <img
                                src={logoPath}
                                alt="Logo"
                                className="origin-center scale-95"
                            />
                            <h3 className="text-center text-nowrap">
                                Barangay {barangay}
                            </h3>
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                        </div>
                    )}
                    {/* Barangay */}
                    <div className="flex flex-col items-center w-full h-full gap-5">
                        {type === "barangay" ? (
                            <>
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Reports"
                                    isMinimized={isMinimized}
                                    destination="report"
                                />
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Submittal History"
                                    isMinimized={isMinimized}
                                    destination="history"
                                />
                                <div className="flex items-end justify-center flex-1 w-full py-8 justify-self-end">
                                    <SidebarButton
                                        icon={faRightFromBracket}
                                        labelText="Log out"
                                        additionalStyle="py-2 text-white uppercase bg-red-700"
                                        isMinimized={isMinimized}
                                        destination=""
                                        logout={logout}
                                    />
                                </div>
                            </>
                        ) : 
                        (
                            <>
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Dashboard"
                                    isMinimized={isMinimized}
                                    destination=""
                                />
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Transaction"
                                    isMinimized={isMinimized}
                                    destination="transactions"
                                />
                                <SidebarButton
                                    icon={faRightFromBracket}
                                    labelText="Barangay"
                                    isMinimized={isMinimized}
                                    destination="barangays"
                                />
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Appointments"
                                    isMinimized={isMinimized}
                                    destination="appointments"
                                />
                                <SidebarButton
                                    icon={faClockRotateLeft}
                                    labelText="Manage Account"
                                    isMinimized={isMinimized}
                                    destination="manage"
                                />
                                <div className="flex items-end justify-center flex-1 w-full py-8 justify-self-end">
                                    <SidebarButton
                                        icon={faRightFromBracket}
                                        labelText="Log out"
                                        additionalStyle="py-2 text-white uppercase bg-red-700"
                                        isMinimized={isMinimized}
                                        destination=""
                                        logout={logout}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div
                        className={`absolute top-0 ${
                            !isMinimized ? "right-0 " : ""
                        }mt-3 hidden lg:block`}
                    >
                        <label className="relative inline-block w-10 h-6 cursor-pointer">
                            <input
                                type="checkbox"
                                className="hidden peer focus:ring-0 focus:border-0"
                                onChange={toggleSidebar}
                            />
                            <span
                                className={`absolute inset-0 transition ${
                                    isMinimized ? "bg-gray-300" : "bg-blue-500"
                                } rounded-full`}
                            ></span>
                            <span
                                className={`absolute w-4 h-4 transition transform ${
                                    isMinimized
                                        ? "translate-x-0"
                                        : "translate-x-4"
                                } bg-white rounded-full left-1 bottom-1 `}
                            ></span>
                        </label>
                    </div>
                    <FontAwesomeIcon
                        icon={faClose}
                        className="absolute top-0 right-0 mt-3 cursor-pointer lg:hidden size-6"
                        onClick={collapseSidebar}
                    />
                </div>
            </nav>
        );
    }
);

export default Sidebar;
