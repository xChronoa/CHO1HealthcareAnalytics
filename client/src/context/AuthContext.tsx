import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "./LoadingContext";

/**
 * Interface defining the authentication context.
 */
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
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

    /**
     * Checks the authentication status of the user by making a request to the server.
     * Updates the context state based on the response.
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                incrementLoading();
                const response = await fetch(`${baseAPIUrl}/auth/check`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();

                    setUser({
                        role: data.role,
                        barangay_name: data.barangay_name,
                        username: data.username,
                        email: data.email,
                        user_id: data.user_id,
                    });
                } else {
                    const { message, status } = await response.json();
                    if (status !== "not_logged") {
                        setError(message || "Failed to fetch authentication.");
                    }
                }

            } catch {
                setError("An error occurred while checking authentication.");
            } finally {
                decrementLoading();
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

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
    const login = async (email: string, password: string) => {
        const previousPath = window.location.pathname;

        const data = await handleFetch(`${baseAPIUrl}/login`, "POST", { email, password, previousPath });
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
  