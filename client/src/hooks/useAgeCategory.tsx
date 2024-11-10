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

            const response = await fetch(`${baseAPIUrl}/age-categories`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("The requested age categories could not be located. Please verify the resource or try again later.");
                } else if (response.status === 500) {
                    throw new Error("We are currently experiencing technical difficulties. Please try again in a few moments.");
                } else {
                    throw new Error("An unexpected error occurred. We are working to resolve this. Please try again shortly.");
                }
            }
    
            const data = await response.json();
            setAgeCategories(data);
        } catch (error: any) {
            setError(error.message || "An issue occurred while retrieving the age categories. Please refresh and try again.");
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, ageCategories, fetchAgeCategories }
}