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

const ServiceDataChart: React.FC = () => {
    const [serviceData, setServiceData] = useState<ServiceData[]>([]);
    const [selectedService, setSelectedService] = useState<string>("Modern FP Unmet Need");
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);

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
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (Array.isArray(result)) {
                    setServices(result.map((service: any) => service.service_name));
                } else {
                    throw new TypeError("Expected data to be an array");
                }
            } catch (error: any) {
                setError(error.message);
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
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (Array.isArray(result.data)) {
                    setServiceData(result.data);
                } else {
                    throw new TypeError("Expected data to be an array");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        };

        fetchServiceData();
    }, [selectedService]);

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
                colors[indicatorKey] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
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
    

    const renderCharts = () => {
        const hasAgeCategory = filteredData.some((data) => data.age_category);
        const hasValueType = filteredData.some((data) => data.value_type);

        if (selectedService === "Teenage Pregnancy") {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
    
            const datasets = ageCategories.map((ageCategory) => ({
                label: ageCategory || "Unknown Age Category",
                data: filteredData
                    .filter((data) => data.age_category === ageCategory)
                    .map((data) => data.value), // Assuming the value you want to plot is in the 'value' field
                borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                fill: false,
            }));
    
            return (
                <div className="p-4 bg-white rounded-lg">
                    <h3 className="mb-2 font-medium text-center">Teenage Pregnancy</h3>
                    <Line
                        data={{
                            labels, // Assuming labels is already defined for your x-axis
                            datasets,
                        }}
                        options={options} // Assuming options is already defined for chart customization
                    />
                </div>
            );
        }

        const renderedCategories = new Set();
        const renderedValueTypes = new Set();

        if (hasAgeCategory && hasValueType) {
            // Handle case with both age_category and value_type
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );

            return (
                <>
                    {ageCategories.map((ageCategory) => {
                        // Skip if already rendered
                        if (renderedCategories.has(ageCategory)) return null;

                        // Ensure only age_category charts are rendered for relevant indicators
                        const dataExistsForCategory = filteredData.some(
                            (data) => data.age_category === ageCategory && !data.value_type
                        );
                        if (!dataExistsForCategory) return null;

                        renderedCategories.add(ageCategory);
                        return (
                            <div key={ageCategory} className="p-4 bg-white rounded-lg">
                                <h3 className="font-semibold">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                <Line
                                    data={{
                                        labels,
                                        datasets: aggregateDataByIndicator(ageCategory, null),
                                    }}
                                    options={options}
                                />
                            </div>
                        );
                    })}
                    

                    {valueTypes.map((valueType) => {
                        // Skip if already rendered
                        if (renderedValueTypes.has(valueType)) return null;

                        // Ensure only value_type charts are rendered for relevant indicators
                        const dataExistsForType = filteredData.some(
                            (data) => data.value_type === valueType && !data.age_category
                        );
                        if (!dataExistsForType) return null;

                        renderedValueTypes.add(valueType);
                        return (
                            <div key={valueType} className="p-4 bg-white rounded-lg">
                                <h3 className="font-semibold">{capitalize(valueType || "Unknown Value Type")}</h3>
                                <Line
                                    data={{
                                        labels,
                                        datasets: aggregateDataByIndicator(null, valueType),
                                    }}
                                    options={options}
                                />
                            </div>
                        );
                    })}
                </>
            );
        } else if (hasAgeCategory) {
            // Display charts based on age_category
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
    
            return ageCategories.map((ageCategory) => {
                // Skip if already rendered
                if (renderedCategories.has(ageCategory)) return null;
    
                renderedCategories.add(ageCategory);
                return (
                    <div key={ageCategory} className="p-4 bg-white rounded-lg">
                        <h3 className="font-semibold">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                        <Line
                            data={{
                                labels,
                                datasets: aggregateDataByIndicator(ageCategory, null),
                            }}
                            options={options}
                        />
                    </div>
                );
            });
        } else if (hasValueType) {
            // Display charts based on value_type
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );
    
            return valueTypes.map((valueType) => {
                // Skip if already rendered
                if (renderedValueTypes.has(valueType)) return null;
    
                renderedValueTypes.add(valueType);
                return (
                    <div key={valueType} className="p-4 bg-white rounded-lg">
                        <h3 className="font-semibold">{capitalize(valueType || "Unknown Value Type")}</h3>
                        <Line
                            data={{
                                labels,
                                datasets: aggregateDataByIndicator(null, valueType),
                            }}
                            options={options}
                        />
                    </div>
                );
            });
        }

        return <p>No data available for selected service.</p>;
    };

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
                    text: "Report Period",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Values",
                },
            },
        },
    };

    const downloadChart = () => {
        // Get all canvas elements within the #myChart div
        const canvases = document.querySelectorAll("#myChart canvas");
        
        // Loop through each canvas and download its image
        canvases.forEach((canvas, index) => {
            if (canvas instanceof HTMLCanvasElement) {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `chart_${index + 1}.png`; // Give each file a unique name
                link.click();
            } else {
                alert("Unable to download chart. Please ensure the charts are visible.");
            }
        });
    };
    
    return (
        <>
            <div>
                {error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex flex-row items-center justify-between w-9/12 gap-8 mb-8 options">
                            <select
                                className="flex-1 w-full py-2 pl-2 rounded-lg lg:w-fit"
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
                            <button
                                onClick={downloadChart}
                                className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                            >
                                Download Charts
                            </button>
                        </div>
                        <div className="flex flex-col justify-center w-full gap-8 sm:w-9/12" id="myChart" >
                            {selectedService !== "Family Planning" ? (
                                selectedService !== "Modern FP Unmet Need" ? (
                                    renderCharts()
                                ) : (
                                    <ModernWRAChart />
                                )
                            ) : (
                                <FamilyPlanningChart />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ServiceDataChart;
