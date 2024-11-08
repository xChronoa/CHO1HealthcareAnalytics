import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, MouseEvent } from "react";
import { Link } from "react-router-dom";

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

        return (
            <Link
                to={destination}
                className={`${additionalStyle} relative overflow-hidden flex ${
                    isMinimized ? "justify-center" : "justify-self-end"
                } items-center w-11/12 gap-5 p-3 rounded-md shadow-gray-500 shadow-md cursor-pointer hover:scale-95 transition-transform`}
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
            </Link>
        );
    }
);

export default SidebarButton;
