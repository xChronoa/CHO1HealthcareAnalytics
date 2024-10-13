import { useState, useCallback } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

// Define types for the data models
interface Patient {
    patient_id: number;
    first_name: string;
    last_name: string;
    sex: string;
    birthdate: string;
    address: string;
    email: string;
    phone_number: string;
}

interface AppointmentCategory {
    id: number;
    name: string;
}

interface Appointment {
    id?: number;
    patient: Patient;
    appointment_date: string;
    appointment_category: AppointmentCategory;
    patient_note?: string;
    queue_number?: number;
}

// Define the custom hook
export const useAppointment = () => {
    // State variables for managing appointments and their loading/error states
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    
    const [appointmentCount, setAppointmentCount] = useState<number>(0);

    const { incrementLoading, decrementLoading } = useLoading();

    const fetchCount = useCallback(async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/appointments/count`, {
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

            const data = await response.json();
            setAppointmentCount(data);
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            decrementLoading();
        }
    }, []);

    /**
     * Fetch all appointments from the API.
     */
    const fetchAppointments = useCallback(async () => {
        incrementLoading();
        setError(null);

        try {
            const response = await fetch(`${baseAPIUrl}/appointments/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch appointments: ${response.statusText}`
                );
            }

            const data: Appointment[] = await response.json();
            setAppointments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            decrementLoading();
        }
    }, []);

    /**
     * Fetch all appointments from the API.
     */
    const fetchPatientsAppointments = useCallback(async () => {
        incrementLoading();
        setError(null);

        try {
            const response = await fetch(`${baseAPIUrl}/appointments/patients`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch appointments: ${response.statusText}`
                );
            }

            const data: Appointment[] = await response.json();
            setAppointments(data);

            // Calculate min and max dates
            if (data.length > 0) {
                const dates = data.map((appointment) =>
                    new Date(appointment.appointment_date).getTime()
                );

                const minTimestamp = Math.min(...dates);
                const maxTimestamp = Math.max(...dates);
                setMinDate(new Date(minTimestamp).toISOString().split("T")[0]);
                setMaxDate(new Date(maxTimestamp).toISOString().split("T")[0]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            decrementLoading();
        }
    }, []);

    /**
     * Fetch a single appointment by ID.
     *
     * @param id - The appointment ID
     */
    const fetchAppointmentById = useCallback(async (id: number) => {
        incrementLoading();
        setError(null);

        try {
            const response = await fetch(`${baseAPIUrl}/appointments/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch appointment: ${response.statusText}`
                );
            }

            const data: Appointment = await response.json();
            setAppointment(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            decrementLoading();
        }
    }, []);

    /**
     * Create a new appointment.
     *
     * @param newAppointment - The appointment data to be created
     */
    const createAppointment = useCallback(
        async (newAppointment: Partial<Appointment>) => {
            incrementLoading();
            setError(null);

            try {
                const response = await fetch(`${baseAPIUrl}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(newAppointment),
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to create appointment: ${response.statusText}`
                    );
                }

                const data: Appointment = await response.json();
                setAppointments((prev) => [...prev, data]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                decrementLoading();
            }
        },
        []
    );

    /**
     * Update an existing appointment.
     *
     * @param id - The appointment ID
     * @param updatedAppointment - The updated appointment data
     */
    const updateAppointment = useCallback(
        async (id: number, updatedAppointment: Partial<Appointment>) => {
            incrementLoading();
            setError(null);

            try {
                const response = await fetch(`${baseAPIUrl}/appointments/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(updatedAppointment),
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to update appointment: ${response.statusText}`
                    );
                }

                const data: Appointment = await response.json();
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === id ? data : appointment
                    )
                );
            } catch (err: any) {
                setError(err.message);
            } finally {
                decrementLoading();
            }
        },
        []
    );

    /**
     * Fetch appointments by category name and date.
     *
     * @param categoryName - The name of the appointment category
     * @param date - The date to filter the appointments (optional)
     */
    const fetchAppointmentsByCategory = useCallback(
        async (categoryName: string, date?: string) => {
            incrementLoading();
            setError(null);

            // Build query parameters
            const queryParams = new URLSearchParams();
            if (date) {
                queryParams.append("date", date);
            }

            try {
                const response = await fetch(
                    `${baseAPIUrl}/appointments/category/${categoryName}?${queryParams.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch appointments for category: ${response.statusText}`
                    );
                }

                const data: Appointment[] = await response.json();
                setAppointments(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                decrementLoading();
            }
        },
        [] // Dependencies array: update this if you need to use dependencies
    );

    // Return the states and functions for use in components
    return {
        appointments,
        appointment,
        error,
        minDate,
        maxDate,
        appointmentCount,
        fetchCount,
        fetchAppointments,
        fetchPatientsAppointments,
        fetchAppointmentById,
        createAppointment,
        updateAppointment,
        fetchAppointmentsByCategory,
    };
};
