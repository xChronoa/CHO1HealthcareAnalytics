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
            className={`${additionalStyle} flex ${
                isMinimized ? "justify-center" : "justify-self-end"
            } items-center w-11/12 gap-5 p-3 border-2 border-black rounded-md shadow-2xl cursor-pointer hover:scale-95 transition`}
        >
            <FontAwesomeIcon icon={icon} className="justify-self-start" />
            {!isMinimized && (
                <h3 className="flex-1 text-justify text-nowrap">{labelText}</h3>
            )}
        </Link>
    )
);