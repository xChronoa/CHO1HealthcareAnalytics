import { useEffect } from "react";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const PostpartumCare: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    useEffect(() => {
        fetchIndicatorsByServiceName("B3. Postpartum and Newborn Care");
    }, []);

    return (
        <>
            <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
                <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">

                    B3. Postpartum and Newborn Care
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
                                10 - 14 yo
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                15 - 19 yo
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black text-nowrap">
                                20 - 49 yo
                            </div>
                            <div className="font-semibold text-gray-700 border-b-2 border-black">
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
                                                "10-14",
                                                undefined,
                                                "value"
                                            ) || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                indicator.service_id,
                                                indicator.indicator_id,
                                                "10-14",
                                                undefined,
                                                "value",
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
                                                "15-19",
                                                undefined,
                                                "value"
                                            ) || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                indicator.service_id,
                                                indicator.indicator_id,
                                                "15-19",
                                                undefined,
                                                "value",
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
                                                "20-49",
                                                undefined,
                                                "value"
                                            ) || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                indicator.service_id,
                                                indicator.indicator_id,
                                                "20-49",
                                                undefined,
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
                                        min="0"
                                        className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
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
                            </div>
                        ))}
                    </>
                )}
            </fieldset>
        </>
    );
};
