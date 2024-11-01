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
    chartRef: React.RefObject<HTMLDivElement>;
    textRef: React.RefObject<HTMLHeadingElement>;
    barangay: string;
    year: String | null;
}

const ServiceDataChart: React.FC<ServiceDataChartProps> = ({
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
                        body: JSON.stringify({ selectedService, barangay_name: barangay, year: year })
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
    }, [ageCategories]);

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
            const isSelected = currentSelectedOption === "All" || indicator === currentSelectedOption;
            if (!isSelected) return null;
    
            // Create the dataset
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
        }).filter(dataset => dataset !== null); // Filter out null datasets
    };

    const legendColorStyle = (backgroundColor: string) => ({
        backgroundColor: backgroundColor,
        minWidth: '1rem', // Ensures it has a minimum width
        minHeight: '1rem', // Ensures it has a minimum height
        maxWidth: '1rem', // Prevents squishing larger than intended
        maxHeight: '1rem', // Prevents squishing larger than intended
    })

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
                // Return the dataset if "All" is selected or if it matches the selected age category
                return currentOption === "All" ||
                    dataset.label === currentOption;
            }).map((dataset) => {

                // Adjusted label

                const adjustedLabel = dataset.label === "12 and below" 
                                        ? "12 years old and below" 
                                        : dataset.label === "20 and above" 
                                            ? "20 years old and above" 
                                            : `${dataset.label} years old`

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

            const chartId = "teenage-pregnancy"; // Assign a unique id for this chart
            const isMaximized = maximizedCharts[chartId];

            return (
                <div 
                    className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg lg:flex-row transition-all w-full shadow-md shadow-[#a3a19d] 
                        ${currentOption === "All" ? "lg:w-full" : isMaximized ? "lg:w-full" : "lg:w-9/12"}`}
                >
                    {/* Resize Icon */}
                    {currentOption !== "All" && (
                        <FontAwesomeIcon
                            icon={isMaximized ? faMinimize : faMaximize}
                            className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                            onClick={() => toggleSize(chartId)}
                        />
                    )}

                    {/* Chart */}
                    <div className={`flex-1 lg:w-2/3`}>
                        {/* Chart Title & Dropdown Option */}
                        <div className={`flex flex-col items-center justify-between gap-4 px-4 mb-8 ${selectedOptions["Teenage Pregnancy"] !== "All" ? "mr-8" : ""}`}>
                            <h3 className="mb-2 font-medium text-center">Teenage Pregnancy</h3>
                            <select 
                                value={selectedOptions["Teenage Pregnancy"]} 
                                onChange={(e) => setSelectedOptions(prevOptions => ({
                                    ...prevOptions,
                                    "Teenage Pregnancy": e.target.value,
                                }))} 
                                className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-full sm:w-fit bg-green shadow-md shadow-[#a3a19d]"
                            >
                                <option value="All">All</option>
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
                                        display: currentOption !== "All", // Hide legend if "All" is selected
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Legend */}
                    {currentOption === "All" && (
                        <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden h-56 border-r md:h-80 xl:h-[28rem] lg:h-[25rem] xl:max-w-xs">
                            <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                            <div className="flex flex-col-reverse items-center justify-end w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list">
                                {fullDatasets.map((dataset, index) => (
                                    <div key={index} className="flex items-center justify-start w-1/2 gap-2 mb-2 lg:w-full lg:justify-start text">
                                        <span className="w-12 h-4 rounded-sm" style={{backgroundColor: dataset.backgroundColor}}></span>
                                        <span className="text-sm text-nowrap">
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
                                ${currentSelectedOption === "All" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {currentSelectedOption !== "All" && (
                                    <FontAwesomeIcon
                                        icon={isMaximized ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                        onClick={() => toggleSize(chartId)}
                                    />
                                )}
                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`flex flex-col items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "mr-8" : ""}`}>
                                        <h3 className="mb-2 font-semibold text-center">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                        <select 
                                            value={currentSelectedOption} 
                                            onChange={(e) => setSelectedOptions({
                                                ...selectedOptions,
                                                [ageCategory]: e.target.value,
                                            })} 
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-full sm:w-fit bg-green shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All">All</option>
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
                                                    display: currentSelectedOption !== "All", // Hide legend if "All" is selected
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Legend */}
                                {currentSelectedOption === "All" && (
                                    <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden h-56 border-r md:h-80 xl:h-[28rem] lg:h-[25rem] xl:max-w-xs">
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list">
                                            {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
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
                                ${currentSelectedOption === "All" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {currentSelectedOption !== "All" && (
                                    <FontAwesomeIcon
                                        icon={isMaximized ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                        onClick={() => toggleSize(chartId)}
                                    />
                                )}
                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`flex flex-col items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "mr-8" : ""}`}>
                                        <h3 className="mb-2 font-semibold text-center">{capitalize(valueType || "Unknown Value Type")}</h3>
                                        <select 
                                            value={currentSelectedOption} 
                                            onChange={(e) => setSelectedOptions({
                                                ...selectedOptions,
                                                [valueType]: e.target.value,
                                            })} 
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-full sm:w-fit bg-green shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All">All</option>
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
                                                    display: currentSelectedOption !== "All", // Hide legend if "All" is selected
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Legend */}
                                {currentSelectedOption === "All" && (
                                    <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden h-56 border-r md:h-80 xl:h-[28rem] lg:h-[25rem] xl:max-w-xs">
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list">
                                            {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
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
                        ${currentSelectedOption === "All" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                    >
                        {/* Resize Icon */}
                        {currentSelectedOption !== "All" && (
                            <FontAwesomeIcon
                                icon={isMaximized ? faMinimize : faMaximize}
                                className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                onClick={() => toggleSize(chartId)}
                            />
                        )}
                        {/* Chart */}
                        <div className={`flex-1 xl:w-2/3`}>
                            {/* Chart Title & Dropdown Option */}
                            <div className={`flex flex-col items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "mr-8" : ""}`}>
                                <h3 className="mb-2 font-semibold text-center">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                <select 
                                    value={currentSelectedOption} 
                                    onChange={(e) => setSelectedOptions({
                                        ...selectedOptions,
                                        [ageCategory]: e.target.value,
                                    })} 
                                    className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-full sm:w-fit bg-green shadow-md shadow-[#a3a19d]"
                                >
                                    <option value="All">All</option>
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
                                            display: currentSelectedOption !== "All", // Hide legend if "All" is selected
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Legend */}
                        {currentSelectedOption === "All" && (
                            <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden h-56 border-r md:h-80 xl:h-[28rem] lg:h-[25rem] xl:max-w-xs">
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                <div className="w-full h-full p-2 pb-12 overflow-y-auto bg-gray-200 legend-list">
                                    {aggregateDataByIndicator(ageCategory, null).map(({ label, backgroundColor }, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <span className="inline-block w-6 h-4 rounded-sm" style={legendColorStyle(backgroundColor)}></span>
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
                        className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg lg:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                        ${currentSelectedOption === "All" ? "lg:w-full" : isMaximized ? "lg:w-full" : "lg:w-9/12"}`}
                    >
                        {/* Resize Icon */}
                        {currentSelectedOption !== "All" && (
                            <FontAwesomeIcon
                                icon={isMaximized ? faMinimize : faMaximize}
                                className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                onClick={() => toggleSize(chartId)}
                            />
                        )}
                        {/* Chart */}
                        <div className={`flex-1 lg:w-2/3`}>
                            {/* Chart Title & Dropdown Option */}
                            <div className={`flex flex-col items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "mr-8" : ""}`}>
                                <h3 className="mb-2 font-semibold text-center">{capitalize(valueType || "Unknown Value Type")}</h3>
                                <select 
                                    value={currentSelectedOption} 
                                    onChange={(e) => setSelectedOptions({
                                        ...selectedOptions,
                                        [valueType]: e.target.value,
                                    })} 
                                    className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-full sm:w-fit bg-green shadow-md shadow-[#a3a19d]"
                                >
                                    <option value="All">All</option>
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
                                            display: currentSelectedOption !== "All", // Hide legend if "All" is selected
                                        }
                                    }
                                }}
                            />
                        </div>
                        
                        {/* Legend */}
                        {currentSelectedOption === "All" && (
                            <div className="legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden h-56 border-r md:h-80 xl:h-[28rem] lg:h-[25rem] xl:max-w-xs">
                                <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list">
                                    {aggregateDataByIndicator(null, valueType).map(({ label, backgroundColor }, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
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
                    title: (tooltipItems: any) =>
                        `Report Period: ${tooltipItems[0]?.label || "Unknown"}`,
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
                ticks: {
                    callback: (value: string | number) => monthNames[value as number % 12],
                },
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
    }, [])
    
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
                        className="self-center w-full px-2 py-2 text-xs rounded-lg justify-self-center-center sm:text-sm sm:w-9/12 shadow-md shadow-[#a3a19d]"
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
                    
                    <section className="flex flex-col items-center px-4 my-8 bg-almond" id="myChart" ref={chartRef}>
                        <h1 id="chart-title" className="w-full p-2 text-sm font-bold text-center text-white align-middle rounded-lg sm:text-lg sm:w-9/12 bg-green" ref={textRef}>{selectedService}</h1>

                        <div className="flex flex-col items-center w-full gap-8 lg:w-9/12 chart-container">
                            {selectedService !== "Family Planning" ? (
                                selectedService !== "Modern FP Unmet Need" ? (
                                    serviceData.length > 0 ? (
                                        renderCharts()
                                    ) : (
                                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                                            <h1 className="text-center">
                                                No submitted reports were found for Barangay {barangay} for the year {year}. 
                                            </h1>
                                        </div>
                                    )
                                ) : (
                                    <ModernWRAChart barangay={barangay} year={year} />
                                )
                            ) : (
                                <FamilyPlanningChart barangay={barangay} year={year}/>
                            )}
                        </div>
                    </section>
                </>
                
            )}
        </>
    );
};

export default ServiceDataChart;
