import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";

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
    loading: boolean;
    error: string | null;
    wraData: WomenOfReproductiveAge[];
    fetchWra: () => Promise<void>;
}

export const useWra = (): UseWra => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [wraData, setWraData] = useState<WomenOfReproductiveAge[]>([]);

    const fetchWra = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${baseAPIUrl}/wra-reports`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("An error occurred while fetching the women of reproductive ages.");
            }

            const result = await response.json();
            setWraData(result.data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, wraData, fetchWra, };
};
