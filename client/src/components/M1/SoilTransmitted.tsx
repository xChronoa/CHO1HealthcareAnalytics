import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useIndicator } from "../../hooks/useIndicator";
import { ServiceProps } from "../../types/ServiceProps";
import { getInputValue, handleInputChange } from "../../utils/serviceUtils";

export const SoilTransmitted: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        indicatorLoading,
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    useEffectAfterMount(() => {
        fetchIndicatorsByServiceName("Soil Transmitted Helminthiasis Prevention and Control");
    }, []);

    return (
        <>
            <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
                <legend className="text-lg font-semibold">
                    Soil Transmitted Helminthiasis Prevention and Control
                </legend>
                <div className="flex flex-col gap-4">
                    {indicatorLoading ? (
                        <div>
                            Loading soil transmitted helminthiasis...
                        </div>
                    ) : error ? (
                        <div>
                            Error: {error}
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
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </fieldset>
        </>
    );
};
