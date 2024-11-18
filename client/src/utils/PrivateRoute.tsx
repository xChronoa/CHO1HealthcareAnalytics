import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute: React.FC<{ allowedRoles: string[] }> = ({
    allowedRoles,
}) => {
    const { user, loading } = useAuth();
    const location = useLocation(); // Get the current location

    if(loading) {
        return;
    }
    
    if (!user) {
        // If the user is not authenticated, redirect to the appropriate login page
        const loginPath =
            location.pathname.startsWith("/admin") ? "/admin/login" : "/barangay/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        const targetPath = location.pathname.endsWith("/")
            ? `${location.pathname}not-found`
            : `${location.pathname}/not-found`;
            
        return <Navigate to={targetPath} />;
    }

    return <Outlet />;
};
