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
            <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
                <legend className="text-lg font-semibold">
                    B3. Postpartum and Newborn Care
                </legend>
                <div className="flex flex-col gap-4">
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
                                <div className="flex flex-col w-full gap-4 sm:flex-row sm:justify-evenly sm:w-3/4">
                                    <label className="block">
                                        <span className="text-gray-700">
                                            10 - 14 yo
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
                                        <span className="text-gray-700">
                                            15 - 19 yo
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
                                        <span className="text-gray-700">
                                            20 - 49 yo
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
                                        <span className="text-gray-700">
                                            Remarks
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Remarks"
                                            min="0"
                                            className="block w-full p-2 mt-1 border rounded-md sm:w-24"
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
                            </div>
                        ))
                    )}
                </div>
            </fieldset>
        </>
    );
};
