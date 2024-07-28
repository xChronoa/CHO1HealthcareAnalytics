// Assets
import cabuyao_logo from "./assets/cabuyao_logo.png";
import cho_logo from "./assets/cho_logo.png";

// Routing
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./utils/PrivateRoute";

// Pages
import Appointment from "./pages/Appointment";
import History from "./pages/Barangay/History";
import Login from "./pages/Login";
import Report from "./pages/Barangay/Report";

// Components
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

// Hook
import useSidebar from "./hooks/useSidebar";

function App() {
    const { isMinimized, isCollapsed, toggleSidebar, collapseSidebar } =
        useSidebar();

    return (
        <BrowserRouter>
            <Sidebar
                barangay="Marinig"
                logoPath={cabuyao_logo}
                isMinimized={isMinimized}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                collapseSidebar={collapseSidebar}
            />
            <Header collapseSidebar={collapseSidebar} />
            <main className={`transition-all flex flex-col items-center min-h-screen bg-almond ${!isMinimized && isCollapsed ? "lg:pl-56" : ""}`}>
                <Routes>
                    <Route element={<Appointment />} path="/appointment" />

                    <Route
                        element={<Login image={cabuyao_logo} />}
                        path="/barangay/login"
                    />
                    <Route
                        element={<Login image={cho_logo} />}
                        path="/admin/login"
                    />

                    <Route element={<PrivateRoute />} path="/admin"></Route>

                    <Route element={<PrivateRoute />} path="/barangay">
                        {/* <Route element={<BarangayDashboard/>}/> */}
                    </Route>

                    <Route element={<History />} path="/barangay/history" />
                    <Route element={<Report />} path="/barangay/report" />
                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
