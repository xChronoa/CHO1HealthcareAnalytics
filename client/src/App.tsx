import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Import Assets
import cabuyao_logo from "./assets/images/cabuyao_logo.png";
import cho_logo from "./assets/images/cho_logo.png";

// Import Context
import { AuthProvider } from "./context/AuthContext";

// Import function for overriding fetch
import "./utils/fetchOverride";

// Import component for routing private pages
import { PrivateRoute } from "./utils/PrivateRoute";

// Import Layouts
import GuestLayout from "./components/GuestLayout";
import MainLayout from "./components/MainLayout";
import ManageAccountLayout from "./components/ManageAccountLayout";

// Import Components
import NotFound from "./pages/NotFound";
import Loading from "./components/Loading";

// Lazy load pages
const Overview = React.lazy(() => import("./pages/Overview"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Login = React.lazy(() => import("./pages/Login"));
const Appointment = React.lazy(() => import("./pages/Appointment"));
const AppointmentConfirmation = React.lazy(() => import("./pages/AppointmentConfirmation"));

// Lazy-load Barangay Pages
const History = React.lazy(() => import("./pages/Barangay/History"));
const Report = React.lazy(() => import("./pages/Barangay/Report"));


// Lazy-load Admin Pages
const Dashboard = React.lazy(() => import("./pages/Admin/Dashboard"));
const Transaction = React.lazy(() => import("./pages/Admin/Transaction"));
const BarangayList = React.lazy(() => import("./pages/Admin/BarangayList"));
const AppointmentList = React.lazy(() => import("./pages/Admin/AppointmentList"));
const ManageAccount = React.lazy(() => import("./pages/Admin/ManageAccount"));
const AccountList = React.lazy(() => import("./pages/Admin/AccountList"));
const CreateAccount = React.lazy(() => import("./pages/Admin/CreateAccount"));
const UpdateAccount = React.lazy(() => import("./pages/Admin/UpdateAccount"));

// Lazy-load Admin & Barangay Page
const SubmittedReports = React.lazy(() => import("./pages/Submitted_Reports/SubmittedReports"));

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <React.Suspense fallback={<Loading />}>
                    <Routes>
                        {/* Guest Routes */}
                        <Route element={<GuestLayout />}>
                            <Route index element={<Overview />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            {/* <Route index element={<Login image={cho_logo} />} /> */}
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
