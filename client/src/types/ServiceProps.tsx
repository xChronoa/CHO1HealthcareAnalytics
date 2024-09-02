import { ServiceData } from "./M1FormData";

export interface ServiceProps {
    formData: { servicedata: ServiceData[] };
    updateServiceData: (
        serviceId: number,
        indicatorId: number | undefined,
        ageCategory: string | undefined,
        valueType: string | undefined, // Make this parameter optional
        field: keyof ServiceData,
        value: any
    ) => void;
}
