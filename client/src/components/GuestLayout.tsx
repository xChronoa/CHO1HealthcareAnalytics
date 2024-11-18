// Import Components
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * GuestLayout component that serves as a wrapper for the guest content of the application.
 * It includes the Header, and Footer.
 * 
 * @returns {JSX.Element} The main layout component containing the common layout elements.
 */
const GuestLayout: React.FC = () => {
    const { loading } = useAuth();

    if(loading) {
        return <Loading />
    }

    return (
        <>
            <Header />
            <main className="flex flex-col items-center w-full min-h-screen bg-almond">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default GuestLayout;
