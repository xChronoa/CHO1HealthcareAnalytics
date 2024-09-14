import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";

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
    loading: boolean;
    error: string | null;
    morbidityReports: MorbidityReport[];
    fetchMorbidityReports: () => Promise<void>;
}

// Create the custom hook
export const useMorbidityReport = (): UseMorbidityReport => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [morbidityReports, setMorbidityReports] = useState<MorbidityReport[]>([]);

    const fetchMorbidityReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${baseAPIUrl}/morbidity-reports`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include", // include credentials if needed
            });

            if (!response.ok) {
                throw new Error("An error occurred while fetching the morbidity reports.");
            }

            const result = await response.json();
            setMorbidityReports(result.data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, morbidityReports, fetchMorbidityReports };
};
