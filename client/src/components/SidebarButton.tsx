import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { Link } from "react-router-dom";

interface SidebarButtonProps {
    icon: IconProp;
    labelText: string;
    additionalStyle?: string;
    isMinimized: boolean;
    destination: string;
}

export const SidebarButton: React.FC<SidebarButtonProps> = memo(
    ({ icon, labelText, additionalStyle = "", isMinimized, destination }) => (
        <Link
            to={destination}
            className={`${additionalStyle} relative overflow-hidden flex ${
                isMinimized ? "justify-center" : "justify-self-end"
            } items-center w-11/12 gap-5 p-3 border-2 border-black rounded-md shadow-2xl cursor-pointer hover:scale-95 transition-transform`}
        >
            <FontAwesomeIcon icon={icon} className="justify-self-start" />
            <h3
                className={`flex-1 text-nowrap text-justify transition-transform ${
                    isMinimized
                        ? "absolute -translate-x-full opacity-0"
                        : "translate-x-0 opacity-100"
                }`}
            >
                {labelText}
            </h3>
        </Link>
    )
);
