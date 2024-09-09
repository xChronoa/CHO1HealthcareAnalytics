import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export const PrivateRoute: React.FC<{ allowedRoles: string[] }> = ({
    allowedRoles,
}) => {
    const { user, authenticated, loading } = useAuth();
    
    if (loading) {
        // Show a loading spinner or placeholder while checking authentication
        return <Loading />;
    }
    
    if (!authenticated && !loading) {
        // If the user is not authenticated, redirect to the appropriate login page
        const loginPath = location.pathname.startsWith("/admin")
        ? "/admin/login"
        : "/barangay/login";
        return <Navigate to={loginPath} />;
    }
    
    if(user) {
        if (authenticated && user.role) {
            if (!allowedRoles.includes(user.role)) {
                // If the user is authenticated but doesn't have the required role, redirect them to a not authorized page
                return <Navigate to="/not-found" />;
            }
        }
    }

    return <Outlet />;
};
