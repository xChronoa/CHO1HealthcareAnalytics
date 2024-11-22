import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

// Define the interface for Morbidity Report data
export interface MorbidityReport {
    report_id: number;
    disease_name: string;
    age_category: string;
    male: number;
    female: number;
    report_status: string;
    report_period: string;
}

interface UseMorbidityReport {
    error: string | null;
    morbidityReports: MorbidityReport[];
    fetchMorbidityReports: (barangayName: string, year: String | number | null) => Promise<void>;
}

// Create the custom hook
export const useMorbidityReport = (): UseMorbidityReport => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [morbidityReports, setMorbidityReports] = useState<MorbidityReport[]>([]);

    const fetchMorbidityReports = useCallback(async (barangayName: string, year: String | number | null) => {
        try {
            incrementLoading();
            setError(null);

            const response = await fetch(`${baseAPIUrl}/morbidity-reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include", // include credentials if needed
                body: JSON.stringify({ barangay_name: barangayName, year: year }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch morbidity reports. Please try again later.");
            }
    
            const result = await response.json();
            setMorbidityReports(result.data);
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred while loading morbidity reports.");
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, morbidityReports, fetchMorbidityReports };
};
