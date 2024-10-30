import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

interface AppointmentCategory {
    appointment_category_id: number;
    appointment_category_name: string;
}

interface UseAppointmentCategory {
    fetchAppointmentCategories: () => Promise<void>;
    appointmentCategories: AppointmentCategory[];
    error: string | null;
}

export const useAppointmentCategory = (): UseAppointmentCategory => {
    const [error, setError] = useState<string | null>(null);
    const [appointmentCategories, setAppointmentCategories] = useState<
        AppointmentCategory[]
    >([]);

    const { incrementLoading, decrementLoading } = useLoading();

    const fetchAppointmentCategories = useCallback(async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/appointment-categories`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });
    
            if (!response.ok) {
                throw new Error("Unable to fetch appointment categories. Please check your connection or try again later.");
            }
    
            const data: AppointmentCategory[] = await response.json();
    
            // Ensure data is an array
            if (Array.isArray(data)) {
                setAppointmentCategories(data);
            } else {
                setError("An error occurred while processing the appointment categories.");
            }
        } catch (error: any) {
            setError(error.message || "Unexpected error while fetching appointment categories.");
        } finally {
            decrementLoading();
        }
    }, []);
    
    return { fetchAppointmentCategories, appointmentCategories, error };
};
