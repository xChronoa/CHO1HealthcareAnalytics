import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import Loading from "../components/Loading";

/**
 * Interface defining the authentication context.
 */
interface AuthContextType {
    role: string | null;
    authenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
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
    const [role, setRole] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState<boolean>(localStorage.getItem("authenticated") === "true");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Checks the authentication status of the user by making a request to the server.
     * Updates the context state based on the response.
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/auth/check", {
                    method: "GET",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setAuthenticated(data.authenticated);
                    setRole(data.authenticated ? data.role : null);
                    localStorage.setItem("authenticated", String(data.authenticated));
                } else {
                    const { message } = await response.json();
                    setError(message || "Failed to fetch authentication.");
                    setAuthenticated(false);
                }
            } catch {
                setError("An error occurred while checking authentication.");
                setAuthenticated(false);
            } finally {
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
        setLoading(true);
        setError(null);

        try {
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
                } else {
                    setError("An unexpected error occurred. Please try again later.");
                }
            }
        } catch {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logs in the user by sending email and password to the server.
     * @param email - The email address of the user.
     * @param password - The password of the user.
     */
    const login = async (email: string, password: string) => {
        const data = await handleFetch("http://localhost:8000/api/login", "POST", { email, password });
        if (data) {
            localStorage.setItem("authenticated", "true");
            setAuthenticated(true);
            setRole(data.user.role);
        }
    };

    /**
     * Logs out the user by making a request to the server.
     */
    const logout = async () => {
        const result = await handleFetch("http://localhost:8000/api/logout", "POST");
        if (result !== null) {
            localStorage.removeItem("authenticated");
            setAuthenticated(false);
            setRole(null);
        }
    };

    return (
        <AuthContext.Provider value={{ role, authenticated, login, logout, error, loading, setLoading, setError }}>
            {!loading ? children : <Loading />}
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
  