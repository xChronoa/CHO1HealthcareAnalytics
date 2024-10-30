import { useCallback, useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

export interface Service {
    service_id: number;
    service_name: string;
}

interface UseServices {
    error: string | null;
    services: Service[];
    service: Service;
    
    fetchServices: () => Promise<void>;
    fetchServiceByName: (serviceName: string) => Promise<void>;
}

export const useServices = (): UseServices => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [service, setService] = useState<Service>({
        service_id: 0,
        service_name: "",
    });

    const fetchServices = useCallback(async () => {
        try {
            incrementLoading();
            setError(null);
    
            const response = await fetch(`${baseAPIUrl}/services/`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });
    
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Requested services could not be found. Please verify the request or try again later.");
                } else if (response.status === 500) {
                    throw new Error("We’re experiencing a server issue. Please try again in a few minutes.");
                } else {
                    throw new Error("An unexpected error occurred. We are working to resolve this. Please try again shortly.");
                }
            }
    
            const data = await response.json();
            setServices(data);
        } catch (error: any) {
            setError(error.message || "An error occurred while retrieving the data. Please refresh the page and try again.");
        } finally {
            decrementLoading();
        }
    }, []);
    
    const fetchServiceByName = useCallback(async (serviceName: string) => {
        try {
            incrementLoading();
            setError(null);
    
            const response = await fetch(`${baseAPIUrl}/services/${serviceName}`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });
    
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("The requested service was not found. Please check the service name and try again.");
                } else if (response.status === 500) {
                    throw new Error("We’re currently experiencing server difficulties. Please try again in a few minutes.");
                } else {
                    throw new Error("An unexpected error occurred. Please try again shortly.");
                }
            }
    
            const data = await response.json();
            setService(data);
        } catch (error: any) {
            setError(error.message || "An error occurred while retrieving the data. Please refresh the page and try again.");
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, services, service, fetchServices, fetchServiceByName }
}