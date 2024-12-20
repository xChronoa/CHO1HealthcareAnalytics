import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement,
    ChartOptions,
} from "chart.js";
import { baseAPIUrl } from "../../../config/apiConfig";
import FamilyPlanningChart from "./FamilyPlanningChart";
import ModernWRAChart from "./ModernWRAChart";
import { useLoading } from "../../../context/LoadingContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import { useSidebarContext } from "../../../context/SidebarContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

interface ServiceData {
    service_data_id: number;
    service_id: number;
    indicator_name: string | null;
    age_category: string | null;
    barangay_name: string;
    report_period: string;
    value_type: string;
    value: number;
    remarks: string | null;
    service_name: string;
}

interface ServiceDataChartProps {
    setIsButtonDisabled: (value: boolean) => void;
    chartRef: React.RefObject<HTMLDivElement>;
    textRef: React.RefObject<HTMLHeadingElement>;
    barangay: string;
    year: String | null;
}

const ServiceDataChart: React.FC<ServiceDataChartProps> = ({
    setIsButtonDisabled,
    chartRef,
    textRef,
    barangay,
    year,
}) => {
    const [serviceData, setServiceData] = useState<ServiceData[]>([]);
    const [selectedService, setSelectedService] = useState<string>("Modern FP Unmet Need");
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);
    
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: string]: boolean }>({});

    const capitalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    useEffect(() => {
        const fetchServices = async () => {
            try {
                incrementLoading();
                const response = await fetch(`${baseAPIUrl}/services`, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unable to retrieve available services. Please try again later.");
                }
    
                const result = await response.json();
                if (Array.isArray(result)) {
                    setServices(result.map((service: any) => service.service_name));
                } else {
                    throw new TypeError("Unexpected data format. Unable to load services.");
                }
            } catch (error: any) {
                setError(error.message || "An error occurred while loading services.");
            } finally {
                decrementLoading();
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!selectedService) return;

            if (selectedService === "Modern FP Unmet Need" || selectedService === "Family Planning") return;

            try {
                incrementLoading();
                const response = await fetch(
                    `${baseAPIUrl}/service-data-reports/${encodeURIComponent(encodeURIComponent(selectedService))}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ selectedService, barangay_name: barangay, year: Number(year) })
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to retrieve data for the selected service. Please try again later.");
                }
    
                const result = await response.json();
                if (Array.isArray(result.data)) {
                    setServiceData(result.data);
                } else {
                    throw new TypeError("Unexpected data format. Unable to load service data.");
                }
            } catch (error: any) {
                setError(error.message || "An error occurred while loading service data.");
            } finally {
                decrementLoading();
            }
        };

        fetchServiceData();
    }, [selectedService, barangay, year]);

    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedService(event.target.value);
    };

    const filteredData = selectedService
        ? serviceData.filter((data) => data.service_name === selectedService)
        : serviceData;

    const labels = Array.from(
        new Set(filteredData.map((data) => data.report_period))
    );

    const indicatorColors = useMemo(() => {
        // Initialize disease color map once
        const colors: { [indicator_name: string]: string } = {};
        serviceData.forEach((entry) => {
            const indicatorKey = entry.indicator_name || "Unknown Indicator"; // Fallback to default key
            if (!colors[indicatorKey]) {
                colors[indicatorKey] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            }
        });
        return colors;
    }, [serviceData]);

    const aggregateDataByIndicator = (ageCategory: string | null, valueType: string | null) => {
        const indicators = Array.from(
            new Set(filteredData.map((data) => data.indicator_name))
        );
    
        return indicators.map((indicator) => {
            // Filter data correctly based on either ageCategory or valueType
            const dataForIndicator = filteredData.filter((data) => {
                if (ageCategory && !valueType) {
                    return data.indicator_name === indicator && data.age_category === ageCategory;
                } else if (!ageCategory && valueType) {
                    return data.indicator_name === indicator && data.value_type === valueType;
                }
                return false;
            });
    
            // Skip rendering if no data matches the condition
            if (!dataForIndicator.length) return null;
    
            return {
                label: indicator || "Unknown Indicator",
                data: labels.map((label) =>
                    dataForIndicator.reduce(
                        (total, data) =>
                            data.report_period === label ? total + data.value : total,
                        0
                    )
                ),
                fill: false,
                borderColor: indicatorColors[indicator || "Unknown Indicator"],
                backgroundColor: indicatorColors[indicator || "Unknown Indicator"],
                tension: 0.1,
            };
        }).filter(dataset => dataset !== null);  // Filter out null datasets
    };

    const toggleSize = (chartId: string) => {
        setMaximizedCharts((prevState: { [key: string]: boolean }) => ({
            ...prevState,
            [chartId]: !prevState[chartId],
        }));
    };

    // This should be outside of any condition
    const ageCategories = Array.from(
        new Set(filteredData.map((data) => data.age_category))
    ).filter((category) => category !== null);

    // Create a color map for age categories
    const ageCategoryColors = useMemo(() => {
        const colors: { [key: string]: string } = {};
        ageCategories.forEach((ageCategory) => {
            if (ageCategory) {
                colors[ageCategory] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            }
        });
        return colors;
    }, [serviceData]);

    const aggregateDataByCurrentOption = (ageCategory: string | null, valueType: string | null, currentSelectedOption: string) => {
        // Extract unique indicators from the filtered data
        const indicators = Array.from(
            new Set(filteredData.map((data) => data.indicator_name))
        );
    
        // Map through each indicator to create datasets
        return indicators.map((indicator) => {
            // Filter data based on the provided conditions
            const dataForIndicator = filteredData.filter((data) => {
                const matchesIndicator = data.indicator_name === indicator;
    
                // Determine if the filter conditions are met
                const matchesAgeCategory = ageCategory ? data.age_category === ageCategory : true;
                const matchesValueType = valueType ? data.value_type === valueType : true;
    
                return matchesIndicator && matchesAgeCategory && matchesValueType;
            });
    
            // If there's no data for this indicator, return null
            if (!dataForIndicator.length) return null;
    
            // Check if the current indicator matches the selected option
            const isSelected = currentSelectedOption === "All" || indicator === currentSelectedOption || currentSelectedOption === "Customized";
            if (!isSelected) return null;
    
            const visibilityKey = ageCategory || valueType || "Unknown Category"; // Default to "Unknown Category" if neither is provided

            // Create the dataset
            const dataset = {
                label: indicator || "Unknown Indicator",
                data: labels.map((label) =>
                    dataForIndicator.reduce(
                        (total, data) =>
                            data.report_period === label ? total + data.value : total,
                        0
                    )
                ),
                fill: false,
                borderColor: indicatorColors[indicator || "Unknown Indicator"],
                backgroundColor: indicatorColors[indicator || "Unknown Indicator"],
                tension: 0.1,
                hidden: currentSelectedOption === "Customized" ? visibilityState[visibilityKey]?.[indicator || "Unknown Indicator"] !== false : false,
            };

            return dataset;
        }).filter(dataset => dataset !== null); // Filter out null datasets
    };

    const legendColorStyle = (backgroundColor: string) => ({
        backgroundColor: backgroundColor,
        minWidth: '1rem', // Ensures it has a minimum width
        minHeight: '1rem', // Ensures it has a minimum height
        maxWidth: '1rem', // Prevents squishing larger than intended
        maxHeight: '1rem', // Prevents squishing larger than intended
    })

    // Define initial state with dynamic first key
    const [visibilityState, setVisibilityState] = useState<{ [category: string]: { [key: string]: boolean } }>({});

    // Handler for checkbox change - dynamically handles any category and key visibility
    const handleCheckboxChange = (category: string, key: string) => {
        setVisibilityState((prevState) => {
            // If the category doesn't exist, initialize it with an empty object
            const categoryVisibility = prevState[category] || {};

            return {
                ...prevState,
                [category]: {
                    ...categoryVisibility,
                    // Toggle the visibility of the key or set it to true if undefined
                    [key]: categoryVisibility[key] !== undefined ? !categoryVisibility[key] : false,
                },
            };
        });
    };

    const toggleAllCheckboxes = (fullDatasets: any[], valueType?: string, ageCategory?: string) => {
        const newVisibilityState: { [key: string]: { [key: string]: boolean } } = {};
    
        // Determine the firstKey to use: either valueType, ageCategory, or fallback to dataset.label
        const firstKey = valueType || ageCategory || fullDatasets.map(dataset => dataset.label);
    
        // Iterate over the selected firstKey (singular value or dataset label)
        if (Array.isArray(firstKey)) {
            firstKey.forEach(key => {
                newVisibilityState[key] = {};
    
                fullDatasets.forEach(dataset => {
                    newVisibilityState[key][dataset.label] = areAllChecked(fullDatasets, key);
                });
            });
        } else {
            // If firstKey is a singular value (not an array)
            newVisibilityState[firstKey] = {};
    
            fullDatasets.forEach(dataset => {
                newVisibilityState[firstKey][dataset.label] = areAllChecked(fullDatasets, firstKey);
            });
        }
    
        // Merge newVisibilityState with the previous state to retain existing values
        setVisibilityState(prevState => ({
            ...prevState,
            ...newVisibilityState
        }));
    };
    
    const areAllChecked = (fullDatasets: any[], firstKey?: string) => {
        return fullDatasets.every(dataset => {
            // Check visibility for the specific key (valueType or ageCategory) or fallback to dataset.label
            const key = firstKey || dataset.label;
            return visibilityState[key]?.[dataset.label] === false;
        });
    };

    const renderCharts = () => {
        const hasAgeCategory = filteredData.some((data) => data.age_category);
        const hasValueType = filteredData.some((data) => data.value_type);

        if (selectedService === "Teenage Pregnancy") {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
            
            // Generate full datasets for dropdown options
            const fullDatasets = ageCategories.map((ageCategory) => {
                const validAgeCategory = ageCategory || "Unknown Age Category";

                return {
                    label: validAgeCategory,
                    data: filteredData
                        .filter((data) => data.age_category === validAgeCategory)
                        .map((data) => data.value),
                    borderColor: ageCategoryColors[validAgeCategory] || "#000000",
                    backgroundColor: ageCategoryColors[validAgeCategory] || "#000000",
                };
            });

            // Ensure selectedOptions is initialized properly
            const currentOption = selectedOptions["Teenage Pregnancy"] || "All"; // Default to "All" if not defined

            // Filtered datasets for display based on selected option
            const datasets = fullDatasets.filter((dataset) => {
                // Include the dataset if "All" is selected, or it matches the selected option, or if "Customized" is selected
                return currentOption === "All" ||
                    dataset.label === currentOption ||
                    currentOption === "Customized";
            }).map((dataset) => {
                // Adjusted label for display
                const adjustedLabel = dataset.label === "12 and below" 
                                        ? "12 years old and below" 
                                        : dataset.label === "20 and above" 
                                            ? "20 years old and above" 
                                            : `${dataset.label} years old`;

                // Data generation based on the selected option
                const data = currentOption === "Customized"
                    ? filteredData
                        .filter((data) => data.age_category === dataset.label) // Use dataset.label for filtering
                        .map((data) => data.value)
                    : filteredData
                        .filter((data) => data.age_category === dataset.label) // Default logic for non-customized
                        .map((data) => data.value);

                // Return the dataset structure, adding the hidden property only for "Customized"
                return {
                    label: adjustedLabel,
                    data: data,
                    borderColor: dataset.borderColor,
                    backgroundColor: dataset.backgroundColor,
                    hidden: currentOption === "Customized" && visibilityState[dataset.label]?.[dataset.label] !== false, // Hide the dataset when customized and visibilityState is false
                };
            });

            const chartId = "teenage-pregnancy"; // Assign a unique id for this chart
            const isMaximized = maximizedCharts[chartId];

            return (
                <div 
                    className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg sm:flex-row transition-all w-full shadow-md shadow-[#a3a19d] 
                        ${currentOption === "All" || currentOption === "Customized" ? "sm:w-full" : isMaximized ? "sm:w-full" : "sm:w-9/12"}`}
                >
                    {/* Resize Icon */}
                    {currentOption !== "All" && currentOption !== "Customized" && (
                        <FontAwesomeIcon
                            icon={isMaximized ? faMinimize : faMaximize}
                            className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon lg:block"
                            onClick={() => toggleSize(chartId)}
                        />
                    )}

                    {/* Chart */}
                    <div className={`flex-1 sm:w-2/3`}>
                        {/* Chart Title & Dropdown Option */}
                        <div className={`title-menu flex flex-row items-center justify-between gap-4 px-4 mb-8 ${selectedOptions["Teenage Pregnancy"] !== "All" ? "lg:mr-8" : ""}`}>
                            <h3 className="mb-2 font-medium text-center">Teenage Pregnancy</h3>
                            <select 
                                value={selectedOptions["Teenage Pregnancy"]} 
                                onChange={(e) => setSelectedOptions(prevOptions => ({
                                    ...prevOptions,
                                    "Teenage Pregnancy": e.target.value,
                                }))} 
                                className="px-2 py-2 text-[9.5px] lg:text-xs font-bold text-black border border-black rounded-lg w-full sm:w-fit bg-white shadow-md shadow-[#a3a19d]"
                            >
                                <option value="All" className="font-extrabold uppercase">ALL</option>
                                <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                {fullDatasets.map(({ label }, index) => (
                                    <option key={index} value={label}>
                                        {label === "12 and below" ? "12 years old and below"
                                            : label === "20 and above" ? "20 years old and above" : `${label} years old`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Line
                            data={{
                                labels,
                                datasets,
                            }}
                            options={{...options,
                                plugins: {
                                    ...options.plugins,
                                    legend: {
                                        display: currentOption !== "All" && currentOption !== "Customized", // Hide legend if "All" is selected
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Legend */}
                    {currentOption === "All" ? (
                        <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden border-r h-full xl:max-w-xs">
                            <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                            {/* Parent */}
                            <div className="flex flex-col-reverse w-full p-2 overflow-y-auto bg-gray-200 h-fit legend-list max-h-fit">
                                {/* Child */}
                                {fullDatasets.map((dataset, index) => (
                                    <div key={index} className="flex items-center justify-center w-full h-auto mb-2">
                                        <div className="flex items-center justify-start gap-2 w-52">
                                            <span className="w-12 h-4 rounded-sm shrink-0" style={{backgroundColor: dataset.backgroundColor}}></span>
                                            <span className="text-sm whitespace-nowrap">
                                                {dataset.label === "12 and below"
                                                    ? "12 years old and below"
                                                    : dataset.label === "20 and above"
                                                        ? "20 years old and below"
                                                        : `${dataset.label} years old`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : currentOption === "Customized" && (
                        <div className="h-full rounded-lg legend-container shadow-md shadow-[#a3a19d]">
                            <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                            <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 border-r rounded-b-lg legend-list">
                                {/* Check All/Uncheck All Checkbox */}
                                <div
                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                    onClick={() => toggleAllCheckboxes(fullDatasets)} // Pass fullDatasets to toggleAllCheckboxes
                                >
                                    <input
                                        type="checkbox"
                                        checked={areAllChecked(fullDatasets)} // Check if all datasets are selected
                                        className="cursor-pointer form-checkbox"
                                        onChange={() => toggleAllCheckboxes(fullDatasets)} // Toggle all based on fullDatasets
                                    />
                                    <span className="text-xs sm:text-sm text-nowrap">
                                        Check All / Uncheck All
                                    </span>
                                </div>

                                {/* Individually Checkbox */}
                                {fullDatasets.reverse().map((dataset, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none print:px-0 print:py-0 hover:bg-blue-500 hover:text-white"
                                        onClick={() => handleCheckboxChange(dataset.label, dataset.label)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={visibilityState[dataset.label]?.[dataset.label] === false}
                                            className="cursor-pointer form-checkbox"
                                            readOnly
                                        />
                                        <span className="w-12 h-4 rounded-sm shrink-0" style={{backgroundColor: dataset.backgroundColor}}></span>
                                        <span className="text-sm whitespace-nowrap">
                                            {dataset.label === "12 and below"
                                                ? "12 years old and below"
                                                : dataset.label === "20 and above"
                                                    ? "20 years old and below"
                                                    : `${dataset.label} years old`
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const renderedCategories = new Set();
        const renderedValueTypes = new Set();

        if (hasAgeCategory && hasValueType) {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );

            const validAgeCategories = ageCategories.filter((ageCategory): ageCategory is string => ageCategory !== null);

            return (
                <>
                    {validAgeCategories.map((ageCategory) => {
                        
                        if (renderedCategories.has(ageCategory)) return null;

                        const dataExistsForCategory = filteredData.some(
                            (data) => data.age_category === ageCategory && !data.value_type
                        );
                        if (!dataExistsForCategory) return null;

                        renderedCategories.add(ageCategory);
                        const chartId = `age-${ageCategory}`;
                        const isMaximized = maximizedCharts[chartId];

                        // Set default selected option for the current age category if it doesn't exist
                        const currentSelectedOption = selectedOptions[ageCategory] ?? "All"; // Use nullish coalescing operator

                        return (
                            <div key={ageCategory} 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                                ${currentSelectedOption === "All" || currentSelectedOption === "Customized" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {currentSelectedOption !== "All" && currentSelectedOption !== "Customized" && (
                                    <FontAwesomeIcon
                                        icon={isMaximized ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon xl:block"
                                        onClick={() => toggleSize(chartId)}
                                    />
                                )}
                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`title-menu flex flex-row flex-wrap items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "lg:mr-8" : ""}`}>
                                        <h3 className="flex-1 mb-2 font-semibold text-center sm:flex-none">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                        <select 
                                            value={currentSelectedOption} 
                                            onChange={(e) => setSelectedOptions({
                                                ...selectedOptions,
                                                [ageCategory]: e.target.value,
                                            })} 
                                            className="px-2 py-2 text-[9.5px] lg:text-xs font-bold text-black rounded-lg w-full sm:w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All" className="font-extrabold uppercase">ALL</option>
                                            <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                            {aggregateDataByIndicator(ageCategory, null).map(({ label }, index) => (
                                                <option key={index} value={label}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Line
                                        data={{
                                            labels,
                                            datasets: aggregateDataByCurrentOption(ageCategory, null, currentSelectedOption),
                                        }}
                                        options={{
                                            ...options,
                                            plugins: {
                                                ...options.plugins,
                                                legend: {
                                                    display: currentSelectedOption !== "All" && currentSelectedOption !== "Customized", // Hide legend if "All" is selected
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Legend */}
                                {currentSelectedOption === "All" ? (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "pb-12" : null}`}>
                                            {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                                    <span className="text-xs text-nowrap">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : currentSelectedOption === "Customized" && (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
            
                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "pb-12" : null}`}>
                                            {/* Check All/Uncheck All Checkbox */}
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                onClick={() => toggleAllCheckboxes(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Pass valueType to toggleAllCheckboxes
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={areAllChecked(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Check if all datasets are selected
                                                    className="cursor-pointer form-checkbox"
                                                    onChange={() => toggleAllCheckboxes(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Toggle all based on valueType
                                                />
                                                <span className="text-xs sm:text-sm text-nowrap">
                                                    Check All / Uncheck All
                                                </span>
                                            </div>

                                            {/* Individual Check */}
                                            {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none print:px-0 print:py-0 hover:bg-blue-500 hover:text-white"
                                                    onClick={() => handleCheckboxChange(ageCategory, label)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibilityState[ageCategory]?.[label] === false}
                                                        className="cursor-pointer form-checkbox"
                                                        readOnly
                                                    />
                                                    <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                                    <span className="text-xs text-nowrap">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )} 
                            </div>
                        );
                    })}

                    {valueTypes.map((valueType) => {
                        if (renderedValueTypes.has(valueType)) return null;

                        const dataExistsForType = filteredData.some(
                            (data) => data.value_type === valueType && !data.age_category
                        );
                        if (!dataExistsForType) return null;

                        renderedValueTypes.add(valueType);
                        const chartId = `value-${valueType}`;
                        const isMaximized = maximizedCharts[chartId];

                        // Set default selected option for the current age category if it doesn't exist
                        const currentSelectedOption = selectedOptions[valueType] ?? "All"; // Use nullish coalescing operator

                        return (
                            <div key={valueType} 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                                ${currentSelectedOption === "All" || currentSelectedOption === "Customized" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {currentSelectedOption !== "All" && currentSelectedOption !== "Customized" && (
                                    <FontAwesomeIcon
                                        icon={isMaximized ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon xl:block"
                                        onClick={() => toggleSize(chartId)}
                                    />
                                )}
                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`title-menu flex flex-row flex-wrap items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "lg:mr-8" : ""}`}>
                                        <h3 className="flex-1 mb-2 font-semibold text-center sm:flex-none">{capitalize(valueType || "Unknown Value Type")}</h3>
                                        <select 
                                            value={currentSelectedOption} 
                                            onChange={(e) => setSelectedOptions({
                                                ...selectedOptions,
                                                [valueType]: e.target.value,
                                            })} 
                                            className="px-2 py-2 text-[9.5px] lg:text-xs font-bold text-black rounded-lg w-full sm:w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All" className="font-extrabold uppercase">ALL</option>
                                            <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                            {aggregateDataByIndicator(null, valueType).map(({ label }, index) => (
                                                <option key={index} value={label}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Line
                                        data={{
                                            labels,
                                            datasets: aggregateDataByCurrentOption(null, valueType, currentSelectedOption),
                                        }}
                                        options={{
                                            ...options,
                                            plugins: {
                                                ...options.plugins,
                                                legend: {
                                                    display: currentSelectedOption !== "All" && currentSelectedOption !== "Customized", // Hide legend if "All" is selected
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Legend */}
                                {currentSelectedOption === "All" ? (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(null, valueType).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(null, valueType).length > 13 ? "pb-12" : null}`}>
                                            {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                                    <span className="text-xs text-nowrap">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : currentSelectedOption === "Customized" && (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(null, valueType).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
            
                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(null, valueType).length > 13 ? "pb-12" : null}`}>
                                            {/* Check All/Uncheck All Checkbox */}
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                onClick={() => toggleAllCheckboxes(aggregateDataByIndicator(null, valueType), valueType)} // Pass valueType to toggleAllCheckboxes
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={areAllChecked(aggregateDataByIndicator(null, valueType), valueType)} // Check if all datasets are selected
                                                    className="cursor-pointer form-checkbox"
                                                    onChange={() => toggleAllCheckboxes(aggregateDataByIndicator(null, valueType), valueType)} // Toggle all based on valueType
                                                />
                                                <span className="text-xs sm:text-sm text-nowrap">
                                                    Check All / Uncheck All
                                                </span>
                                            </div>

                                            {/* Individual Check */}
                                            {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none print:px-0 print:py-0 hover:bg-blue-500 hover:text-white"
                                                    onClick={() => handleCheckboxChange(valueType, label)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibilityState[valueType]?.[label] === false}
                                                        className="cursor-pointer form-checkbox"
                                                        readOnly
                                                    />
                                                    <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                                    <span className="text-xs text-nowrap">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )} 
                            </div>
                        );
                    })}
                </>
            );
        } else if (hasAgeCategory) {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );

            const validAgeCategories = ageCategories.filter((ageCategory): ageCategory is string => ageCategory !== null);

            return validAgeCategories.map((ageCategory) => {
                if (renderedCategories.has(ageCategory)) return null;

                renderedCategories.add(ageCategory);
                const chartId = `age-${ageCategory}`;
                const isMaximized = maximizedCharts[chartId];

                // Set default selected option for the current age category if it doesn't exist
                const currentSelectedOption = selectedOptions[ageCategory] ?? "All"; // Use nullish coalescing operator

                return (
                    <div key={ageCategory} 
                        className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                        ${currentSelectedOption === "All" || currentSelectedOption === "Customized" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                    >
                        {/* Resize Icon */}
                        {currentSelectedOption !== "All" && currentSelectedOption !== "Customized" && (
                            <FontAwesomeIcon
                                icon={isMaximized ? faMinimize : faMaximize}
                                className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon lg:block"
                                onClick={() => toggleSize(chartId)}
                            />
                        )}
                        {/* Chart */}
                        <div className={`flex-1 xl:w-2/3`}>
                            {/* Chart Title & Dropdown Option */}
                            <div className={`title-menu flex flex-col md:flex-row lg:flex-col items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "lg:mr-8" : ""}`}>
                                <h3 className="mb-2 font-semibold text-center">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                <select 
                                    value={currentSelectedOption} 
                                    onChange={(e) => setSelectedOptions({
                                        ...selectedOptions,
                                        [ageCategory]: e.target.value,
                                    })} 
                                    className="px-2 py-2 text-[9.5px] lg:text-xs font-bold text-black rounded-lg w-full sm:w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                >
                                    <option value="All" className="font-extrabold uppercase">ALL</option>
                                    <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                    {aggregateDataByIndicator(ageCategory, null).map(({ label }, index) => (
                                        <option key={index} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Line
                                data={{
                                    labels,
                                    datasets: aggregateDataByCurrentOption(ageCategory, null, currentSelectedOption),
                                }}
                                options={{
                                    ...options,
                                    plugins: {
                                        ...options.plugins,
                                        legend: {
                                            display: currentSelectedOption !== "All" && currentSelectedOption !== "Customized", // Hide legend if "All" is selected
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Legend */}
                        {currentSelectedOption === "All" ? (
                            <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "pb-12" : null}`}>
                                    {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <span className="inline-block w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                            <span className="text-xs">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : currentSelectedOption === "Customized" && (
                            <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
    
                                <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(ageCategory, null).length > 13 ? "pb-12" : null}`}>
                                    {/* Check All/Uncheck All Checkbox */}
                                    <div
                                        className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                        onClick={() => toggleAllCheckboxes(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Pass valueType to toggleAllCheckboxes
                                    >
                                        <input
                                            type="checkbox"
                                            checked={areAllChecked(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Check if all datasets are selected
                                            className="cursor-pointer form-checkbox"
                                            onChange={() => toggleAllCheckboxes(aggregateDataByIndicator(ageCategory, null), ageCategory)} // Toggle all based on valueType
                                        />
                                        <span className="text-xs sm:text-sm text-nowrap">
                                            Check All / Uncheck All
                                        </span>
                                    </div>

                                    {/* Individual Check */}
                                    {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none print:px-0 print:py-0 hover:bg-blue-500 hover:text-white"
                                            onClick={() => handleCheckboxChange(ageCategory, label)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visibilityState[ageCategory]?.[label] === false}
                                                className="cursor-pointer form-checkbox"
                                                readOnly
                                            />
                                            <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                            <span className="text-xs">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} 
                    </div>
                );
            });
        } else if (hasValueType) {
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );

            return valueTypes.map((valueType) => {
                if (renderedValueTypes.has(valueType)) return null;

                renderedValueTypes.add(valueType);
                const chartId = `value-${valueType}`;
                const isMaximized = maximizedCharts[chartId];

                // Set default selected option for the current age category if it doesn't exist
                const currentSelectedOption = selectedOptions[valueType] ?? "All"; // Use nullish coalescing operator

                return (
                    <div key={valueType} 
                        className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                        ${currentSelectedOption === "All" || currentSelectedOption === "Customized" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                    >
                        {/* Resize Icon */}
                        {currentSelectedOption !== "All" && currentSelectedOption !== "Customized" && (
                            <FontAwesomeIcon
                                icon={isMaximized ? faMinimize : faMaximize}
                                className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon xl:block"
                                onClick={() => toggleSize(chartId)}
                            />
                        )}
                        {/* Chart */}
                        <div className={`flex-1 xl:w-2/3`}>
                            {/* Chart Title & Dropdown Option */}
                            <div className={`title-menu flex flex-row items-center flex-wrap justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "lg:mr-8" : ""}`}>
                                <h3 className="flex-1 mb-2 font-semibold text-center sm:text-left">{capitalize(valueType || "Unknown Value Type")}</h3>
                                <select 
                                    value={currentSelectedOption} 
                                    onChange={(e) => setSelectedOptions({
                                        ...selectedOptions,
                                        [valueType]: e.target.value,
                                    })} 
                                    className="flex-1 px-2 py-2 text-[9.5px] lg:text-xs font-bold text-black rounded-lg w-full sm:w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                >
                                    <option value="All" className="font-extrabold uppercase">ALL</option>
                                    <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                    {aggregateDataByIndicator(null, valueType).map(({ label }, index) => (
                                        <option key={index} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Line
                                data={{
                                    labels,
                                    datasets: aggregateDataByCurrentOption(null, valueType, currentSelectedOption),
                                }}
                                options={{
                                    ...options,
                                    plugins: {
                                        ...options.plugins,
                                        legend: {
                                            display: currentSelectedOption !== "All" && currentSelectedOption !== "Customized", // Hide legend if "All" is selected
                                        }
                                    }
                                }}
                            />
                        </div>
                        
                        {/* Legend */}
                        {currentSelectedOption === "All" ? (
                            <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(null, valueType).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(null, valueType).length > 13 ? "pb-12" : null}`}>
                                    {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                            <span className="text-xs">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : currentSelectedOption === "Customized" && (
                            <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByIndicator(null, valueType).length > 13 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
    
                                <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByIndicator(null, valueType).length > 13 ? "pb-12" : null}`}>
                                    {/* Check All/Uncheck All Checkbox */}
                                    <div
                                        className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                        onClick={() => toggleAllCheckboxes(aggregateDataByIndicator(null, valueType), valueType)} // Pass valueType to toggleAllCheckboxes
                                    >
                                        <input
                                            type="checkbox"
                                            checked={areAllChecked(aggregateDataByIndicator(null, valueType), valueType)} // Check if all datasets are selected
                                            className="cursor-pointer form-checkbox"
                                            onChange={() => toggleAllCheckboxes(aggregateDataByIndicator(null, valueType), valueType)} // Toggle all based on valueType
                                        />
                                        <span className="text-xs sm:text-sm text-nowrap">
                                            Check All / Uncheck All
                                        </span>
                                    </div>

                                    {/* Individual Check */}
                                    {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none print:px-0 print:py-0 hover:bg-blue-500 hover:text-white"
                                            onClick={() => handleCheckboxChange(valueType, label)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visibilityState[valueType]?.[label] === false}
                                                className="cursor-pointer form-checkbox"
                                                readOnly
                                            />
                                            <span className="w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
                                            <span className="text-xs">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} 
                    </div>
                );
            });
        }

        return <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="text-center">
                        No submitted reports were found for Barangay {barangay} for the year {year}. 
                    </h1>
                </div>
    };

    // Month Names
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        
                        // Find the full report_period for the given month name
                        const reportPeriod = serviceData.find(entry => {
                            const [, month] = entry.report_period.split("-");  // Extract month
                            return monthNames[+month - 1] === label;  // Match with the displayed month name
                        })?.report_period || "Unknown";  // Get full report_period (YYYY-MM)

                        const [year, month] = reportPeriod.split("-");
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthNames[monthIndex] || "Unknown";
                        
                        return `Report Period: ${year}, ${monthName}`;
                    },
                    label: (tooltipItem: any) =>
                        `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
                },
            },
            legend: {
                position: "bottom", // Ensure this matches one of the allowed values
                labels: {
                    textAlign: "left",
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        layout: {
            padding: {
                right: 50,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                labels: [...new Set(serviceData.map(({ report_period }) => monthNames[+report_period.split("-")[1] - 1] || "Unknown"))],
            },
            y: {
                title: {
                    display: true,
                    text: "Number of People",
                },
            },
        },
    };

    useEffect(() => {
        decrementLoading();
    }, [serviceData])

    useEffect(() => {
        if(selectedService !== "Modern FP Unmet Need" && selectedService !== "Family Planning" && options) {
            if(selectedService === "Teenage Pregnancy") {
                const ageCategories = Array.from(
                    new Set(filteredData.map((data) => data.age_category))
                );
    
                // Generate full datasets for dropdown options
                const fullDatasets = ageCategories.map((ageCategory) => {
                    const validAgeCategory = ageCategory || "Unknown Age Category";
                    return {
                        label: validAgeCategory,
                        data: filteredData
                            .filter((data) => data.age_category === validAgeCategory)
                            .map((data) => data.value),
                        borderColor: ageCategoryColors[validAgeCategory] || "#000000",
                        backgroundColor: ageCategoryColors[validAgeCategory] || "#000000",
                    };
                });
    
                // Ensure selectedOptions is initialized properly
                const currentOption = selectedOptions["Teenage Pregnancy"] || "All"; // Default to "All" if not defined
    
                // Filtered datasets for display based on selected option
                const datasets = fullDatasets.filter((dataset) => {
                    return currentOption === "All" || dataset.label === currentOption;
                }).map((dataset) => {
                    // Adjusted label
                    const adjustedLabel = dataset.label === "12 and below" 
                        ? "12 years old and below" 
                        : dataset.label === "20 and above" 
                            ? "20 years old and above" 
                            : `${dataset.label} years old`;
    
                    // Structure the dataset in the required format
                    return {
                        label: adjustedLabel,
                        data: filteredData
                            .filter((data) => data.age_category === dataset.label) // Filter based on the label
                            .map((data) => data.value),
                        borderColor: dataset.borderColor,
                        backgroundColor: dataset.backgroundColor,
                    };
                });

                const serviceDataChart = {
                    title: `${barangay === "all" ? "All Barangay" : `Barangay ${capitalize(barangay)}`} - ${selectedService} Planning Chart - ${year}`,
                    "Teenage Pregnancy": {
                        data: { labels: labels, datasets: datasets  },
                        options: options,        // Female chart options object
                        selectedOption: selectedOptions["Teenage Pregnancy"] || "All",
                    }
                };
        
                const charts = {
                    serviceDataChart: serviceDataChart,
                }
                
                // Store the data in localStorage
                localStorage.setItem('charts', JSON.stringify(charts));
            } else {
                const serviceDataChart = {
                    title: `${barangay === "all" ? "All Barangay" : `Barangay ${capitalize(barangay)}`} - ${selectedService} Planning Chart - ${year}`,
                    "10-14": {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption("10-14", null, selectedOptions["10-14"] || "All")},
                        options: options,
                        selectedOption: selectedOptions["10-14"] || "All",
                    },
                    "15-19": {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption("15-19", null, selectedOptions["15-19"] || "All")},
                        options: options,
                        selectedOption: selectedOptions["15-19"] || "All",
                    },
                    "20-49": {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption("20-49", null, selectedOptions["20-49"] || "All")},
                        options: options,
                        selectedOption: selectedOptions["20-49"] || "All",
                    },
                    male: {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption(null, "male",selectedOptions["male"] || "All")}, // Function that returns the data for male chart
                        options: options,         // Male chart options object
                        selectedOption: selectedOptions["male"] || "All",
                    },
                    female: {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption(null, "female", selectedOptions["female"] || "All")}, // Function that returns the data for female chart
                        options: options,        // Female chart options object
                        selectedOption: selectedOptions["female"] || "All",
                    },
                    total: {
                        data: {labels: labels, datasets: aggregateDataByCurrentOption(null, "total", selectedOptions["total"] || "All")}, // Function that returns the data for female chart
                        options: options,        // Female chart options object
                        selectedOption: selectedOptions["total"] || "All",
                    },
                };
        
                const charts = {
                    serviceDataChart: serviceDataChart,
                }
                
                // Store the data in localStorage
                localStorage.setItem('charts', JSON.stringify(charts));
            }
        }
    }, [selectedService, selectedOptions, options, serviceData, visibilityState]);

    useEffect(() => {
        if(selectedService !== "Family Planning" && selectedService !== "Modern FP Unmet Need") {
            setIsButtonDisabled(!(serviceData.length > 0))
        }
    }, [selectedService, serviceData, barangay, year]); // Dependencies without chartRef

    const { isMinimized } = useSidebarContext();
    return (
        <>
            {error ? (
                <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="font-bold text-center text-red-500">
                        Error: {error}
                    </h1>
                </div>
            ) : (
                <>
                    <select
                        className={`self-center ${isMinimized ? "w-11/12" : "w-full"} px-2 py-2 text-xs rounded-lg justify-self-center-center sm:text-sm shadow-md shadow-[#a3a19d]`}
                        onChange={handleServiceChange}
                        value={selectedService}
                    >
                        <option hidden>Select a Service</option>
                        <option value="Modern FP Unmet Need">Modern FP Unmet Need</option>
                        <option value="Family Planning">Family Planning</option>
                        {services.map((service, index) => (
                            <option key={index} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>
                    
                    <section 
                        className="flex flex-col items-center my-8 bg-almond" id="myChart" ref={chartRef}
                    >
                        <h1 id="chart-title" className={`p-2 text-sm font-bold text-center text-white align-middle rounded-lg sm:text-lg bg-green ${isMinimized ? "w-11/12" : "w-full"}`} ref={textRef}>{selectedService}</h1>

                        <div className={`flex flex-col items-center ${isMinimized ? "w-11/12" : "w-full"} gap-8 print:w-full chart-container`}>
                            {selectedService !== "Family Planning" ? (
                                selectedService !== "Modern FP Unmet Need" ? (
                                    serviceData.length > 0 ? (
                                        renderCharts()
                                    ) : (
                                        (barangay ?? "") === "" ? (
                                            <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                                                <h1 className="text-center">
                                                    It seems no valid barangay has been selected. Kindly choose one from the list.
                                                </h1>
                                            </div>
                                        ) : barangay === "all" ? (
                                            <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                                                <h1 className="text-center">
                                                    No submitted reports were found for any barangay for the year {year}.
                                                </h1>
                                            </div>
                                        ) : (
                                            <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                                                <h1 className="text-center">
                                                    No submitted reports were found for Barangay {barangay} for the year {year}. 
                                                </h1>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <ModernWRAChart setIsButtonDisabled={setIsButtonDisabled} barangay={barangay} year={year}/>
                                )
                            ) : (
                                <FamilyPlanningChart setIsButtonDisabled={setIsButtonDisabled} barangay={barangay} year={year}/>
                            )}
                        </div>
                    </section>
                </>
                
            )}
        </>
    );
};

export default ServiceDataChart;
