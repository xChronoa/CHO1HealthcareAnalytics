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
    const { collapseSidebar, isMinimized } = useSidebarContext();

    // Check if the current route is the index ("/") route
    const isIndexRoute = location.pathname === "/" || location.pathname === "/terms" || location.pathname === "/privacy";

    // List of routes where the sidebar should not be shown
    const routesWithoutSidebar = [
        "/",
        "/privacy",
        "/terms",
        "/appointment",
        "/appointment/confirmation",
        "/barangay/login",
        "/admin/login",
        "/forgot-password",
    ];

    // Explicitly allow sidebar on /admin and /barangay
    const routesWithSidebar = [
        "/admin",
        "/barangay"
    ];

    // Check if the current route is in routesWithoutSidebar
    const isWithoutSidebar = routesWithoutSidebar.includes(location.pathname);

    // Check if the current route is in routesWithSidebar, but avoid login routes
    const isWithSidebar = routesWithSidebar.some(route => location.pathname.startsWith(route)) && !location.pathname.includes("/login");

    return (
        <header
            className={`transition-all ${isMinimized ? "pl-14" : isWithoutSidebar ? "px-4 md:px-12" : "lg:pl-52"} flex items-center justify-center w-full ${
                isIndexRoute
                    ? "py-2"
                    : logoPath !== null && logoPath !== undefined
                    ? "py-2"
                    : "py-8"
            } shadow-lg bg-green`}
        >
            <div className="container flex flex-row wrap">
                {" "}
                {(!isWithoutSidebar || isWithSidebar) && (
                    <FontAwesomeIcon
                        icon={faBars}
                        className="absolute self-center p-[4px] lg:hidden cursor-pointer hover:bg-lime-800 transition-all duration-300 text-white border-2 border-white rounded-lg size-6"
                        onClick={collapseSidebar}
                    />
                )}
                <div
                    className={`${isWithoutSidebar ? "w-full" : ""} flex ${
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
            </div>
        </header>
    );
};

export default Header;
