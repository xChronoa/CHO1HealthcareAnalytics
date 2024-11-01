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

// Custom hook for managing appointments
export const useAppointment = () => {
    // State variables for managing appointments and their loading/error states
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [appointmentCount, setAppointmentCount] = useState<number>(0);
    const { incrementLoading, decrementLoading } = useLoading();

    // Utility function for handling errors
    const handleError = (message: string) => {
        console.error(message);
        setError(message);
    };

    // Fetch count of appointments
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
                throw new Error("Unable to retrieve appointment count.");
            }

            const data = await response.json();
            setAppointmentCount(data);
        } catch (error) {
            handleError("An unexpected error occurred while fetching the appointment count. Please try again later.");
        } finally {
            decrementLoading();
        }
    }, []);

    // Fetch all appointments
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
                throw new Error("Failed to fetch appointments. Please check your connection.");
            }

            const data: Appointment[] = await response.json();
            setAppointments(data);
        } catch (err: any) {
            handleError(err.message || "An error occurred while retrieving appointments. Please refresh and try again.");
        } finally {
            decrementLoading();
        }
    }, []);

    // Fetch patients' appointments
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
                throw new Error("Failed to fetch patients' appointments. Please try again.");
            }

            const data: Appointment[] = await response.json();
            setAppointments(data);

            // Calculate min and max dates
            if (data.length > 0) {
                const dates = data.map((appointment) => new Date(appointment.appointment_date).getTime());
                setMinDate(new Date(Math.min(...dates)).toISOString().split("T")[0]);
                setMaxDate(new Date(Math.max(...dates)).toISOString().split("T")[0]);
            }
        } catch (err: any) {
            handleError(err.message || "An error occurred while fetching patients' appointments. Please try again.");
        } finally {
            decrementLoading();
        }
    }, []);

    // Fetch an appointment by ID
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
                throw new Error("Failed to fetch appointment. Please check the appointment ID.");
            }

            const data: Appointment = await response.json();
            setAppointment(data);
        } catch (err: any) {
            handleError(err.message || "An error occurred while retrieving the appointment. Please try again.");
        } finally {
            decrementLoading();
        }
    }, []);

    // Create a new appointment
    const createAppointment = useCallback(
        async (newAppointment: Partial<Appointment>) => {
            incrementLoading();
            setError(null);

            try {
                const response = await fetch(`${baseAPIUrl}/appointments/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(newAppointment),
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to create appointment. Please check your data.");
                }

                const data: Appointment = await response.json();
                setAppointments((prev) => [...prev, data]);
            } catch (err: any) {
                handleError(err.message || "An error occurred while creating the appointment. Please try again.");
            } finally {
                decrementLoading();
            }
        },
        []
    );

    // Update an existing appointment
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
                    throw new Error("Failed to update appointment. Please check your data.");
                }

                const data: Appointment = await response.json();
                setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? data : appointment)));
            } catch (err: any) {
                handleError(err.message || "An error occurred while updating the appointment. Please try again.");
            } finally {
                decrementLoading();
            }
        },
        []
    );

    // Fetch appointments by category name and date
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
                    throw new Error("Failed to fetch appointments for category. Please try again.");
                }

                const data: Appointment[] = await response.json();
                setAppointments(data);
            } catch (err: any) {
                handleError(err.message || "An error occurred while fetching appointments for the category. Please try again.");
            } finally {
                decrementLoading();
            }
        },
        []
    );

    // Fetch the earliest and latest appointment dates
    const fetchEarliestAndLatestAppointments = useCallback(async () => {
        incrementLoading();
        setError(null);

        try {
            const response = await fetch(`${baseAPIUrl}/appointments/min-max`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch earliest and latest appointments. Please try again.");
            }

            const data = await response.json();

            // Update state with the fetched dates
            setMinDate(data.earliest_appointment_date || null);
            setMaxDate(data.latest_appointment_date || null);
        } catch (err: any) {
            handleError(err.message || "An error occurred while fetching the earliest and latest appointments. Please try again.");
            setError(err.message);
        } finally {
            decrementLoading();
        }
    }, []);


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
        fetchEarliestAndLatestAppointments
    };
};
