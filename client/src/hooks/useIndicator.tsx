import { useState, useCallback } from "react";
import { Indicator } from "../types/Indicator";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

// Define the custom hook
export const useIndicator = () => {
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);

    const fetchIndicatorsByServiceName = useCallback(async (service_name: string) => {
        incrementLoading();
        setError(null);

        try {
            const response = await fetch(
                `${baseAPIUrl}/indicator/${encodeURIComponent(encodeURIComponent(service_name))}`,
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
                    `Failed to fetch Indicators: ${response.statusText}`
                );
            }

            const data: Indicator[] = await response.json();
            setIndicators(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            decrementLoading();
        }
    }, []);

    // Return the states and functions for use in components
    return {
        fetchIndicatorsByServiceName,
        indicators,
        error 
    };
};
