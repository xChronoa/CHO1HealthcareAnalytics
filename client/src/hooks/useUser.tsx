import { useState, useCallback } from "react";
import { User } from "../types/User";

interface UseUser {
    // Functions
    fetchUsers: () => Promise<void>;
    getUser: (user_id: number) => Promise<User>;
    createUser: (user: User) => Promise<boolean>;
    updateUser: (user: User) => Promise<boolean>;

    // Variables
    users: User[] | null;
    loading: boolean;
    success: boolean;
    error: string | null;
    errorMessage?: Errors;
}

interface Errors {
    email?: string;
    username?: string;
    password?: string;
    barangay_name?: string;
}

export const useUser = (): UseUser => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<Errors>({});

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8000/api/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error();
            }

            const data: User[] = await response.json();
        
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setError(
                    "An unexpected error occurred. Please try again later."
                );
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    const getUser = useCallback(async (user_id: number): Promise<User> => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/users/${user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });
    
            if (!response.ok) {
                throw new Error();
            }
    
            const data: User = await response.json();
    
            // Assuming you are storing the user in state or handling it otherwise
            setUsers([data]); // or setUser(data) if you have a single state for a user
    
            return data; // Return the fetched user data
    
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
            throw error; // Re-throw the error to handle it in the calling code if needed
        } finally {
            setLoading(false);
        }
    }, []);
    

    const createUser = useCallback(async (user: User): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch("http://localhost:8000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(user),
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                setErrorMessage(data.errors);
                throw new Error("Failed to create user.");
            }

            setSuccess(prev => !prev);
            return true;
        } catch (error: any) {
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (user: User): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch(`http://localhost:8000/api/users/${user.user_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(user),
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                setErrorMessage(data.errors);
                throw new Error("Failed to update user.");
            } 

            setSuccess(true);
            return true;
        } catch (error: any) {
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchUsers,
        getUser,
        createUser,
        updateUser,
        users,
        loading,
        success,
        error,
        errorMessage,
    };
};
