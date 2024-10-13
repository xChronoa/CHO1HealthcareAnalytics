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

            if(!response.ok) {
                throw new Error("An error occured while fetching the services.");
            }

            const data = await response.json();

            setServices(data);
        } catch (error: any) {
            setError(error);
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

            if(!response.ok) {
                throw new Error("An error occured while fetching the services.");
            }

            const data = await response.json();
            setService(data);
        } catch (error: any) {
            setError(error);
        } finally {
            decrementLoading();
        }
    }, []);

    return { error, services, service, fetchServices, fetchServiceByName }
}