import { useState, useCallback } from "react";
import { Patient } from "../types/Patient";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

interface UsePatient {
    // Functions
    fetchPatients: () => Promise<void>;
    fetchCount: () => Promise<void>;
    getPatient: (patient_id: number) => Promise<Patient>;
    createPatient: (patient: Patient) => Promise<boolean>;
    updatePatient: (patient: Patient) => Promise<boolean>;

    // Variables
    patientCount: number;
    patients: Patient[] | null;
    success: boolean;
    error: string | null;
    errorMessage?: Errors;
}

interface Errors {
    first_name?: string;
    last_name?: string;
    sex?: string;
    birthdate?: string;
    address?: string;
    phone_number?: string;
    email?: string;
}

export const usePatient = (): UsePatient => {
    const [patientCount, setPatientCount] = useState<number>(0);
    const [patients, setPatients] = useState<Patient[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<Errors>({});

    const fetchCount = useCallback(async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/patients/count`, {
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
            setPatientCount(data);
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            decrementLoading();
        }
    }, []);

    const fetchPatients = useCallback(async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/patients`, {
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

            const data: Patient[] = await response.json();
        
            if (Array.isArray(data)) {
                setPatients(data);
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        } finally {
            decrementLoading();
        }
    }, []);

    const getPatient = useCallback(async (patient_id: number): Promise<Patient> => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/patients/${patient_id}`, {
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
    
            const data: Patient = await response.json();
    
            // Assuming you are storing the patient in state or handling it otherwise
            setPatients([data]); // or setPatient(data) if you have a single state for a patient
    
            return data; // Return the fetched patient data
    
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
            throw error; // Re-throw the error to handle it in the calling code if needed
        } finally {
            decrementLoading();
        }
    }, []);
    

    const createPatient = useCallback(async (patient: Patient): Promise<boolean> => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch(`${baseAPIUrl}/patients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(patient),
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                setErrorMessage(data.errors);
                throw new Error("Failed to create patient.");
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

    const updatePatient = useCallback(async (patient: Patient): Promise<boolean> => {
        try {
            incrementLoading();
            setError(null); // Reset error before request
            setErrorMessage({});
            setSuccess(false);

            const response = await fetch(`${baseAPIUrl}/patients/${patient.patient_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(patient),
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                setErrorMessage(data.errors);
                throw new Error("Failed to update patient.");
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
        fetchPatients,
        fetchCount,
        getPatient,
        createPatient,
        updatePatient,
        patientCount,
        patients,
        success,
        error,
        errorMessage,
    };
};
