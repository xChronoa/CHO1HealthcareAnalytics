import { useEffect } from "react";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const NonCommunicableDisease: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    useEffect(() => {
        fetchIndicatorsByServiceName("Non-Communicable Disease Prevention and Control Services");
    }, []);

    const totalOnly = [
        "5. No. of adult women screened for Cervical Cancer using VIA/Pap Smear",
        "6. No. of adult women found positive/suspect Cervical Cancer using VIA/Pap Smear",
        "7. No. of adult women screened for breast mass",
        "8. No. of adult women with suspicious breast mass",
    ]

    // Create an array of objects with indicator_id and indicator_name for headCategories
    const categoryIndicators = totalOnly
        .map((categoryName) => {
            const matchedIndicator = indicators.find(
                (indicator) => indicator.indicator_name === categoryName
            );
            return matchedIndicator
                ? {
                      id: matchedIndicator.indicator_id,
                      name: matchedIndicator.indicator_name,
                  }
                : null;
        })
        .filter((item): item is { id: number; name: string } => item !== null); // Filter out null values

    const categoryIndicatorIds = new Set(
        categoryIndicators.map((indicator) => indicator.id)
    );

    return (
        <>
            <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
                <legend className="text-lg font-semibold">
                    Non-Communicable Disease Prevention and Control Services
                </legend>
                <div className="flex flex-col gap-12">
                    {error ? (
                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                            <h1 className="font-bold text-center text-red-500">
                                Error: {error}
                            </h1>
                        </div>
                    ) : (
                        indicators.map((indicator) => (
                            <div
                                key={indicator.indicator_id}
                                className="flex flex-col gap-4 sm:flex-row"
                            >
                                <label className="flex flex-col justify-center w-full text-gray-700 border-b-2 border-black sm:w-1/2">
                                    {indicator.indicator_name}
                                </label>
                                <div className="flex flex-col w-full sm:flex-row sm:justify-evenly sm:w-3/4 gap-">
                                    {!categoryIndicatorIds.has(indicator.indicator_id) ? (
                                        <>
                                            <label className="block">
                                                <span className="text-gray-700">
                                                    Male
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "male",
                                                            "value"
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "male",
                                                            "value",
                                                            updateServiceData
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-gray-700">
                                                    Female
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "female",
                                                            "value"
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "female",
                                                            "value",
                                                            updateServiceData
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-gray-700">
                                                    Remarks
                                                </span>
                                                <input
                                                    type="text"
                                                    min="0"
                                                    placeholder="Remarks"
                                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "male",
                                                            "remarks"
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "male",
                                                            "remarks",
                                                            updateServiceData
                                                        )
                                                    }
                                                />
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <label className="hidden sm:block">
                                                <span className="invisible pointer-events-none"></span>
                                                <input
                                                    type="text"
                                                    min="0"
                                                    className="invisible hidden w-full mt-1 pointer-events-none sm:block sm:w-24"
                                                    disabled
                                                    readOnly
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-gray-700">
                                                    Total
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "total",
                                                            "value"
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "total",
                                                            "value",
                                                            updateServiceData
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-gray-700">
                                                    Remarks
                                                </span>
                                                <input
                                                    type="text"
                                                    min="0"
                                                    placeholder="Remarks"
                                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "total",
                                                            "remarks"
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "total",
                                                            "remarks",
                                                            updateServiceData
                                                        )
                                                    }
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </fieldset>
        </>
    );
};
