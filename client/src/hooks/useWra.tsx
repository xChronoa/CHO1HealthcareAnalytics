import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

export interface AgeCategory {
    age_category_id: number;
    age_category: string;
}

export interface WomenOfReproductiveAge {
    wra_id: number;
    unmet_need_modern_fp: number;
    barangay_name: string;
    age_category: string;
    report_period: string;
}

interface UseWra {
    error: string | null;
    wraData: WomenOfReproductiveAge[];
    fetchWra: (barangayName: string, year: String | number | null) => Promise<void>;
}

export const useWra = (): UseWra => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [wraData, setWraData] = useState<WomenOfReproductiveAge[]>([]);

    const fetchWra = useCallback(async (barangayName: string, year: String | number | null) => {
        try {
            incrementLoading();
            setError(null);
    
            const response = await fetch(`${baseAPIUrl}/wra-reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ barangayName, year }), // Include barangayName and year in the body
            });
    
            if (!response.ok) {
                throw new Error("An error occurred while fetching the women of reproductive age data. Please reload the page or try again later.");
            }
    
            const result = await response.json();
            setWraData(result.data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, wraData, fetchWra, };
};
