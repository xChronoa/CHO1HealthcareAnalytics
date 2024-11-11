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
            <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
                <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">

                    Non-Communicable Disease Prevention and Control Services
                </legend>
                {error ? (
                    <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                        <h1 className="font-bold text-center text-red-500">
                            Error: {error}
                        </h1>
                    </div>
                ) : (
                    <>
                        {/* Header Row */}
                        <div className="items-center justify-center hidden grid-cols-1 gap-4 mb-2 text-center md:grid md:grid-cols-6 sm:gap-2">
                            <div className="font-semibold text-gray-700 border-b-2 border-black md:col-span-2">
                                Indicator
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                Male
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                Female
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                Total
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                Remarks
                            </div>
                        </div>
                        {indicators.map((indicator) => (
                            <div
                                key={indicator.indicator_id}
                                className="grid grid-cols-1 gap-4 md:grid-cols-6 sm:gap-2"
                            >
                                <label className="flex flex-col justify-center w-full text-gray-700 border-b-2 border-black md:col-span-2">
                                    {indicator.indicator_name}
                                </label>

                                {!categoryIndicatorIds.has(indicator.indicator_id) ? (
                                        <>
                                            <label className="block">
                                                <span className="text-gray-700 md:hidden">
                                                    Male
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "male",
                                                            "value"
                                                        ) ?? ""
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
                                                <span className="text-gray-700 md:hidden">
                                                    Female
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "female",
                                                            "value"
                                                        ) ?? ""
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
                                            <div className="hidden md:block"/>
                                            <label className="block">
                                                <span className="text-gray-700 md:hidden">
                                                    Remarks
                                                </span>
                                                <input
                                                    type="text"
                                                    min="0"
                                                    placeholder="Remarks"
                                                    className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
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
                                            <div className="hidden md:block"/>
                                            <div className="hidden md:block"/>
                                            <label className="block">
                                                <span className="text-gray-700 md:hidden">
                                                    Total
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
                                                    required
                                                    value={
                                                        getInputValue(
                                                            formData.servicedata,
                                                            indicator.service_id,
                                                            indicator.indicator_id,
                                                            undefined,
                                                            "total",
                                                            "value"
                                                        ) ?? ""
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
                                                <span className="text-gray-700 md:hidden">
                                                    Remarks
                                                </span>
                                                <input
                                                    type="text"
                                                    min="0"
                                                    placeholder="Remarks"
                                                    className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
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
                        ))}
                    </>
                )}
            </fieldset>
        </>
    );
};
