// Import Components
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

import cho_logo from "../assets/images/cho_logo.png";
import { useAuth } from "../context/AuthContext";
import logos from "../assets/logoImports";
import { useSidebarContext } from "../context/SidebarContext";
import Breadcrumb from "./Breadcrumb";

// Interface for Sidebar Configuration
interface SidebarConfig {
    type: 'admin' | 'barangay';  // Type of sidebar layout
}

// Props for MainLayout Component
interface MainLayoutProps {
    sidebarConfig: SidebarConfig;  // Configuration for the sidebar
}

/**
 * MainLayout component that serves as a wrapper for the main content of the application.
 * It includes the Sidebar, Header, and Footer, and dynamically adjusts based on the sidebar state.
 * 
 * @param {MainLayoutProps} props - Props for the layout including sidebar configuration.
 * @returns {JSX.Element} The main layout component containing the common layout elements.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ sidebarConfig }) => {
    const { isMinimized } = useSidebarContext();
    const { user } = useAuth();
    const logoPath = user?.barangay_name ? logos[user.barangay_name.toLowerCase()] : cho_logo;

    return (
        <>
            <Sidebar
                logoPath={logoPath}
                type={sidebarConfig.type}
                barangay={user?.barangay_name}
                username={user?.username}
            />
            <Header logoPath={cho_logo} />
            <main className={`relative flex flex-col items-center flex-grow transition-all ${!isMinimized ? "lg:pl-52" : "lg:pl-14"} bg-almond min-h-screen`}>
                <Breadcrumb />
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
