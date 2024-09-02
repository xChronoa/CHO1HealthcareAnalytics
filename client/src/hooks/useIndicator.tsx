import { useState, useCallback } from "react";
import { Indicator } from "../types/Indicator";

// Define the custom hook
export const useIndicator = () => {
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [indicatorLoading, setIndicatorLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIndicatorsByServiceName = useCallback(async (service_name: string) => {
        setIndicatorLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8000/api/indicator/${encodeURIComponent(encodeURIComponent(service_name))}`,
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
            setIndicatorLoading(false);
        }
    }, []);

    // Return the states and functions for use in components
    return {
        fetchIndicatorsByServiceName,
        indicators,
        indicatorLoading,
        error 
    };
};
