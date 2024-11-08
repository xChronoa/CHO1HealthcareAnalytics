import React, { useEffect } from 'react';
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
    useEffect(() => {
        fetchIndicatorsByServiceName("B1. Prenatal Care");
    }, []);

    const parentIndicatorId = parentIndicator
        ? parentIndicator.indicator_id
        : null;

    return (
        <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
            <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">

                B1. Prenatal Care
            </legend>
            <div className="flex flex-col gap-8 text-sm">
                {error ? (
                    <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                        <h1 className="font-bold text-center text-red-500">
                            Error: {error}
                        </h1>
                    </div>
                ) : (
                    <>
                        {/* Header Row for Indicators */}
                        <div className="hidden w-full md:grid md:grid-cols-4 md:gap-4">
                            <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                                Indicator
                            </span>
                            <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                                10-14
                            </span>
                            <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                                15-19
                            </span>
                            <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                                20-49
                            </span>
                        </div>
                        {indicators.map((indicator) => {
                            // Determine if the current indicator should be indented
                            if (indicator.indicator_id === parentIndicatorId) {
                                return (
                                    <label
                                        key={indicator.indicator_id}
                                        className={`flex flex-col justify-center font-semibold text-gray-700 w-full mt-4`}
                                    >
                                        {indicator.indicator_name}
                                    </label>
                                );
                            }

                            const isIndented =
                                indicator.parent_indicator_id === parentIndicatorId;

                            return (
                                <div
                                    key={indicator.indicator_id}
                                    className={`grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center ${
                                        isIndented ? "md:indent-8" : ""
                                    }`}
                                >
                                    <label className="flex items-center justify-start w-full text-gray-700 border-b-2 border-black">
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
                            );
                        })}
                    </>
                )}
            </div>
        </fieldset>
    );
};
