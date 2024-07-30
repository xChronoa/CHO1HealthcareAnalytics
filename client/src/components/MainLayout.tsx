// Import Components
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import useSidebar from "../hooks/useSidebar";

// Interface for Sidebar Configuration
interface SidebarConfig {
    logo: string;  // Path to the logo image
    type: 'admin' | 'barangay';  // Type of sidebar layout
    barangay?: string;
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

    return (
        <>
            <Sidebar
                logoPath={sidebarConfig.logo}
                isMinimized={isMinimized}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                collapseSidebar={collapseSidebar}
                type={sidebarConfig.type}
                barangay={sidebarConfig.barangay}
            />
            <Header collapseSidebar={collapseSidebar} />
            <main className={`flex flex-col items-center flex-grow transition-all ${!isMinimized && isCollapsed ? "lg:pl-64" : "lg:pl-28"} bg-almond min-h-screen`}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;