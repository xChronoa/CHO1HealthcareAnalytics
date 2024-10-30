import React from 'react';
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useIndicator } from "../../hooks/useIndicator";
import { getInputValue, handleInputChange } from '../../utils/serviceUtils';
import { ServiceProps } from '../../types/ServiceProps';

export const PrenatalCare: React.FC<ServiceProps> = ({
    formData,
    updateServiceData
}) => {
    const {
        error,
        indicators,
        fetchIndicatorsByServiceName,
    } = useIndicator();

    // Find the indicator by name
    const parentIndicator = indicators.find(
        (indicator) =>
            indicator.indicator_name ===
            "2. No. of pregnant women assessed of nutritional status during the 1st tri"
    );

    // Extract the ID if the indicator is found
    useEffectAfterMount(() => {
        fetchIndicatorsByServiceName("B1. Prenatal Care");
    }, []);

    const parentIndicatorId = parentIndicator
        ? parentIndicator.indicator_id
        : null;

    return (
        <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
            <legend className="text-lg font-semibold">
                B1. Prenatal Care
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
                        // Determine if the current indicator should be indented
                        if (indicator.indicator_id === parentIndicatorId) {
                            return (
                                <label
                                    key={indicator.indicator_id}
                                    className={`flex flex-col justify-center font-semibold text-gray-700 w-full`}
                                >
                                    {indicator.indicator_name}
                                </label>
                            );
                        }

                        const isIndented =
                            indicator.parent_indicator_id ===
                            parentIndicatorId;

                        return (
                            <div
                                key={indicator.indicator_id}
                                className="flex flex-col gap-4 sm:flex-row"
                            >
                                <label
                                    className={`flex flex-col justify-center text-gray-700 w-full sm:w-1/2 border-black border-b-2 ${
                                        isIndented ? "indent-8" : ""
                                    }`}
                                >
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
                                                    '10-14',
                                                    undefined,
                                                    'value'
                                                ) || ""
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
                                                    '15-19',
                                                    undefined,
                                                    'value'
                                                ) || ""
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
                                                    '20-49',
                                                    undefined,
                                                    'value'
                                                ) || ""
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
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </fieldset>
    );
};
