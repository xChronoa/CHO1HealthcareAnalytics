import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface HeaderProp {
    logoPath?: string | null;
    collapseSidebar?: () => void;
}

export const Header: React.FC<HeaderProp> = ({ logoPath, collapseSidebar }) => {
    return (
        <header className={`box-border flex items-center justify-between w-full px-8 ${logoPath ? "py-2" : "py-8"} shadow-lg bg-green`}>
            {collapseSidebar && (
                <FontAwesomeIcon
                icon={faBars}
                className="self-center p-[4px] lg:hidden cursor-pointer hover:bg-lime-800 transition-all duration-300 text-white border-2 border-white rounded-lg size-6"
                onClick={collapseSidebar}
            />
            )}

            <div className="flex justify-center flex-1">
                {logoPath && (
                    <img
                        className="self-center size-12"
                        src={logoPath}
                        alt="City of Cabuyao Logo"
                    />
                )}
            </div>
        </header>
    );
};
