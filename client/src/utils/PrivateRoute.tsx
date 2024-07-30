import { Outlet, Navigate, useLocation } from "react-router-dom";

export const PrivateRoute: React.FC = () => {
    // Simulating user authentication status; this should be replaced with actual authentication logic
    const user: boolean = false; // false indicates the user is not authenticated
    const location = useLocation();
    
    // Determine the type of login needed based on the current path
    const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/barangay/login";


    return(
        <>
            {user ? <Outlet/> : <Navigate to={loginPath}/>}
        </>
    );
};