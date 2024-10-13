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
}

export const useAppointmentCategory = (): UseAppointmentCategory => {
    const [appointmentCategories, setAppointmentCategories] = useState<
        AppointmentCategory[]
    >([]);

    const { incrementLoading, decrementLoading } = useLoading();

    const fetchAppointmentCategories = useCallback(async () => {
        try {
            incrementLoading();

            const response = await fetch(
                `${baseAPIUrl}/appointment-categories`
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data: AppointmentCategory[] = await response.json();
            // Ensure data is an array
            if (Array.isArray(data)) {
                setAppointmentCategories(data);
            } else {
                console.error("Expected an array but got:", data);
            }
        } catch (error) {
            console.error("Error fetching appointment categories:", error);
        } finally {
            decrementLoading();
        }
    }, []);

    return { fetchAppointmentCategories, appointmentCategories };
};
