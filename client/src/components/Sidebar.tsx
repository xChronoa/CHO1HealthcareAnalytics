import {
    faClockRotateLeft,
    faClose,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useRef } from "react";
import { SideBarButton } from "./SidebarButton";

interface SidebarProps {
    logoPath: string;
    barangay: string;
    isCollapsed: boolean;
    isMinimized: boolean;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(
    ({
        logoPath,
        barangay,
        toggleSidebar,
        collapseSidebar,
        isMinimized,
        isCollapsed,
    }) => {
        const sidebarRef = useRef<HTMLDivElement>(null);

        return (
            <nav
                ref={sidebarRef}
                className={`absolute z-40 h-full transition-all bg-white shadow-2xl ${
                    isMinimized ? "w-20" : "w-56"
                } ${isCollapsed ? "px-2" : "w-0 [&>*]:hidden"}`}
            >
                <div
                    className={`relative flex flex-col items-center justify-between w-full h-full ${
                        isMinimized ? "pt-16" : ""
                    } pb-20`}
                >
                    {!isMinimized && (
                        <div className="flex flex-col items-center w-full gap-5 py-10 mt-12">
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                            <img
                                src={logoPath}
                                alt="Logo"
                                className="size-40"
                            />
                            <h3 className="text-center text-nowrap">
                                Barangay {barangay}
                            </h3>
                            <div className="w-11/12 h-[2px] bg-black rounded"></div>
                        </div>
                    )}
                    <div className="flex flex-col items-center w-full h-full gap-5">
                        <SideBarButton
                            icon={faClockRotateLeft}
                            labelText="Submittal History"
                            isMinimized={isMinimized}
                        />
                        <SideBarButton
                            icon={faRightFromBracket}
                            labelText="Log out"
                            additionalStyle="py-2 text-white uppercase bg-red-700"
                            isMinimized={isMinimized}
                        />
                    </div>
                    <div
                        className={`absolute top-0 ${
                            !isMinimized ? "right-0" : ""
                        } mt-3 hidden lg:block`}
                    >
                        <label className="relative inline-block w-10 h-6 cursor-pointer">
                            <input
                                type="checkbox"
                                className="hidden peer focus:ring-0 focus:border-0"
                                onChange={toggleSidebar}
                            />
                            <span className={`absolute inset-0 transition ${isMinimized ? "bg-gray-300" : "bg-blue-500" } rounded-full`}></span>
                            <span className={`absolute w-4 h-4 transition transform ${isMinimized ? "translate-x-0" : "translate-x-4"} bg-white rounded-full left-1 bottom-1 `}></span>
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

export { Sidebar };
