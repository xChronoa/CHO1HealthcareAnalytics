import React, { useState, useEffect } from "react";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";
import { ServiceProps } from "../../types/ServiceProps";
import { InputField } from "../InputField";
import { useServices } from "../../hooks/useServices";

export const TeenagePregnancy: React.FC<ServiceProps> = ({
    formData,
    updateServiceData,
}) => {
    const [serviceId, setServiceId] = useState<number>(0);

    const ageCategories = [
        "20 and above",
        "19",
        "18",
        "17",
        "16",
        "15",
        "14",
        "13",
        "12 and below",
    ];

    const {
        error,
        fetchServiceByName,
        service,
    } = useServices();

    // Fetch the service by name and extract the ID
    useEffect(() => {
        fetchServiceByName("Teenage Pregnancy");
    }, []);

    useEffect(() => {
        if (service) {
            setServiceId(service.service_id); // Set the service ID once it's fetched
        }
    }, [service]);

    return (
        <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
            <legend className="text-lg font-semibold">Teenage Pregnancy</legend>
            {error ? (
                <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="font-bold text-center text-red-500">
                        Error: {error}
                    </h1>
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    {/* Header Row */}
                    <div className="items-center justify-center hidden grid-cols-1 gap-4 mb-2 text-center lg:grid lg:grid-cols-9 sm:gap-2">
                        {ageCategories.map((category) => (
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                {category !== "20 and above" &&
                                    category !== "12 and below"
                                        ? category
                                        : category === "20 and above"
                                            ? "20↑"
                                            : "12↓"
                                }
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col w-full gap-6 lg:gap-4 inputs lg:flex-row">
                        {ageCategories.map((category) => (
                            <InputField
                                key={category}
                                labelText={
                                    category !== "20 and above" &&
                                    category !== "12 and below"
                                        ? category
                                        : category === "20 and above"
                                        ? "20↑"
                                        : "12↓"
                                }
                                type="number"
                                placeholder="0"
                                min="0"
                                style="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
                                required={true}
                                value={
                                    getInputValue(
                                        formData.servicedata,
                                        serviceId, // Use the fetched service ID
                                        undefined,
                                        category,
                                        undefined,
                                        "value"
                                    ) || ""
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        e,
                                        serviceId, // Use the fetched service ID
                                        undefined,
                                        category,
                                        undefined,
                                        "value",
                                        updateServiceData
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>
            )}
        </fieldset>
    );
};
