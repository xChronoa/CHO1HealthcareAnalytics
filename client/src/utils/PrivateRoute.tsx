import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute: React.FC<{ allowedRoles: string[] }> = ({
    allowedRoles,
}) => {
    const { user } = useAuth();
    const location = useLocation(); // Get the current location

    if (!user) {
        // If the user is not authenticated, redirect to the appropriate login page
        const loginPath =
            location.pathname.startsWith("/admin") ? "/admin/login" : "/barangay/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check if the user's role is allowed
    if (user && !allowedRoles.includes(user.role)) {
        // If the user is authenticated but doesn't have the required role, redirect them to a not authorized page
        return <Navigate to="/not-found" />;
    }

    return <Outlet />;
};
