import { useEffect } from "react";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const SoilTransmitted: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    useEffect(() => {
        fetchIndicatorsByServiceName("Soil Transmitted Helminthiasis Prevention and Control");
    }, []);

    return (
        <>
            <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
                <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">

                    Soil Transmitted Helminthiasis Prevention and Control
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
                        <div className="items-center justify-center hidden grid-cols-1 gap-4 mb-2 text-center md:grid md:grid-cols-4 sm:gap-2">
                            <div className="font-semibold text-gray-700 border-b-2 border-black md:col-span-2">
                                Indicator
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
                                className="grid grid-cols-1 gap-4 md:grid-cols-4 sm:gap-2"
                            >
                                <label className="flex flex-col justify-center w-full text-gray-700 border-b-2 border-black md:col-span-2">
                                    {indicator.indicator_name}
                                </label>
                                <label className="block md:required-label-before">
                                    <span className="text-gray-500 required-label-after md:hidden">
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
                                <label className="block md:empty-before">
                                    <span className="text-gray-500 md:hidden">
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
                            </div>
                        ))}
                    </>
                )}
            </fieldset>
        </>
    );
};
