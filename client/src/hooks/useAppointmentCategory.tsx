import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";

interface Category {
    appointment_category_id: number;
    appointment_category_name: string;
}

interface AppointmentCategory {
    category: Category;
    is_available: boolean;
}

interface UseAppointmentCategory {
    fetchAppointmentCategories: (date?: String) => Promise<void>;
    appointmentCategories: AppointmentCategory[];
    error: string | null;
    loading: boolean;
}

export const useAppointmentCategory = (): UseAppointmentCategory => {
    const [error, setError] = useState<string | null>(null);
    const [appointmentCategories, setAppointmentCategories] = useState<
        AppointmentCategory[]
    >([]);

    // const { incrementLoading, decrementLoading } = useLoading();
    const [loading, setLoading] = useState(false);

    const fetchAppointmentCategories = useCallback(async (selectedDate?: String) => {
        try {
            setLoading(true);
            const response = await fetch(`${baseAPIUrl}/appointment-categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ selected_date: selectedDate }),
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
            setLoading(false);
        }
    }, []);
    
    return { fetchAppointmentCategories, appointmentCategories, error, loading };
};
