import { ServiceData } from "../types/M1FormData";

export const getInputValue = (
    servicedata: ServiceData[],
    serviceId: number,
    indicatorId: number | undefined,
    ageCategory: string | undefined,
    valueType: string | undefined,
    fieldKey: keyof ServiceData
): string | number => {
    if (ageCategory === undefined) {
        const entry = servicedata.find(
            (entry) =>
                entry.service_id === serviceId &&
                entry.indicator_id === indicatorId &&
                entry.value_type === valueType
        );

        return entry ? entry[fieldKey] || 0 : 0;
    } else {
        const entry = servicedata.find(
            (entry) =>
                entry.service_id === serviceId &&
                entry.indicator_id === indicatorId &&
                entry.age_category === ageCategory
        );
        return entry ? entry[fieldKey] || 0 : 0;
    }
};

export const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceId: number,
    indicatorId: number | undefined,
    ageCategory: string | undefined,
    valueType: string | undefined,
    fieldKey: keyof ServiceData,
    updateServiceData: (
        serviceId: number,
        indicatorId: number | undefined,
        ageCategory: string | undefined,
        valueType: string | undefined,
        fieldKey: keyof ServiceData,
        value: any
    ) => void
) => {
    const { value } = e.target;
    const parsedValue =
        fieldKey === "remarks"
            ? value // Keep the value as-is for remarks
            : value === ""
            ? undefined // Handle empty string case
            : value; // Convert to number if not empty

    // If the fieldKey is "remarks", repeat for each valueType
    if (fieldKey === "remarks") {
        if (ageCategory === undefined) {
            let valueTypes: string[] = [];

            if (valueType === "male" || valueType === "female") {
                valueTypes = ["male", "female"];
            } else {
                valueTypes = ["total"];
            }

            valueTypes.forEach((type) => {
                updateServiceData(
                    serviceId,
                    indicatorId,
                    ageCategory,
                    type,
                    fieldKey,
                    parsedValue
                );
            });
        } else {
            const ageCategories = ["10-14", "15-19", "20-49"];
            ageCategories.forEach((category) => {
                updateServiceData(
                    serviceId,
                    indicatorId,
                    category,
                    valueType,
                    fieldKey,
                    parsedValue
                );
            });
        }
    } else {
        // Otherwise, just update for the specific valueType
        updateServiceData(
            serviceId,
            indicatorId,
            ageCategory,
            valueType,
            fieldKey,
            parsedValue
        );
    }
};

export default { getInputValue, handleInputChange };
