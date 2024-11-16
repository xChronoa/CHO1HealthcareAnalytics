// Import Components
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import useSidebar from "../hooks/useSidebar";

import cabuyao_logo from "../assets/images/cabuyao_logo.png";
import { useAuth } from "../context/AuthContext";
import logos from "../assets/logoImports";

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
    const { isMinimized, isCollapsed, toggleSidebar, collapseSidebar } = useSidebar();
    const { user } = useAuth();
    const logoPath = user?.barangay_name ? logos[user.barangay_name.toLowerCase()] : cabuyao_logo;

    return (
        <>
            <Sidebar
                logoPath={logoPath}
                isMinimized={isMinimized}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                collapseSidebar={collapseSidebar}
                type={sidebarConfig.type}
                barangay={user?.barangay_name}
                username={user?.username}
            />
            <Header logoPath={cabuyao_logo} collapseSidebar={collapseSidebar} />
            <main className={`relative flex flex-col items-center flex-grow transition-all ${!isMinimized && !isCollapsed ? "lg:pl-52" : "lg:pl-14"} bg-almond min-h-screen`}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
