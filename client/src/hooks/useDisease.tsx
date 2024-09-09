import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";

export interface Disease {
    disease_id: number;
    disease_name: string;
    disease_code: string;
}

interface UseDisease {
    loading: boolean;
    error: string | null;
    diseases: Disease[];
    
    fetchDiseases: () => Promise<void>;
}

export const useDisease = (): UseDisease => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [diseases, setDiseases] = useState<Disease[]>([]);

    const fetchDiseases = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); 

            const response = await fetch(`${baseAPIUrl}/diseases/`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if(!response.ok) {
                throw new Error("An error occured while fetching the diseases.");
            }

            const data = await response.json();

            setDiseases(data);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, diseases, fetchDiseases }
}