import {
    faArchive,
    faCalendarCheck,
    faChartColumn,
    faClose,
    faFileContract,
    faFileLines,
    faHistory,
    faRightFromBracket,
    faTent,
    faUserPen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useEffect, useRef } from "react";
import SidebarButton from "./SidebarButton";
import { useAuth } from "../context/AuthContext";
import { useSidebarContext } from "../context/SidebarContext";

interface SidebarProps {
    type: string;
    logoPath: string;
    barangay?: string | undefined;
    username?: string | undefined;
}

const Sidebar: React.FC<SidebarProps> = memo(
    ({
        type,
        logoPath,
        barangay,
        username,
    }) => {
        const { logout } = useAuth();
        const sidebarRef = useRef<HTMLDivElement>(null);
        const { user } = useAuth();

        const { isMinimized, isCollapsed, toggleSidebar, collapseSidebar } = useSidebarContext();

        useEffect(() => {
            console.log(isMinimized);
        }, [isMinimized])

        return (
            <nav
                ref={sidebarRef}
                className={`fixed z-50 h-screen transition-all bg-white shadow-2xl text-xs sm:text-sm md:text-base ${
                    isMinimized ? "w-20" : "w-56"
                } ${isCollapsed ? "!w-0 [&>*]:hidden" : "px-2"} overflow-y-scroll no-scrollbar`}
            >
                <div
                    className={`relative flex flex-col items-center justify-between w-full h-full ${
                        isMinimized ? "pt-16 " : ""
                    }`}
                >
                    {!isMinimized && (
                        <div className="flex flex-col items-center w-full pt-10 pb-5 mt-4 sm:gap-2">
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                            <h3 className="text-center text-nowrap">
                                {barangay ? `Barangay ${barangay}` : "Cabuyao Health Office 1"}
                            </h3>
                            <img
                                src={logoPath}
                                alt="Logo"
                                className="object-contain transition-all origin-center scale-75 sm:scale-90"
                                loading="lazy"
                            />
                            <h3 className="text-center">
                                {username ? `Welcome, ${username.toUpperCase()}!` : username}
                            </h3>
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                        </div>
                    )}
                    {/* Barangay */}
                    <div className="flex flex-col items-center w-full h-full gap-5">
                        {type === "barangay" ? (
                            <>
                                <SidebarButton
                                    icon={faFileLines}
                                    labelText="Submit Reports"
                                    isMinimized={isMinimized}
                                    destination="report"
                                />
                                <SidebarButton
                                    icon={faHistory}
                                    labelText="Submittal History"
                                    isMinimized={isMinimized}
                                    destination="history"
                                />
                                <SidebarButton
                                    icon={faArchive}
                                    labelText="Submitted Reports"
                                    isMinimized={isMinimized}
                                    destination="report/submitted"
                                />
                                <SidebarButton
                                    icon={faUserPen}
                                    labelText="Edit Account"
                                    isMinimized={isMinimized}
                                    destination={`${user && user.role === "admin" ? "manage/update" : "edit/account"}`}
                                />
                            </>
                        ) : 
                        (
                            <>
                                <SidebarButton
                                    icon={faChartColumn}
                                    labelText="Dashboard"
                                    isMinimized={isMinimized}
                                    destination=""
                                />
                                <SidebarButton
                                    icon={faFileContract}
                                    labelText="Reports"
                                    isMinimized={isMinimized}
                                    destination="transactions"
                                />
                                <SidebarButton
                                    icon={faTent}
                                    labelText="Barangay"
                                    isMinimized={isMinimized}
                                    destination="barangays"
                                />
                                <SidebarButton
                                    icon={faCalendarCheck}
                                    labelText="Appointments"
                                    isMinimized={isMinimized}
                                    destination="appointments"
                                />
                                <SidebarButton
                                    icon={faUserPen}
                                    labelText="Manage Account"
                                    isMinimized={isMinimized}
                                    destination="manage"
                                />
                            </>
                        )}
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
