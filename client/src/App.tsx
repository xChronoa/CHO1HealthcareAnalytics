// Import Assets
import cabuyao_logo from "./assets/images/cabuyao_logo.png";
import cho_logo from "./assets/images/cho_logo.png";

// Import Routing Components
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./utils/PrivateRoute";

// Import Pages
// Guest Pages
import Overview from "./pages/Overview";
import Appointment from "./pages/Appointment";
import Login from "./pages/Login";

// Barangay Pages
import History from "./pages/Barangay/History";
import Report from "./pages/Barangay/Report";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import Transaction from "./pages/Admin/Transaction";
import BarangayList from "./pages/Admin/BarangayList";
import AppointmentList from "./pages/Admin/AppointmentList";
import ManageAccount from "./pages/Admin/ManageAccount";
import AccountList from "./pages/Admin/AccountList";
import CreateAccount from "./pages/Admin/CreateAccount";
import UpdateAccount from "./pages/Admin/UpdateAccount";

// Import Components
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";
import GuestLayout from "./components/GuestLayout";
import ManageAccountLayout from "./components/ManageAccountLayout";
import { AuthProvider } from "./context/AuthContext";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import SubmittedReports from "./pages/Barangay/SubmittedReports";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Guest Routes */}
                    <Route element={<GuestLayout/>}>
                        {/* <Route index element={<Overview />} /> */}
                        <Route index element={<Login image={cho_logo} />} />
                        <Route element={<Appointment />} path="/appointment" />
                        <Route path="/appointment/confirmation" element={<AppointmentConfirmation />} />
                        <Route element={<Login image={cabuyao_logo} />} path="/barangay/login" />
                        <Route element={<Login image={cho_logo} />} path="/admin/login" />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
                        <Route path="admin" element={<MainLayout sidebarConfig={{ type: 'admin' }}/>}>
                            <Route index element={<Dashboard />} />
                            <Route element={<Transaction />} path="transactions" />
                            <Route element={<BarangayList />} path="barangays" />
                            <Route element={<AppointmentList />} path="appointments" />

                            <Route path="manage" element={<ManageAccountLayout />}>
                                <Route index element={<ManageAccount />} />
                                <Route element={<CreateAccount />} path="create" />
                                <Route element={<UpdateAccount />} path="update" />
                                <Route element={<AccountList />} path="accounts" />
                            </Route>

                            <Route element={<SubmittedReports />} path="report/submitted/:barangayName" />
                        </Route>
                    </Route>

                    {/* Barangay Routes */}
                    <Route element={<PrivateRoute allowedRoles={['encoder']}/>}>
                        <Route path="barangay" element={<MainLayout sidebarConfig={{ type: 'barangay'}}/>}>
                            <Route index element={<History />} />
                            <Route element={<History />} path="history" />
                            <Route element={<Report />} path="report" />
                            <Route element={<SubmittedReports />} path="report/submitted" />
                        </Route>
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
