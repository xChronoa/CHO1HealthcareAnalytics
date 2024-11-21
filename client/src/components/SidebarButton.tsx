import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, MouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarButtonProps {
    icon: IconProp;
    labelText: string;
    additionalStyle?: string;
    isMinimized: boolean;
    destination: string;
    logout?: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = memo(
    ({
        icon,
        labelText,
        additionalStyle = "",
        isMinimized,
        destination,
        logout,
    }) => {
        const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
            if (logout) {
                e.preventDefault(); // Prevent navigation when logging out
                logout();
            }
        };

        // Get the current location
        const location = useLocation();

        const isActiveRoute =
            ([
                "/admin/manage/create",
                "/admin/manage/accounts",
                "/admin/manage/update",
            ].some((path) => location.pathname.startsWith(path)) &&
                labelText === "Manage Account") ||
            (location.pathname.startsWith("/admin/barangays") &&
                labelText === "Barangay");

        return (
            <NavLink
                to={destination}
                end
                className={({ isActive }) =>
                    `${additionalStyle} relative overflow-hidden flex ${
                        isMinimized ? "justify-center" : "justify-self-end"
                    } ${
                        isActive ? "bg-green text-white scale-95" : ""
                    } items-center w-11/12 gap-5 p-3 rounded-md shadow-gray-500 shadow-md cursor-pointer hover:scale-95 transition-transform ${
                        isActiveRoute ? "bg-green text-white scale-95" : ""
                    }`
                }
                onClick={handleClick}
            >
                <FontAwesomeIcon icon={icon} className="justify-self-start" />
                <h3
                    className={`flex-1 text-nowrap text-justify transition-transform text-xs sm:text-sm md:text-base ${
                        isMinimized
                            ? "absolute -translate-x-full opacity-0"
                            : "translate-x-0 opacity-100"
                    }`}
                >
                    {labelText}
                </h3>
            </NavLink>
        );
    }
);

export default SidebarButton;
