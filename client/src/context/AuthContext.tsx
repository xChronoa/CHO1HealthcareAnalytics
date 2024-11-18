import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "./LoadingContext";

/**
 * Interface defining the authentication context.
 */
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (emailOrUsername: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    setError: (error: string | null) => void;
}

interface User {
    user_id?: number;
    username?: string;
    email?: string;
    barangay_id?: number;
    barangay_name: string;
    role:string;
}

/**
 * Context for managing authentication state and actions.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that manages authentication state and functions.
 * @param {ReactNode} children - The child components to be rendered within the provider.
 * @returns {JSX.Element} The AuthProvider component.
 */
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const privateRoutes = [
        "/admin/login",
        "/admin",
        "/admin/reports",
        "/admin/barangays",
        "/admin/barangays/:barangayName/submitted",
        "/admin/appointments",
        "/admin/manage",
        "/admin/manage/create",
        "/admin/manage/update",
        "/admin/manage/accounts",

        "/barangay",
        "/barangay/login",
        "/barangay/report",
        "/barangay/submitted",
        "/barangay/edit/account"
    ];

    /**
     * Checks the authentication status of the user by making a request to the server.
     * Updates the context state based on the response.
     */
    useEffect(() => {
        const checkAuth = async () => {
            const currentPath = window.location.pathname;
    
            // List of Guest Routes that should NOT trigger checkAuth
            const guestRoutes = [
                "/privacy",
                "/terms",
                "/appointment",
                "/appointment/confirmation",
                "/forgot-password"
            ];
    
            // If the current route is in the guestRoutes, don't check auth
            if (guestRoutes.some(route => currentPath.startsWith(route))) {
                setLoading(false); // Don't do auth check for guest routes
                return;
            }
    
            // Function to check if the current path matches any private route, including dynamic ones
            const matchPrivateRoute = (route: string) => {
                // Convert dynamic routes like /admin/barangays/:barangayName to a regex pattern
                const routePattern = route.replace(/:[a-zA-Z0-9]+/g, '[^/]+');
                const regex = new RegExp(`^${routePattern}(/|$)`);
                return regex.test(currentPath);
            };
    
            // Check if the current path matches any protected (private) route
            const isPrivateRoute = privateRoutes.some(matchPrivateRoute);
    
            // If it's a valid private route, check authentication
            if (isPrivateRoute) {
                try {
                    const response = await fetch(`${baseAPIUrl}/auth/check`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json", Accept: "application/json" },
                        credentials: "include",
                    });
    
                    if (response.ok) {
                        const data = await response.json();
    
                        // Successfully fetched user data, update the state
                        setUser({
                            role: data.role,
                            barangay_name: data.barangay_name,
                            username: data.username,
                            email: data.email,
                            user_id: data.user_id,
                        });
                    } else {
                        // If the response is not ok, handle the server-side failure
                        const { message, status } = await response.json();
                        if (status !== "not_logged") {
                            setError(message || "An unexpected error occurred. Please try again later.");
                        }
                    }
                } catch (error) {
                    // Handle errors that occur during the network request
                    if (error instanceof TypeError) {
                        setError("Network error: Unable to connect. Please check your internet connection.");
                    } else {
                        setError("An error occurred while checking authentication. Please try again later.");
                    }
                } finally {
                    decrementLoading(); // Hide loading indicator after request
                    setLoading(false); // Stop loading state
                }
            } else {
                setLoading(false); // If it's not a valid private route, just set loading to false
            }
        };
    
        // Run the checkAuth function on initial mount
        checkAuth();
    }, []); // Empty dependency array ensures this runs only once when the component mounts
    

    /**
     * Handles making fetch requests and common error handling.
     * @param url - The URL to send the request to.
     * @param method - The HTTP method to use for the request.
     * @param body - The body to send with the request, if any.
     * @returns {Promise<any | null>} The response data or null in case of an error.
     */
    const handleFetch = async (url: string, method: string, body?: any): Promise<any | null> => {
        try {
            incrementLoading();
            setError(null);
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: body ? JSON.stringify(body) : undefined,
            });

            if (response.ok) {
                return await response.json();
            } else {
                if(response.status === 401) {
                    setError("The provided credentials are incorrect");
                } else if(response.status === 422) {
                    setError("The email field must be a valid email address.");
                } else if (response.status === 403 ) {
                    const message = await response.json();

                    if(message.error.code === "UNAUTHORIZED_ROLE") {
                        setError("You are not authorized to access the previously visited page.");
                    } else {
                        setError(message.error.message);
                    }
                } else {
                    setError("An unexpected error occurred. Please try again later.");
                }
            }
        } catch {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            decrementLoading();
        }
    };

    /**
     * Logs in the user by sending email and password to the server.
     * @param email - The email address of the user.
     * @param password - The password of the user.
     */
    const login = async (emailOrUsername: string, password: string) => {
        const previousPath = window.location.pathname;

        // Determine if the input is an email or username
        const isEmail = emailOrUsername.includes('@');

        const data = await handleFetch(`${baseAPIUrl}/login`, "POST", {
            [isEmail ? 'email' : 'username']: emailOrUsername,
            password,
            previousPath
        });

        if (data) {
            setUser(data.user);
        }
    };
    
    /**
     * Logs out the user by making a request to the server.
    */
   const logout = async () => {
       const result = await handleFetch(`${baseAPIUrl}/logout`, "POST");
       if (result !== null) {
           localStorage.clear();
           setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, error, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access the authentication context.
 * @returns {AuthContextType} The current authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
  