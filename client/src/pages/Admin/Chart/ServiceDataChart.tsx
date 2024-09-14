import React, { useEffect, useState } from "react";
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
import Loading from "../../../components/Loading";

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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);

    const capitalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    useEffect(() => {
        const fetchServices = async () => {
            try {
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
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!selectedService) return;

            setLoading(true);
            try {
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
                setLoading(false);
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
                borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
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
                <div>
                    <h3>Teenage Pregnancy</h3>
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
                            <div key={ageCategory}>
                                <h3>{ageCategory || "Unknown Age Category"}</h3>
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
                            <div key={valueType}>
                                <h3>{capitalize(valueType || "Unknown Value Type")}</h3>
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
                    <div key={ageCategory}>
                        <h3>{ageCategory || "Unknown Age Category"}</h3>
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
                    <div key={valueType}>
                        <h3>{capitalize(valueType || "Unknown Value Type")}</h3>
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
    

    return (
        <>
            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <select className="w-fit mb-8 mt-12 py-2 rounded-lg pl-2" onChange={handleServiceChange} value={selectedService}>
                            <option hidden>Select a Service</option>
                            <option value="Modern FP Unmet Need">
                                Modern FP Unmet Need
                            </option>
                            <option value="Family Planning">
                                Family Planning
                            </option>
                            {services.map((service, index) => (
                                <option key={index} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>

                        <div className="w-full flex flex-col justify-center gap-24">
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
            {loading && <Loading />}
        </>
    );
};

export default ServiceDataChart;
