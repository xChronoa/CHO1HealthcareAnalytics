import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import cho_logo from "../assets/images/cho_logo.png";
import cabuyao_logo from "../assets/images/cabuyao_logo.png";
import { useSidebarContext } from "../context/SidebarContext";

interface HeaderProp {
    logoPath?: string | null;
}

const Header: React.FC<HeaderProp> = ({ logoPath }) => {
    const location = useLocation(); // Get the current route path
    const { collapseSidebar } = useSidebarContext();

    // Check if the current route is the index ("/") route
    const isIndexRoute = location.pathname === "/" || location.pathname === "/terms" || location.pathname === "/privacy";

    return (
        <header
            className={`box-border flex items-center justify-between w-full px-8 ${
                isIndexRoute
                    ? "py-2"
                    : logoPath !== null && logoPath !== undefined
                    ? "py-2"
                    : "py-8"
            } shadow-lg bg-green`}
        >
            {" "}
            {collapseSidebar && (
                <FontAwesomeIcon
                    icon={faBars}
                    className="self-center p-[4px] lg:hidden cursor-pointer hover:bg-lime-800 transition-all duration-300 text-white border-2 border-white rounded-lg size-6"
                    onClick={collapseSidebar}
                />
            )}
            <div
                className={`flex ${
                    !isIndexRoute ? "justify-center" : "justify-left gap-2"
                } flex-1`}
            >
                {isIndexRoute ? (
                    // Render two logos for the index route
                    <>
                        <img
                            className="self-center size-12"
                            src={cabuyao_logo}
                            alt="City of Cabuyao Logo"
                            loading="lazy"
                        />
                        <div className="border-[1px] border-white rounded-lg"></div>
                        {/* Add another logo */}
                        <img
                            className="self-center size-12" // You can adjust the margin if needed
                            src={cho_logo} // Use a different logo here
                            alt="CHO Logo"
                            loading="lazy"
                        />
                    </>
                ) : (
                    // Render one logo if not on the index route
                    logoPath && (
                        <img
                            className="self-center size-12"
                            src={logoPath}
                            alt="City of Cabuyao Logo"
                            loading="lazy"
                        />
                    )
                )}
            </div>
        </header>
    );
};

export default Header;
