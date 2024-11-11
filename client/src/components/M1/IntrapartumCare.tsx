import { useEffect } from "react";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const IntrapartumCare: React.FC<ServiceProps> = ({
    formData,
    updateServiceData,
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    const headCategories = [
        "19. No. of Livebirths",
        "20. Number of deliveries attended by Skilled Health Professional",
        "21. Number of facility-based deliveries",
        "23. Type of Delivery",
        "24. Pregnancy Outcome",
    ];

    // Extract the ID if the indicator is found
    useEffect(() => {
        fetchIndicatorsByServiceName(
            "B2. Intrapartum Care and Delivery Outcome"
        );
    }, []);

    if (!indicators) return;

    // Create an array of objects with indicator_id and indicator_name for headCategories
    const categoryIndicators = headCategories
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
        <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
            <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">
                B2. Intrapartum Care and Delivery Outcome
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
                    <div className="items-center justify-center hidden grid-cols-1 gap-4 mb-2 text-center md:grid md:grid-cols-7 sm:gap-2">
                        <div className="font-semibold text-gray-700 border-b-2 border-black md:col-span-2">
                            Indicator
                        </div>
                        <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                            10 - 14 yo
                        </div>
                        <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                            15 - 19 yo
                        </div>
                        <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                            20 - 49 yo
                        </div>
                        <div className="font-semibold text-gray-700 border-b-2 border-black">
                            Total
                        </div>
                        <div className="font-semibold text-gray-700 border-b-2 border-black">
                            Remarks
                        </div>
                    </div>

                    {/* Indicator Rows */}
                    {indicators.map((indicator) => {
                        if (
                            categoryIndicatorIds.has(
                                indicator.indicator_id
                            ) &&
                            indicator.indicator_name !==
                                "19. No. of Livebirths"
                        ) {
                            return (
                                <label
                                    key={indicator.indicator_id}
                                    className={`flex flex-col justify-center font-semibold text-gray-700 w-full col-span-2`}
                                >
                                    {indicator.indicator_name}
                                </label>
                            );
                        }

                        return (
                            <div
                                key={indicator.indicator_id}
                                className="grid grid-cols-1 gap-4 md:grid-cols-7 sm:gap-2"
                            >
                                <label
                                    className={`flex flex-col justify-center text-gray-700 w-full md:col-span-2 border-b-2 border-black ${
                                        indicator.parent_indicator_id
                                            ? "md:indent-8"
                                            : ""
                                    }`}
                                >
                                    {indicator.indicator_name}
                                </label>
                                {!indicator.parent_indicator_id || indicator.parent_indicator_id === 34 || indicator.parent_indicator_id === 37 ? (
                                    <>
                                        <label className="block">
                                            <span className="text-gray-700 md:hidden">
                                                10 - 14 yo
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
                                                        '10-14',
                                                        undefined,
                                                        'value'
                                                    ) ?? ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        indicator.service_id,
                                                        indicator.indicator_id,
                                                        '10-14',
                                                        undefined,
                                                        'value',
                                                        updateServiceData
                                                    )
                                                }
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 md:hidden">
                                                15 - 19 yo
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
                                                        '15-19',
                                                        undefined,
                                                        'value'
                                                    ) ?? ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        indicator.service_id,
                                                        indicator.indicator_id,
                                                        '15-19',
                                                        undefined,
                                                        'value',
                                                        updateServiceData
                                                    )
                                                }
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 md:hidden">
                                                20 - 49 yo
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
                                                        '20-49',
                                                        undefined,
                                                        'value'
                                                    ) ?? ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        indicator.service_id,
                                                        indicator.indicator_id,
                                                        '20-49',
                                                        undefined,
                                                        'value',
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
                                                placeholder="Remarks"
                                                className="w-full p-2 border rounded-md shadow-md shadow-[#a3a19d]"
                                                value={
                                                    getInputValue(
                                                        formData.servicedata,
                                                        indicator.service_id,
                                                        indicator.indicator_id,
                                                        "10-14",
                                                        undefined,
                                                        "remarks"
                                                    ) || ""
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        indicator.service_id,
                                                        indicator.indicator_id,
                                                        "10-14",
                                                        undefined,
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
                                        <div className="hidden md:block"/>
                                        <label className="block">
                                            <span className="text-gray-700 md:hidden">
                                                Total
                                            </span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                className="w-full p-2 border rounded-md shadow-md shadow-[#a3a19d]"
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
                                                placeholder="Remarks"
                                                className="w-full p-2 border rounded-md shadow-md shadow-[#a3a19d]"
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
                        );
                    })}
                </>
            )}
        </fieldset>
    );
};
