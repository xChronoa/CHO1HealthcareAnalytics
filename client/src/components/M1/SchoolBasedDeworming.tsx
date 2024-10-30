import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const SchoolBasedDeworming: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    const headCategories = [
        "1-19 y/o given 2 doses of deworming drug"
    ];

    // Extract the ID if the indicator is found
    useEffectAfterMount(() => {
        fetchIndicatorsByServiceName(
            "School-Based Deworming Services (Annual Reporting)"
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
        <>
            <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-9/12">
                <legend className="text-lg font-semibold">
                    School-Based Deworming Services (Annual Reporting)
                </legend>
                <div className="flex flex-col gap-4">
                    {error ? (
                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                            <h1 className="font-bold text-center text-red-500">
                                Error: {error}
                            </h1>
                        </div>
                    ) : (
                        indicators.map((indicator) => {
                            if (
                                categoryIndicatorIds.has(indicator.indicator_id)
                            ) {
                                return (
                                    <label
                                        key={indicator.indicator_id}
                                        className={`flex flex-col justify-center font-semibold text-gray-700 w-full`}
                                    >
                                        {indicator.indicator_name}
                                    </label>
                                );
                            }

                            return (
                                <div
                                    key={indicator.indicator_id}
                                    className="flex flex-col gap-4 sm:flex-row"
                                >
                                    <label
                                        className={`flex flex-col justify-center text-gray-700 w-full sm:w-1/2 ${
                                            indicator.parent_indicator_id
                                                ? "indent-8"
                                                : ""
                                        }`}
                                    >
                                        {indicator.indicator_name}
                                    </label>
                                    <div className="flex flex-col w-full gap-4 sm:flex-row sm:justify-evenly sm:w-3/4">
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
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </fieldset>
        </>
    );
};
