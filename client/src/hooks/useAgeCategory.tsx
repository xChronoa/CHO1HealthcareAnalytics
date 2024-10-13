import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

export interface AgeCategory {
    age_category_id: number;
    age_category: string;
}

interface UseAgeCategory {
    error: string | null;
    ageCategories: AgeCategory[];
    
    fetchAgeCategories: () => Promise<void>;
}

export const useAgeCategory = (): UseAgeCategory => {
    const [error, setError] = useState<string | null>(null);
    const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();

    const fetchAgeCategories = useCallback(async () => {
        try {
            incrementLoading();
            setError(null); 

            const response = await fetch(`${baseAPIUrl}/age-categories/`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if(!response.ok) {
                throw new Error("An error occured while fetching the ageCategories.");
            }

            const data = await response.json();

            setAgeCategories(data);
        } catch (error: any) {
            setError(error);
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, ageCategories, fetchAgeCategories }
}