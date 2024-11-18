import { useState, useCallback } from "react";
import { User } from "../types/User";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

interface UseUser {
    // Functions
    fetchUsers: () => Promise<void>;
    getUser: (user_id: number) => Promise<User>;
    createUser: (user: User) => Promise<boolean>;
    updateUser: (user: User) => Promise<boolean>;
    disableUser: (user: User) => Promise<boolean>;

    // Variables
    users: User[];
    success: boolean;
    error: string | null;
    errorMessage?: Errors;
}

interface Errors {
    email?: string;
    username?: string;
    password?: string;
    password_confirmation?: string;
    barangay_name?: string;
}

export const useUser = (): UseUser => {
    const [users, setUsers] = useState<User[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<Errors>({});

    const fetchUsers = useCallback(async () => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            
            const response = await fetch(`${baseAPIUrl}/users`, {
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
            decrementLoading();
        }
    }, []);

    const getUser = useCallback(async (user_id: number): Promise<User> => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            
            const response = await fetch(`${baseAPIUrl}/users/${user_id}`, {
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
            decrementLoading();
        }
    }, []);
    

    const createUser = useCallback(async (user: User): Promise<boolean> => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch(`${baseAPIUrl}/users`, {
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
            decrementLoading();
        }
    }, []);

    const updateUser = useCallback(async (user: User): Promise<boolean> => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch(`${baseAPIUrl}/users/${user.user_id}`, {
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
            decrementLoading();
        }
    }, []);

    const disableUser = useCallback(async (user: User): Promise<boolean> => {
        try {
            incrementLoading();
            setError(null);
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch (`${baseAPIUrl}/users/disable/${user.user_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(user),
                credentials: "include",
            });

            if(!response.ok) {
                const data = await response.json();
                setErrorMessage(data.errors);
                throw new Error("An error occured while disabling the user account.");
            }
            
            setSuccess(true);
            return true;
        } catch (error: any) {
            setError(error.message);
            return false;
        } finally {
            decrementLoading();
        }
    }, []);

    return {
        fetchUsers,
        getUser,
        createUser,
        updateUser,
        disableUser,
        users,
        success,
        error,
        errorMessage,
    };
};
