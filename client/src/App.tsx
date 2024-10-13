// Import Assets
import cabuyao_logo from "./assets/images/cabuyao_logo.png";
import cho_logo from "./assets/images/cho_logo.png";

// Import Routing Components
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./utils/PrivateRoute";

// Import Components
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";
import GuestLayout from "./components/GuestLayout";
import ManageAccountLayout from "./components/ManageAccountLayout";
import { AuthProvider } from "./context/AuthContext";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import SubmittedReports from "./pages/Submitted_Reports/SubmittedReports";

// Import the Loading component
import Loading from "./components/Loading";
import React from "react";

// Lazy load pages
const Overview = React.lazy(() => import("./pages/Overview"));
const Appointment = React.lazy(() => import("./pages/Appointment"));
const Login = React.lazy(() => import("./pages/Login"));
const History = React.lazy(() => import("./pages/Barangay/History"));
const Report = React.lazy(() => import("./pages/Barangay/Report"));
const Dashboard = React.lazy(() => import("./pages/Admin/Dashboard"));
const Transaction = React.lazy(() => import("./pages/Admin/Transaction"));
const BarangayList = React.lazy(() => import("./pages/Admin/BarangayList"));
const AppointmentList = React.lazy(() => import("./pages/Admin/AppointmentList"));
const ManageAccount = React.lazy(() => import("./pages/Admin/ManageAccount"));
const AccountList = React.lazy(() => import("./pages/Admin/AccountList"));
const CreateAccount = React.lazy(() => import("./pages/Admin/CreateAccount"));
const UpdateAccount = React.lazy(() => import("./pages/Admin/UpdateAccount"));

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <React.Suspense fallback={<Loading />}>
                    <Routes>
                        {/* Guest Routes */}
                        <Route element={<GuestLayout />}>
                            {/* <Route index element={<Overview />} /> */}
                            <Route index element={<Login image={cho_logo} />} />
                            <Route path="/appointment" element={<Appointment />} />
                            <Route path="/appointment/confirmation" element={<AppointmentConfirmation />} />
                            <Route path="/barangay/login" element={<Login image={cabuyao_logo} />} />
                            <Route path="/admin/login" element={<Login image={cho_logo} />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                            <Route path="admin" element={<MainLayout sidebarConfig={{ type: 'admin' }} />}>
                                <Route index element={<Dashboard />} />
                                <Route path="transactions" element={<Transaction />} />
                                <Route path="barangays" element={<BarangayList />} />
                                <Route path="appointments" element={<AppointmentList />} />
                                <Route path="manage" element={<ManageAccountLayout />}>
                                    <Route index element={<ManageAccount />} />
                                    <Route path="create" element={<CreateAccount />} />
                                    <Route path="update" element={<UpdateAccount />} />
                                    <Route path="accounts" element={<AccountList />} />
                                </Route>
                                <Route path="report/submitted/:barangayName" element={<SubmittedReports />} />
                            </Route>
                        </Route>

                        {/* Barangay Routes */}
                        <Route element={<PrivateRoute allowedRoles={['encoder']} />}>
                            <Route path="barangay" element={<MainLayout sidebarConfig={{ type: 'barangay' }} />}>
                                <Route index element={<History />} />
                                <Route path="history" element={<History />} />
                                <Route path="report" element={<Report />} />
                                <Route path="report/submitted" element={<SubmittedReports />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </React.Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
